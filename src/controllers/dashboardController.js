const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/db');

/**
 * Get application-wide statistics for the dashboard
 * @route GET /api/dashboard/stats
 * @access Private (Admin)
 */
exports.getStats = asyncHandler(async (req, res, next) => {
  const totalPosts = await prisma.post.count();
  const totalComments = await prisma.comment.count();
  const totalTags = await prisma.tag.count();

  const viewsAggregation = await prisma.post.aggregate({
    _sum: {
      views: true
    }
  });

  const totalViews = viewsAggregation._sum.views || 0;

  res.status(200).json({
    status: 'success',
    data: {
      totalPosts,
      totalViews,
      totalComments,
      totalTags
    }
  });
});
