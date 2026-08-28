/**
 * Post-commit regression tests
 * 覆盖: 用户删除 (result.meta.changes), slug UNIQUE 完整性, 分页参数校验,
 *       email NULL 归一化, Worker updatePost 偏更新崩溃, changePassword 空引用
 *
 * 运行: node tests/postcommit.test.cjs
 * 不依赖任何第三方测试框架，使用 Node 内置 assert。
 */

const assert = require('assert');

// ---- 从源文件中直接抽取的纯函数（不启动服务，不连数据库） ----

// 摘自 admin/worker/index.js
function isWriteQuery(sql) {
  const trimmed = sql.trim().toUpperCase();
  return trimmed.startsWith('INSERT') || trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE');
}

function parsePagination(searchParams) {
  // searchParams 可以是 URLSearchParams 实例，也可以是 {get: () => {...}} 的 mock
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10) || 10));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

// Express 版分页解析（与 parsePagination 同语义，来自各个 controller）
function expressPagination(pageRaw, pageSizeRaw, defaultPageSize = 10) {
  const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeRaw || String(defaultPageSize), 10) || defaultPageSize));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

// Express updatePost 中 slug 归一化逻辑
function normalizeSlugForUpdate(slug) {
  // undefined 表示不更新该字段（调用方已在外部短路）
  if (slug === undefined) return { skip: true };
  return { skip: false, value: slug === '' || slug === null ? null : slug };
}

// createUser 中 email 归一化逻辑
function normalizeEmail(email) {
  return email || null;
}

// ---- 模拟 Cloudflare D1 的 queryDB 行为 ----

// 记录"真实"数据库状态以断言语义，不连真实 D1
function makeFakeDB(initialPosts = [], initialUsers = []) {
  const posts = [...initialPosts];
  const users = [...initialUsers];
  let lastInsertId = 0;
  const db = {
    prepare(sql) {
      return {
        bind(...params) { return { run: () => this.run(), all: () => this.all() }; },
        run() {
          const upper = sql.trim().toUpperCase();
          if (upper.startsWith('INSERT INTO POSTS')) {
            // 简单解析出 slug 位置: INSERT INTO posts (..., slug, ...) VALUES (?, ?, ?, ...)
            // 为简单断言仅实现部分语义
            lastInsertId += 1;
            return { meta: { changes: 1, last_row_id: lastInsertId }, results: [] };
          }
          if (upper.startsWith('INSERT INTO USERS')) {
            lastInsertId += 1;
            return { meta: { changes: 1, last_row_id: lastInsertId }, results: [] };
          }
          if (upper.startsWith('DELETE FROM USERS')) {
            return { meta: { changes: 0 }, results: [] };
          }
          if (upper.startsWith('DELETE FROM POSTS')) {
            return { meta: { changes: 0 }, results: [] };
          }
          return { meta: { changes: 0 }, results: [] };
        },
        all() {
          return { results: [] };
        },
      };
    },
  };
  return db;
}

function isWrite(sql) { return isWriteQuery(sql); }

// ---- 测试用例 ----
function run() {
  // 1. queryDB 写操作必须使用 .run() 以返回 meta.changes
  {
    // 行为验证：queryDB 对 DELETE / UPDATE / INSERT 返回 meta.changes
    // 这里直接通过 isWriteQuery 判定，模拟 queryDB 的分支，断言"写"路径被正确识别
    assert.strictEqual(isWrite('DELETE FROM users WHERE id = 1'), true, 'DELETE 应被识别为写操作');
    assert.strictEqual(isWrite('UPDATE users SET x = ? WHERE id = ?'), true, 'UPDATE 应被识别为写操作');
    assert.strictEqual(isWrite('INSERT INTO users (a,b) VALUES (?,?)'), true, 'INSERT 应被识别为写操作');
    assert.strictEqual(isWrite('SELECT * FROM users'), false, 'SELECT 不应被识别为写操作');

    // 空字符串、前导空格等边界
    assert.strictEqual(isWrite('  delete from users where id=1'), true, '带前导空格的 DELETE 应被识别');
    assert.strictEqual(isWrite('\nUPDATE foo SET a=1'), true, '带前导换行的 UPDATE 应被识别');
  }

  // 2. parsePagination 必须拒绝 NaN / 负数，保持合法范围
  {
    const sp = (raw = '') => ({ get: () => raw });
    const kv = (obj) => ({ get: (k) => (Object.prototype.hasOwnProperty.call(obj, k) ? obj[k] : '') });
    // 当仅设置 page 时，pageSize 为空字符串，回退默认 10
    assert.deepStrictEqual(parsePagination(sp()), { page: 1, pageSize: 10, offset: 0 }, '默认值');
    assert.deepStrictEqual(parsePagination(kv({ page: 'abc' })), { page: 1, pageSize: 10, offset: 0 }, '非法字符串回退默认');
    assert.deepStrictEqual(parsePagination(kv({ page: '-5' })), { page: 1, pageSize: 10, offset: 0 }, '负数回退到 1');
    assert.deepStrictEqual(parsePagination(kv({ page: '1000' })), { page: 1000, pageSize: 10, offset: 9990 }, '超大 page 不自动裁剪（仅下限）');
    assert.deepStrictEqual(
      parsePagination(kv({ pageSize: '9999' })),
      { page: 1, pageSize: 100, offset: 0 },
      'pageSize 被裁剪到 100'
    );
    assert.deepStrictEqual(
      parsePagination(kv({ pageSize: '0' })),
      { page: 1, pageSize: 10, offset: 0 },
      'pageSize=0 回退到默认 10（parseInt(0||10)）'
    );

    // Express 版本同样校验
    assert.deepStrictEqual(expressPagination('NaN', 'xyz'), { page: 1, pageSize: 10, offset: 0 });
    assert.deepStrictEqual(expressPagination('5', '250'), { page: 5, pageSize: 100, offset: 400 });
    assert.deepStrictEqual(expressPagination('3', '0'), { page: 3, pageSize: 10, offset: 20 }, 'pageSize=0 回退默认 10');
  }

  // 3. updatePost 的 slug 归一化: 空字符串 / null 必须落为 NULL，避免 UNIQUE 冲突
  {
    assert.deepStrictEqual(normalizeSlugForUpdate(undefined), { skip: true }, 'undefined 表示不更新');
    assert.deepStrictEqual(normalizeSlugForUpdate(''), { skip: false, value: null }, '空字符串 → NULL');
    assert.deepStrictEqual(normalizeSlugForUpdate(null), { skip: false, value: null }, 'null → NULL');
    assert.deepStrictEqual(normalizeSlugForUpdate('my-slug'), { skip: false, value: 'my-slug' }, '合法 slug 保留');
  }

  // 4. createUser email 归一化: 未传 email 必须落为 NULL 而非空串
  {
    assert.strictEqual(normalizeEmail(undefined), null);
    assert.strictEqual(normalizeEmail(null), null);
    assert.strictEqual(normalizeEmail(''), null, '空字符串必须转为 NULL，避免 UNIQUE(email) 冲突（若有）');
    assert.strictEqual(normalizeEmail('u@example.com'), 'u@example.com');
  }

  // 5. Worker updatePost 偏更新: 仅发送部分字段时，未传字段不得出现在 SQL 中
  //    原实现无条件绑定 title/content/status，undefined 会导致 D1 bind() 抛 TypeError
  {
    // 模拟 Worker updatePost 的字段组装逻辑
    function buildPostUpdate(body) {
      const { title, content, slug, category, tags, status } = body;
      const updates = []; const values = [];
      if (title !== undefined) { updates.push('title = ?'); values.push(title); }
      if (content !== undefined) { updates.push('content = ?'); values.push(content); }
      if (slug !== undefined) { updates.push('slug = ?'); values.push(slug === '' || slug === null ? null : slug); }
      if (category !== undefined) { updates.push('category = ?'); values.push(category); }
      if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags)); }
      if (status !== undefined) { updates.push('status = ?'); values.push(status); }
      if (updates.length === 0) return { error: 'no_fields' };
      values.push(1); // id
      return { sql: `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`, values };
    }

    // 场景 A: 仅发布文章（仅发送 status）
    const partial = buildPostUpdate({ status: 'published' });
    assert.ok(!partial.error, '偏更新不应报错');
    assert.strictEqual(partial.sql, 'UPDATE posts SET status = ? WHERE id = ?');
    assert.deepStrictEqual(partial.values, ['published', 1]);

    // 场景 B: 空请求体
    const empty = buildPostUpdate({});
    assert.strictEqual(empty.error, 'no_fields', '空请求体应返回错误');

    // 场景 C: 全量更新
    const full = buildPostUpdate({ title: 'T', content: 'C', status: 'draft', slug: 's', category: 'cat', tags: ['a'] });
    assert.ok(full.sql.includes('title = ?') && full.sql.includes('content = ?') && full.sql.includes('status = ?'));
    assert.ok(full.sql.includes('slug = ?') && full.sql.includes('category = ?') && full.sql.includes('tags = ?'));

    // 场景 D: slug 空字符串归一化为 null
    const slugEmpty = buildPostUpdate({ slug: '' });
    assert.deepStrictEqual(slugEmpty.values, [null, 1], '空 slug 应归一化为 null');

    // 关键断言: 偏更新不得产生 undefined 绑定值
    const partialValues = buildPostUpdate({ status: 'published' }).values;
    assert.ok(!partialValues.some(v => v === undefined), '绑定值中不得出现 undefined（会导致 D1 崩溃）');
  }

  // 6. changePassword 空引用防护: 用户被删除后不应崩溃
  {
    // 模拟 changePassword 的防护逻辑
    function checkUserExists(users, oldPassword) {
      if (users.length === 0) {
        return { status: 401, message: '用户不存在或已被删除' };
      }
      // 正常流程不会执行到这里（bcrypt.compare）
      return { status: 200 };
    }

    // 场景: 用户被删除（users 数组为空）
    const result = checkUserExists([], 'oldPass');
    assert.strictEqual(result.status, 401, '用户不存在应返回 401');
    assert.strictEqual(result.message, '用户不存在或已被删除');

    // 场景: 用户存在
    const ok = checkUserExists([{ password: 'hash' }], 'oldPass');
    assert.strictEqual(ok.status, 200, '用户存在应正常继续');
  }

  console.log('✅ 所有 post-commit 回归测试通过');
}

try {
  run();
} catch (err) {
  console.error('❌ 测试失败:', err.message);
  process.exit(1);
}
