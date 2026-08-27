const jwt = require('jsonwebtoken');
const config = require('../config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, message: '令牌格式无效' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: config.jwtAlgorithms });
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '令牌已过期' });
    }
    return res.status(401).json({ success: false, message: '令牌验证失败' });
  }
};

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '未认证' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    next();
  };
};

// 敏感字段脱敏：对已知敏感字段返回 [REDACTED]，防止明文密码/密钥落日志
const SENSITIVE_FIELDS = new Set([
  'password', 'oldPassword', 'newPassword',
  'token', 'secret', 'jwt', 'authorization',
  'apiKey', 'api_key', 'privateKey', 'private_key',
]);
function redactSensitive(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(String(k).toLowerCase())) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object') {
      out[k] = redactSensitive(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// 这些路径的请求体会包含密码 / 敏感配置，整体不记录 body，仅记录路径与结果
const SENSITIVE_PATH_PREFIXES = [
  '/auth/login',
  '/auth/register',
  '/auth/password',
  '/settings',
];
function isSensitivePath(path) {
  return SENSITIVE_PATH_PREFIXES.some(p =>
    path === p || path.startsWith(p + '/')
  );
}

const logMiddleware = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    const details = {
      query: redactSensitive(req.query),
    };
    if (!isSensitivePath(req.path)) {
      details.body = redactSensitive(req.body);
    } else {
      details.body = '[BODY REDACTED FOR SENSITIVE PATH]';
    }
    logAction(req.user?.id, req.method, req.path, details, req.ip, req.get('user-agent'));
    originalSend.call(this, body);
  };
  next();
};

const { getPool } = require('../models/database');

const logAction = async (userId, action, targetType, details, ipAddress, userAgent) => {
  try {
    const pool = getPool();
    // 防御式脱敏：即便上游传入了敏感字段，入库前也必须再打一遍 [REDACTED]
    const safeDetails = redactSensitive(details || {});
    await pool.query(
      'INSERT INTO logs (user_id, action, target_type, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, targetType, JSON.stringify(safeDetails), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};

module.exports = { authMiddleware, roleMiddleware, logMiddleware, logAction };
