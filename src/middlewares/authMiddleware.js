const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/db');
const { withSupabase } = require('../config/supabase');

// ---------------------------------------------------------------------------
// protect — original Prisma-based JWT middleware (unchanged)
// Verifies the token against JWT_SECRET and loads the admin from the DB.
// Use this on all existing admin routes.
// ---------------------------------------------------------------------------
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await prisma.admin.findUnique({
    where: { id: decoded.id }
  });

  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// ---------------------------------------------------------------------------
// protectWithSupabase — Supabase SDK-style auth middleware
// Validates the Bearer JWT via Supabase Auth (JWKS), then attaches:
//   req.supabase       — RLS-scoped client (user context)
//   req.supabaseAdmin  — service-role client (bypasses RLS)
//   req.supabaseUser   — the verified Supabase user object
//
// Use this on routes that need Supabase RLS or direct Supabase queries.
//
// Example:
//   router.get('/my-data', protectWithSupabase, async (req, res) => {
//     const { data } = await req.supabase.from('posts').select();
//     const { data: all } = await req.supabaseAdmin.from('posts').select();
//     res.json({ data, all });
//   });
// ---------------------------------------------------------------------------
exports.protectWithSupabase = withSupabase({ auth: 'user' });
