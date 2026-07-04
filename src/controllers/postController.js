const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/db');
const slugify = require('slugify');

// Get all posts
/**
 * Get all posts with pagination
 * @route GET /api/posts
 * @access Public
 */
exports.getAllPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { tag } = req.query;

  const where = {};
  if (tag) {
    where.tags = { some: { name: tag } };
  }

  const posts = await prisma.post.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      tags: true,
      _count: {
        select: { comments: true }
      }
    }
  });

  const total = await prisma.post.count();

  res.status(200).json({
    status: 'success',
    results: posts.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: { posts }
  });
});

// Get post by ID (and increment views)
/**
 * Get single post by ID and increment view count
 * @route GET /api/posts/:id
 * @access Public
 */
exports.getPost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: { tags: true, comments: { where: { status: 'approved' } } }
  });

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  // Increment view
  post = await prisma.post.update({
    where: { id: parseInt(id) },
    data: { views: { increment: 1 } },
    include: { tags: true, comments: { where: { status: 'approved' } } }
  });

  res.status(200).json({
    status: 'success',
    data: { post }
  });
});

// Create Post
/**
 * Create a new post
 * @route POST /api/posts
 * @access Private (Admin)
 */
exports.createPost = asyncHandler(async (req, res, next) => {
  const { title, content, status } = req.body;
  let { tags } = req.body; // array of tag IDs

  if (!title || !content) {
    return next(new AppError('Title and content are required', 400));
  }

  const slug = slugify(title, { lower: true, strict: true });
  const featuredImage = req.file ? req.file.filename : null;

  if (tags && typeof tags === 'string') {
    try { tags = JSON.parse(tags); } catch (e) { }
  }

  const postData = {
    title,
    slug,
    content,
    status: status || 'draft',
    ...(featuredImage && { featuredImage })
  };

  if (tags && Array.isArray(tags) && tags.length > 0) {
    postData.tags = {
      connectOrCreate: tags.map(tagName => ({
        where: { name: tagName },
        create: { name: tagName, slug: slugify(tagName, { lower: true, strict: true }) }
      }))
    };
  }

  const newPost = await prisma.post.create({
    data: postData,
    include: { tags: true }
  });

  res.status(201).json({
    status: 'success',
    data: { post: newPost }
  });
});

// Update Post
exports.updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, content, status } = req.body;
  let { tags } = req.body;

  const existingPost = await prisma.post.findUnique({ where: { id: parseInt(id) } });

  if (!existingPost) {
    return next(new AppError('No post found with that ID', 404));
  }

  const updateData = {};
  if (title) {
    updateData.title = title;
    updateData.slug = slugify(title, { lower: true, strict: true });
  }
  if (content) updateData.content = content;
  if (status) updateData.status = status;
  if (req.file) updateData.featuredImage = req.file.filename;

  if (tags) {
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch (e) { }
    }
    if (Array.isArray(tags)) {
      updateData.tags = {
        set: [], // clear existing
        connect: tags.map(tagId => ({ id: parseInt(tagId) }))
      };
    }
  }

  const updatedPost = await prisma.post.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: { tags: true }
  });

  res.status(200).json({
    status: 'success',
    data: { post: updatedPost }
  });
});

// Delete Post
exports.deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await prisma.post.delete({
    where: { id: parseInt(id) }
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
