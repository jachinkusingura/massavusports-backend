const express = require('express');
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

// mergeParams to get access to params from other routers (e.g., postId)
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(commentController.getPostComments)
  .post(commentController.createComment);

router
  .route('/:id/approve')
  .put(protect, commentController.approveComment);

router
  .route('/:id')
  .delete(protect, commentController.deleteComment);

module.exports = router;
