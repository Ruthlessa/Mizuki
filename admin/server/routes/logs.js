const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleMiddleware('admin'), logController.getAllLogs);
router.get('/statistics', roleMiddleware('admin'), logController.getLogStatistics);

module.exports = router;
