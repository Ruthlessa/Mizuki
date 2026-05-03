const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleMiddleware('admin', 'editor', 'viewer'), postController.getAllPosts);
router.get('/:id', roleMiddleware('admin', 'editor', 'viewer'), postController.getPostById);
router.post('/', roleMiddleware('admin', 'editor'), postController.createPost);
router.put('/:id', roleMiddleware('admin', 'editor'), postController.updatePost);
router.delete('/:id', roleMiddleware('admin'), postController.deletePost);

module.exports = router;
