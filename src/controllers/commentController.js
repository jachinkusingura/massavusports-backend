const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/db');

// Get comments for a post
/**
 * Get comments for a specific post
 * @route GET /api/posts/:postId/comments
 * @access Public
 */
exports.getPostComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.params; // If coming from nested route
  const comments = await prisma.comment.findMany({
    where: { postId: parseInt(postId) },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: { comments }
  });
});

// Add comment to a post
exports.createComment = asyncHandler(async (req, res, next) => {
  const { postId, name, content } = req.body;

  if (!postId || !name || !content) {
    return next(new AppError('Post ID, Name, and Content are required', 400));
  }

  const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const newComment = await prisma.comment.create({
    data: {
      post: { connect: { id: parseInt(postId) } },
      name,
      content,
      status: 'pending' // default
    }
  });

  res.status(201).json({
    status: 'success',
    data: { comment: newComment }
  });
});

// Approve a comment (admin only)
exports.approveComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await prisma.comment.update({
    where: { id: parseInt(id) },
    data: { status: 'approved' }
  });

  res.status(200).json({
    status: 'success',
    data: { comment }
  });
});

// Delete a comment (admin only)
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await prisma.comment.delete({
    where: { id: parseInt(id) }
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
