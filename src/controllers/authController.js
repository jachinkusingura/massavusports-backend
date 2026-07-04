const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/db');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  user.password = undefined; // Remove password from output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

/**
 * Login admin user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError('Please provide username and password', 400));
  }

  const user = await prisma.admin.findUnique({
    where: { username }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect username or password', 401));
  }

  createSendToken(user, 200, res);
});

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

/**
 * Get current logged in user
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = { ...req.user };
  delete user.password;
  res.status(200).json({ status: 'success', data: { user } });
});
