const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/db');

// Get all tags
/**
 * Get all tags
 * @route GET /api/tags
 * @access Public
 */
exports.getAllTags = asyncHandler(async (req, res, next) => {
  const tags = await prisma.tag.findMany();
  res.status(200).json({
    status: 'success',
    results: tags.length,
    data: { tags }
  });
});

// Create tag
/**
 * Create a new tag
 * @route POST /api/tags
 * @access Private (Admin)
 */
exports.createTag = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  if (!name) return next(new AppError('Tag name is required', 400));

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const newTag = await prisma.tag.create({
    data: { name, slug }
  });

  res.status(201).json({
    status: 'success',
    data: { tag: newTag }
  });
});

// Update tag
exports.updateTag = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) return next(new AppError('Tag name is required', 400));

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const updatedTag = await prisma.tag.update({
    where: { id: parseInt(id) },
    data: { name, slug }
  });

  res.status(200).json({
    status: 'success',
    data: { tag: updatedTag }
  });
});

// Delete tag
exports.deleteTag = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await prisma.tag.delete({
    where: { id: parseInt(id) }
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
