const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleMiddleware('admin', 'editor'), userController.getAllUsers);
router.get('/:id', roleMiddleware('admin', 'editor'), userController.getUserById);
router.post('/', roleMiddleware('admin'), userController.createUser);
router.put('/:id', roleMiddleware('admin'), userController.updateUser);
router.delete('/:id', roleMiddleware('admin'), userController.deleteUser);

module.exports = router;
