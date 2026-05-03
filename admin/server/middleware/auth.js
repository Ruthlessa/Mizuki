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
    const decoded = jwt.verify(token, config.jwtSecret);
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

const logMiddleware = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    logAction(req.user?.id, req.method, req.path, {
      query: req.query,
      body: req.body,
    }, req.ip, req.get('user-agent'));
    originalSend.call(this, body);
  };
  next();
};

const { getPool } = require('../models/database');

const logAction = async (userId, action, targetType, details, ipAddress, userAgent) => {
  try {
    const pool = getPool();
    await pool.query(
      'INSERT INTO logs (user_id, action, target_type, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, targetType, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};

module.exports = { authMiddleware, roleMiddleware, logMiddleware, logAction };
