const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleMiddleware('admin', 'editor'), commentController.getAllComments);
router.put('/:id', roleMiddleware('admin', 'editor'), commentController.updateCommentStatus);
router.delete('/:id', roleMiddleware('admin'), commentController.deleteComment);

module.exports = router;
