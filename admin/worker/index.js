/**
 * Mizuki Admin - Cloudflare Worker
 * 无服务器后端 API
 */

const JWT_SECRET = 'change-this-in-production';
const SALT_ROUNDS = 10;

// 简单的密码哈希
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 简单的 JWT 实现
async function createToken(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = btoa(JSON.stringify({ ...payload, exp: Date.now() + 86400000 }));
  const signature = await hashPassword(`${header}.${payloadStr}`);
  return `${header}.${payloadStr}.${signature}`;
}

async function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSig = await hashPassword(`${header}.${payload}`);
    if (signature !== expectedSig) return null;
    const data = JSON.parse(atob(payload));
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// 数据库操作
async function queryDB(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    return stmt.bind(...params).all();
  }
  return stmt.all();
}

// CORS 头
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// 路由处理
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  const method = request.method;

  // 处理 CORS 预检
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // 健康检查
  if (path === '/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // 解析 token
  const authHeader = request.headers.get('Authorization');
  let user = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    user = await verifyToken(authHeader.slice(7));
  }

  // 路由匹配
  try {
    // 登录
    if (path === '/auth/login' && method === 'POST') {
      const { username, password } = await request.json();
      const results = await queryDB(env.DB, 'SELECT * FROM users WHERE username = ?', [username]);

      if (results.results.length === 0) {
        return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }

      const user = results.results[0];
      const passwordHash = await hashPassword(password);

      if (user.password !== passwordHash) {
        return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }

      const token = await createToken({ id: user.id, username: user.username, role: user.role });

      return new Response(JSON.stringify({
        success: true,
        data: { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } },
      }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 注册
    if (path === '/auth/register' && method === 'POST') {
      const { username, password, email } = await request.json();
      const passwordHash = await hashPassword(password);

      await queryDB(env.DB,
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, passwordHash, email || '', 'viewer']
      );

      return new Response(JSON.stringify({ success: true, message: '注册成功' }), {
        status: 201,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 需要认证的路由
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: '未认证' }), {
        status: 401,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 获取用户资料
    if (path === '/auth/profile' && method === 'GET') {
      const results = await queryDB(env.DB, 'SELECT id, username, email, role, status, created_at FROM users WHERE id = ?', [user.id]);
      return new Response(JSON.stringify({ success: true, data: results.results[0] }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 获取所有用户
    if (path === '/users' && method === 'GET') {
      const results = await queryDB(env.DB, 'SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC');
      return new Response(JSON.stringify({ success: true, data: results.results, total: results.results.length }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 获取所有文章
    if (path === '/posts' && method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
      const offset = (page - 1) * pageSize;

      const results = await queryDB(env.DB,
        `SELECT p.*, u.username as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        [pageSize, offset]
      );

      const countResult = await queryDB(env.DB, 'SELECT COUNT(*) as total FROM posts');
      const total = countResult.results[0].total;

      return new Response(JSON.stringify({ success: true, data: results.results, total, page, pageSize }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 创建文章
    if (path === '/posts' && method === 'POST') {
      const { title, content, slug, category, tags, status } = await request.json();
      await queryDB(env.DB,
        'INSERT INTO posts (title, content, slug, category, tags, status, author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, content || '', slug || '', category || '', JSON.stringify(tags || []), status || 'draft', user.id]
      );
      return new Response(JSON.stringify({ success: true, message: '文章创建成功' }), {
        status: 201,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 更新文章
    if (path.match(/^\/posts\/\d+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      const { title, content, status } = await request.json();
      await queryDB(env.DB,
        'UPDATE posts SET title = ?, content = ?, status = ? WHERE id = ?',
        [title, content, status, id]
      );
      return new Response(JSON.stringify({ success: true, message: '文章更新成功' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 删除文章
    if (path.match(/^\/posts\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2];
      await queryDB(env.DB, 'DELETE FROM posts WHERE id = ?', [id]);
      return new Response(JSON.stringify({ success: true, message: '文章删除成功' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 获取所有评论
    if (path === '/comments' && method === 'GET') {
      const results = await queryDB(env.DB,
        `SELECT c.*, p.title as post_title FROM comments c LEFT JOIN posts p ON c.post_id = p.id ORDER BY c.created_at DESC`
      );
      return new Response(JSON.stringify({ success: true, data: results.results, total: results.results.length }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 更新评论状态
    if (path.match(/^\/comments\/\d+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      const { status } = await request.json();
      await queryDB(env.DB, 'UPDATE comments SET status = ? WHERE id = ?', [status, id]);
      return new Response(JSON.stringify({ success: true, message: '评论状态更新成功' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 获取仪表盘统计
    if (path === '/dashboard/stats' && method === 'GET') {
      const postsResult = await queryDB(env.DB, 'SELECT COUNT(*) as total, SUM(status = "published") as published FROM posts');
      const usersResult = await queryDB(env.DB, 'SELECT COUNT(*) as total FROM users');
      const commentsResult = await queryDB(env.DB, 'SELECT COUNT(*) as total, SUM(status = "pending") as pending FROM comments');

      return new Response(JSON.stringify({
        success: true,
        data: {
          posts: { total: postsResult.results[0].total, published: postsResult.results[0].published || 0 },
          users: { total: usersResult.results[0].total },
          comments: { total: commentsResult.results[0].total, pending: commentsResult.results[0].pending || 0 },
        },
      }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 获取设置
    if (path === '/settings' && method === 'GET') {
      const results = await queryDB(env.DB, 'SELECT * FROM settings');
      const settings = {};
      results.results.forEach(s => { settings[s.key_name] = s.value; });
      return new Response(JSON.stringify({ success: true, data: settings }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 更新设置
    if (path === '/settings' && method === 'PUT') {
      const { key, value } = await request.json();
      const existing = await queryDB(env.DB, 'SELECT id FROM settings WHERE key_name = ?', [key]);
      if (existing.results.length > 0) {
        await queryDB(env.DB, 'UPDATE settings SET value = ? WHERE key_name = ?', [value, key]);
      } else {
        await queryDB(env.DB, 'INSERT INTO settings (key_name, value) VALUES (?, ?)', [key, value]);
      }
      return new Response(JSON.stringify({ success: true, message: '设置更新成功' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 日志记录
    if (method !== 'GET' && ['POST', 'PUT', 'DELETE'].includes(method)) {
      await queryDB(env.DB,
        'INSERT INTO logs (user_id, action, target_type, ip_address) VALUES (?, ?, ?, ?)',
        [user.id, `${method} ${path}`, path.split('/')[1] || 'unknown', request.headers.get('CF-Connecting-IP') || '']
      );
    }

    return new Response(JSON.stringify({ success: false, message: 'API 路由不存在' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: '服务器错误: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};
