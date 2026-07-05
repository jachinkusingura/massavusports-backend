const express = require('express');
const postController = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadPostImage, saveImageToCloudinary } = require('../middlewares/uploadMiddleware');
const commentRouter = require('./commentRoutes');

const router = express.Router();

// Nested routes for comments on a specific post
router.use('/:postId/comments', commentRouter);

router
  .route('/')
  .get(postController.getAllPosts)
  .post(protect, uploadPostImage, saveImageToCloudinary, postController.createPost);

router
  .route('/:id')
  .get(postController.getPost)
  .put(protect, uploadPostImage, saveImageToCloudinary, postController.updatePost)
  .delete(protect, postController.deletePost);

module.exports = router;
