/**
 * Mizuki Admin - Cloudflare Worker
 * 无服务器后端 API
 */

const SALT_ROUNDS = 10;

function getJwtSecret(env) {
  const secret = (env && env.JWT_SECRET) || process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  // 拒绝弱 / 示例密钥：HS256 需要足够熵，生产环境必须使用 >= 32 字节随机密钥
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  const WEAK_DEFAULTS = new Set([
    'change-this-in-production',
    'mizuki-admin-secret-key-2024',
    'your-secret-key-here',
    'secret',
  ]);
  if (WEAK_DEFAULTS.has(secret)) {
    throw new Error('JWT_SECRET uses a known weak default value; replace it with a strong random secret');
  }
  return secret;
}

async function hmacSha256(key, data) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, '');
}

async function hmacVerify(key, data, sigB64) {
  const enc = new TextEncoder();
  const padded = sigB64 + '='.repeat((4 - (sigB64.length % 4)) % 4);
  const sigBytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  return crypto.subtle.verify('HMAC', cryptoKey, sigBytes, enc.encode(data));
}

function b64urlEncode(obj) {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
  return JSON.parse(atob(padded));
}

// PBKDF2-HMAC-SHA256 密码哈希（含 salt + iterations 前缀，便于升级）
// 存储格式：pbkdf2_sha256$<iterations>$<salt_b64>$<hash_b64>
const PBKDF2_ITERATIONS = 200000;
const PBKDF2_SALT_BYTES = 16;
const PBKDF2_HASH_BITS = 256;

function b64EncodeUrlNoPad(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64DecodeUrlNoPad(str) {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES));
  const pwKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const hashBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    pwKey, PBKDF2_HASH_BITS
  );
  const hashBytes = new Uint8Array(hashBits);
  return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${b64EncodeUrlNoPad(salt)}$${b64EncodeUrlNoPad(hashBytes)}`;
}
// 验证：支持新的 PBKDF2 格式；遗留兼容旧 SHA-256(password + ':') 空盐格式（已废弃但保留以便迁移）
async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  if (storedHash.startsWith('pbkdf2_sha256$')) {
    const [, iterStr, saltB64, hashB64] = storedHash.split('$');
    const iterations = parseInt(iterStr, 10) || PBKDF2_ITERATIONS;
    const salt = b64DecodeUrlNoPad(saltB64);
    const expected = b64DecodeUrlNoPad(hashB64);
    const pwKey = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password),
      { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const derived = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      pwKey, expected.byteLength * 8
    ));
    if (derived.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ expected[i];
    return diff === 0;
  }
  // 遗留 SHA-256(password + ':') 空盐格式，仅用于向后兼容（旧部署迁移阶段）
  if (/^[a-f0-9]{64}$/.test(storedHash)) {
    const legacy = await _legacySha256EmptySalt(password);
    return legacy === storedHash;
  }
  return false;
}
async function _legacySha256EmptySalt(password) {
  const data = new TextEncoder().encode(password + ':');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createToken(payload, env) {
  const secret = getJwtSecret(env);
  const header = b64urlEncode({ alg: 'HS256', typ: 'JWT' });
  const body = b64urlEncode({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 });
  const signature = await hmacSha256(secret, header + '.' + body);
  return header + '.' + body + '.' + signature;
}

async function verifyToken(token, env) {
  try {
    const secret = getJwtSecret(env);
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    let headerObj;
    try { headerObj = b64urlDecode(header); } catch { return null; }
    if (headerObj.alg !== 'HS256') return null;
    const valid = await hmacVerify(secret, header + '.' + body, signature);
    if (!valid) return null;
    let payload;
    try { payload = b64urlDecode(body); } catch { return null; }
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// 判断是否为写操作（INSERT / UPDATE / DELETE）
function isWriteQuery(sql) {
  const trimmed = sql.trim().toUpperCase();
  return trimmed.startsWith('INSERT') || trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE');
}

// 安全解析分页参数，防止 NaN 传入 SQL 导致崩溃
function parsePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10) || 10));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

// 数据库操作：读操作用 .all()，写操作用 .run() 以正确返回 meta 信息
async function queryDB(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const isWrite = isWriteQuery(sql);
  if (params.length > 0) {
    const bound = stmt.bind(...params);
    return isWrite ? bound.run() : bound.all();
  }
  return isWrite ? stmt.run() : stmt.all();
}

// CORS 头
function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Vary': 'Origin',
  };
}

// 角色权限校验（与 Express server 对齐）
const ROLES = { admin: 3, editor: 2, viewer: 1 };
function hasRole(user, allowedRoles) {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}
function requireRole(user, allowedRoles) {
  if (!hasRole(user, allowedRoles)) {
    return {
      success: false,
      message: '权限不足',
      status: 403,
    };
  }
  return null;
}

// 简单 IP 级别速率限制（Worker 无内存，用 Map + 时间窗）
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 分钟
const RATE_LIMIT_MAX = 15; // 每窗口最多请求数
const rateLimitStore = new Map(); // key: `${ip}|${bucket}`, value:{count, resetAt}
function checkRateLimit(ip, bucket, max = RATE_LIMIT_MAX) {
  const now = Date.now();
  const key = `${ip}|${bucket}`;
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (entry.count >= max) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true };
}
function getClientIp(request, env) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0].trim()
    || 'unknown';
}
function getAllowedOrigins(env) {
  const raw = (env && env.FRONTEND_URL) || process.env.FRONTEND_URL || '';
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}
function resolveCorsOrigin(request, env) {
  const allowed = getAllowedOrigins(env);
  if (allowed.length === 0) {
    // 默认白名单：本地开发地址
    return ['http://localhost:3001', 'http://localhost:5173'];
  }
  const origin = request.headers.get('Origin');
  if (origin && allowed.includes(origin)) {
    return origin;
  }
  // 非允许 Origin 请求，回 null 而非 * 避免泄露
  return allowed[0];
}

// 统一 JSON 响应构造器（自动注入正确 CORS origin）
function jsonResponse(body, status = 200, request = null, env = null) {
  const origin = (request && env) ? resolveCorsOrigin(request, env) : '*';
  const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' };
  return new Response(JSON.stringify(body), { status, headers });
}
function roleResponse(roleErr, request, env) {
  return jsonResponse({ success: false, message: roleErr.message }, roleErr.status, request, env);
}
function rateLimitResponse(retryAfter, request, env) {
  const origin = resolveCorsOrigin(request, env);
  return new Response(JSON.stringify({ success: false, message: '请求过于频繁，请稍后再试' }), {
    status: 429,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfter),
    },
  });
}

// 路由处理
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  const method = request.method;
  const clientIp = getClientIp(request, env);

  // 处理 CORS 预检
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(resolveCorsOrigin(request, env)) });
  }

  // 健康检查
  if (path === '/health') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200, request, env);
  }

  // 解析 token
  const authHeader = request.headers.get('Authorization');
  let user = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    user = await verifyToken(authHeader.slice(7), env);
  }

  // 路由匹配
  try {
    // 登录（加速率限制）
    if (path === '/auth/login' && method === 'POST') {
      const rl = checkRateLimit(clientIp, 'auth_login', 10);
      if (!rl.ok) return rateLimitResponse(rl.retryAfter, request, env);

      const { username, password } = await request.json();
      if (!username || !password) {
        return jsonResponse({ success: false, message: '用户名和密码不能为空' }, 400, request, env);
      }
      const results = await queryDB(env.DB, 'SELECT * FROM users WHERE username = ?', [username]);

      if (results.results.length === 0) {
        return jsonResponse({ success: false, message: '用户名或密码错误' }, 401, request, env);
      }

      const record = results.results[0];
      if (record.status === 'inactive') {
        return jsonResponse({ success: false, message: '账户已被禁用' }, 403, request, env);
      }

      const passwordValid = await verifyPassword(password, record.password);
      if (!passwordValid) {
        return jsonResponse({ success: false, message: '用户名或密码错误' }, 401, request, env);
      }

      const token = await createToken({ id: record.id, username: record.username, role: record.role }, env);
      await queryDB(env.DB,
        'INSERT INTO logs (user_id, action, target_type, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [record.id, 'LOGIN', 'user', clientIp, request.headers.get('User-Agent') || '']
      );

      return jsonResponse({
        success: true,
        data: { token, user: { id: record.id, username: record.username, email: record.email, role: record.role } },
      }, 200, request, env);
    }

    // 注册（加速率限制，默认关闭；仅当 REGISTRATION_ENABLED=true 时打开）
    if (path === '/auth/register' && method === 'POST') {
      const registrationEnabled = (env && env.REGISTRATION_ENABLED === 'true') || process.env.REGISTRATION_ENABLED === 'true';
      if (!registrationEnabled) {
        return jsonResponse({ success: false, message: '注册功能已关闭，请联系管理员' }, 403, request, env);
      }
      const rl = checkRateLimit(clientIp, 'auth_register', 5);
      if (!rl.ok) return rateLimitResponse(rl.retryAfter, request, env);

      const { username, password, email } = await request.json();
      if (!username || !password) {
        return jsonResponse({ success: false, message: '用户名和密码不能为空' }, 400, request, env);
      }
      const existing = await queryDB(env.DB, 'SELECT id FROM users WHERE username = ?', [username]);
      if (existing.results.length > 0) {
        return jsonResponse({ success: false, message: '用户名已存在' }, 400, request, env);
      }
      const passwordHash = await hashPassword(password);
      await queryDB(env.DB,
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, passwordHash, email || null, 'viewer']
      );

      return jsonResponse({ success: true, message: '注册成功' }, 201, request, env);
    }

    // 需要认证的路由
    if (!user) {
      return jsonResponse({ success: false, message: '未认证' }, 401, request, env);
    }

    // 获取用户资料（已登录用户均可访问自己的）
    if (path === '/auth/profile' && method === 'GET') {
      const results = await queryDB(env.DB, 'SELECT id, username, email, role, status, created_at FROM users WHERE id = ?', [user.id]);
      return jsonResponse({ success: true, data: results.results[0] }, 200, request, env);
    }

    // 获取所有用户  admin,editor
    if (path === '/users' && method === 'GET') {
      const err = requireRole(user, ['admin', 'editor']);
      if (err) return roleResponse(err, request, env);
      const results = await queryDB(env.DB, 'SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC');
      return jsonResponse({ success: true, data: results.results, total: results.results.length }, 200, request, env);
    }

    // 按 ID 获取用户  admin,editor
    const userMatch = path.match(/^\/users\/(\d+)$/);
    if (userMatch && method === 'GET') {
      const err = requireRole(user, ['admin', 'editor']);
      if (err) return roleResponse(err, request, env);
      const id = userMatch[1];
      const results = await queryDB(env.DB, 'SELECT id, username, email, role, status, created_at FROM users WHERE id = ?', [id]);
      if (results.results.length === 0) return jsonResponse({ success: false, message: '用户不存在' }, 404, request, env);
      return jsonResponse({ success: true, data: results.results[0] }, 200, request, env);
    }

    // 创建用户  admin
    if (path === '/users' && method === 'POST') {
      const err = requireRole(user, ['admin']);
      if (err) return roleResponse(err, request, env);
      const { username, password, email, role } = await request.json();
      if (!username || !password) {
        return jsonResponse({ success: false, message: '用户名和密码不能为空' }, 400, request, env);
      }
      const existing = await queryDB(env.DB, 'SELECT id FROM users WHERE username = ?', [username]);
      if (existing.results.length > 0) {
        return jsonResponse({ success: false, message: '用户名已存在' }, 400, request, env);
      }
      const allowedRole = ['admin', 'editor', 'viewer'].includes(role) ? role : 'viewer';
      const passwordHash = await hashPassword(password);
      const r = await queryDB(env.DB,
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, passwordHash, email || null, allowedRole]
      );
      return jsonResponse({ success: true, message: '用户创建成功', data: { id: r.meta?.last_row_id } }, 201, request, env);
    }

    // 更新用户  admin
    if (userMatch && method === 'PUT') {
      const err = requireRole(user, ['admin']);
      if (err) return roleResponse(err, request, env);
      const id = userMatch[1];
      const { email, role, status } = await request.json();
      const updates = []; const values = [];
      if (email !== undefined) { updates.push('email = ?'); values.push(email); }
      if (role !== undefined && ['admin', 'editor', 'viewer'].includes(role)) { updates.push('role = ?'); values.push(role); }
      if (status !== undefined && ['active', 'inactive'].includes(status)) { updates.push('status = ?'); values.push(status); }
      if (updates.length === 0) return jsonResponse({ success: false, message: '没有需要更新的字段' }, 400, request, env);
      values.push(id);
      await queryDB(env.DB, `UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
      return jsonResponse({ success: true, message: '用户更新成功' }, 200, request, env);
    }

    // 删除用户  admin
    if (userMatch && method === 'DELETE') {
      const err = requireRole(user, ['admin']);
      if (err) return roleResponse(err, request, env);
      const id = parseInt(userMatch[1], 10);
      if (id === user.id) return jsonResponse({ success: false, message: '不能删除当前登录用户' }, 400, request, env);
      const result = await queryDB(env.DB, 'DELETE FROM users WHERE id = ?', [id]);
      if ((result.meta?.changes || 0) === 0) return jsonResponse({ success: false, message: '用户不存在' }, 404, request, env);
      return jsonResponse({ success: true, message: '用户删除成功' }, 200, request, env);
    }

    // 获取所有文章  admin,editor,viewer
    if (path === '/posts' && method === 'GET') {
      const err = requireRole(user, ['admin', 'editor', 'viewer']);
      if (err) return roleResponse(err, request, env);
      const { page, pageSize, offset } = parsePagination(url.searchParams);

      const results = await queryDB(env.DB,
        `SELECT p.*, u.username as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        [pageSize, offset]
      );

      const countResult = await queryDB(env.DB, 'SELECT COUNT(*) as total FROM posts');
      const total = countResult.results[0].total;

      return jsonResponse({ success: true, data: results.results, total, page, pageSize }, 200, request, env);
    }

    // 创建文章  admin,editor
    if (path === '/posts' && method === 'POST') {
      const err = requireRole(user, ['admin', 'editor']);
      if (err) return roleResponse(err, request, env);
      const { title, content, slug, category, tags, status } = await request.json();
      if (!title) return jsonResponse({ success: false, message: '标题不能为空' }, 400, request, env);
      await queryDB(env.DB,
        'INSERT INTO posts (title, content, slug, category, tags, status, author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, content || '', slug || null, category || null, JSON.stringify(tags || []), status || 'draft', user.id]
      );
      return jsonResponse({ success: true, message: '文章创建成功' }, 201, request, env);
    }

    // 获取单篇文章  admin,editor,viewer
    const postMatch = path.match(/^\/posts\/(\d+)$/);
    if (postMatch && method === 'GET') {
      const err = requireRole(user, ['admin', 'editor', 'viewer']);
      if (err) return roleResponse(err, request, env);
      const id = postMatch[1];
      const results = await queryDB(env.DB,
        `SELECT p.*, u.username as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = ?`, [id]);
      if (results.results.length === 0) return jsonResponse({ success: false, message: '文章不存在' }, 404, request, env);
      return jsonResponse({ success: true, data: results.results[0] }, 200, request, env);
    }

    // 更新文章  admin,editor
    if (postMatch && method === 'PUT') {
      const err = requireRole(user, ['admin', 'editor']);
      if (err) return roleResponse(err, request, env);
      const id = postMatch[1];
      const { title, content, slug, category, tags, status } = await request.json();
      const updates = []; const values = [];
      if (title !== undefined) { updates.push('title = ?'); values.push(title); }
      if (content !== undefined) { updates.push('content = ?'); values.push(content); }
      if (slug !== undefined) { updates.push('slug = ?'); values.push(slug === '' || slug === null ? null : slug); }
      if (category !== undefined) { updates.push('category = ?'); values.push(category); }
      if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags)); }
      if (status !== undefined) { updates.push('status = ?'); values.push(status); }
      if (updates.length === 0) return jsonResponse({ success: false, message: '没有需要更新的字段' }, 400, request, env);
      values.push(id);
      await queryDB(env.DB, `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`, values);
      return jsonResponse({ success: true, message: '文章更新成功' }, 200, request, env);
    }

    // 删除文章  admin
    if (postMatch && method === 'DELETE') {
      const err = requireRole(user, ['admin']);
      if (err) return roleResponse(err, request, env);
      const id = postMatch[1];
      await queryDB(env.DB, 'DELETE FROM posts WHERE id = ?', [id]);
      return jsonResponse({ success: true, message: '文章删除成功' }, 200, request, env);
    }

    // 获取所有评论  admin,editor
    if (path === '/comments' && method === 'GET') {
      const err = requireRole(user, ['admin', 'editor']);
      if (err) return roleResponse(err, request, env);
      const results = await queryDB(env.DB,
        `SELECT c.*, p.title as post_title FROM comments c LEFT JOIN posts p ON c.post_id = p.id ORDER BY c.created_at DESC`
      );
      return jsonResponse({ success: true, data: results.results, total: results.results.length }, 200, request, env);
    }

    // 更新评论状态  admin,editor
    const commentMatch = path.match(/^\/comments\/(\d+)$/);
    if (commentMatch && method === 'PUT') {
      const err = requireRole(user, ['admin', 'editor']);
      if (err) return roleResponse(err, request, env);
      const id = commentMatch[1];
      const { status } = await request.json();
      await queryDB(env.DB, 'UPDATE comments SET status = ? WHERE id = ?', [status, id]);
      return jsonResponse({ success: true, message: '评论状态更新成功' }, 200, request, env);
    }

    // 删除评论  admin
    if (commentMatch && method === 'DELETE') {
      const err = requireRole(user, ['admin']);
      if (err) return roleResponse(err, request, env);
      const id = commentMatch[1];
      await queryDB(env.DB, 'DELETE FROM comments WHERE id = ?', [id]);
      return jsonResponse({ success: true, message: '评论删除成功' }, 200, request, env);
    }

    // 获取仪表盘统计  admin
    if (path === '/dashboard/stats' && method === 'GET') {
      const err = requireRole(user, ['admin']);
      if (err) return roleResponse(err, request, env);
      const postsResult = await queryDB(env.DB, 'SELECT COUNT(*) as total, SUM(status = "published") as published FROM posts');
      const usersResult = await queryDB(env.DB, 'SELECT COUNT(*) as total FROM users');
      const commentsResult = await queryDB(env.DB, 'SELECT COUNT(*) as total, SUM(status = "pending") as pending FROM comments');

      return jsonResponse({
        success: true,
        data: {
          posts: { total: postsResult.results[0].total, published: postsResult.results[0].published || 0 },
          users: { total: usersResult.results[0].total },
          comments: { total: commentsResult.results[0].total, pending: commentsResult.results[0].pending || 0 },
        },
      }, 200, request, env);
    }

    // 获取设置  admin
    if (path === '/settings' && method === 'GET') {
      const err = requireRole(user, ['admin']);
      if (err) return roleResponse(err, request, env);
      const results = await queryDB(env.DB, 'SELECT * FROM settings');
      const settings = {};
      results.results.forEach(s => { settings[s.key_name] = s.value; });
      return jsonResponse({ success: true, data: settings }, 200, request, env);
    }

    // 更新设置  admin
    if (path === '/settings' && method === 'PUT') {
      const err = requireRole(user, ['admin']);
      if (err) return roleResponse(err, request, env);
      const { key, value, description } = await request.json();
      if (!key) return jsonResponse({ success: false, message: '设置键不能为空' }, 400, request, env);
      const existing = await queryDB(env.DB, 'SELECT id FROM settings WHERE key_name = ?', [key]);
      if (existing.results.length > 0) {
        await queryDB(env.DB, 'UPDATE settings SET value = ?, description = ? WHERE key_name = ?', [value, description || null, key]);
      } else {
        await queryDB(env.DB, 'INSERT INTO settings (key_name, value, description) VALUES (?, ?, ?)', [key, value, description || null]);
      }
      return jsonResponse({ success: true, message: '设置更新成功' }, 200, request, env);
    }

    // 操作日志（含脱敏）
    if (method !== 'GET' && ['POST', 'PUT', 'DELETE'].includes(method)) {
      try {
        await queryDB(env.DB,
          'INSERT INTO logs (user_id, action, target_type, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
          [user.id, `${method} ${path}`, path.split('/')[1] || 'unknown', clientIp, request.headers.get('User-Agent') || '']
        );
      } catch { /* 日志失败不阻塞主流程 */ }
    }

    return jsonResponse({ success: false, message: 'API 路由不存在' }, 404, request, env);

  } catch (error) {
    // 生产环境：不回显 error.message，仅服务端日志记录
    if (typeof console !== 'undefined' && console.error) {
      console.error('[API ERROR]', error && error.stack ? error.stack : error);
    }
    return jsonResponse({ success: false, message: '服务器内部错误' }, 500, request, env);
  }
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};
