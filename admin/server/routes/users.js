const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const deleteUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

router.use(authMiddleware);

router.get('/', roleMiddleware('admin', 'editor'), userController.getAllUsers);
router.get('/:id', roleMiddleware('admin', 'editor'), userController.getUserById);
router.post('/', roleMiddleware('admin'), userController.createUser);
router.put('/:id', roleMiddleware('admin'), userController.updateUser);
router.delete('/:id', roleMiddleware('admin'), deleteUserLimiter, userController.deleteUser);

module.exports = router;
