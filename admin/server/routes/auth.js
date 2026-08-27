const express = require('express');
let rateLimit = null;
try {
  rateLimit = require('express-rate-limit');
} catch (_) {
  // 若未安装 express-rate-limit，退化为 no-op 中间件工厂以避免进程崩溃；
  // 安装依赖后自动恢复真实速率限制能力。
  rateLimit = function fallbackRateLimit() {
    return (req, res, next) => next();
  };
}
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// 注册接口：15 分钟内最多 5 次，防止暴力批量注册
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 登录接口：15 分钟内最多 10 次，防止爆破
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// REGISTRATION_ENABLED=false 时全局关闭注册（与 Worker 对齐）
function requireRegistrationEnabled(req, res, next) {
  const enabled = process.env.REGISTRATION_ENABLED === 'true';
  if (!enabled) {
    return res.status(403).json({ success: false, message: '注册功能已关闭，请联系管理员' });
  }
  next();
}

router.post('/register', requireRegistrationEnabled, registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/password', authMiddleware, authController.changePassword);

module.exports = router;
