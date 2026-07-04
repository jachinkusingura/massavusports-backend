const AppError = require('../utils/AppError');

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Basic Prisma Error Handling
  if (err.code === 'P2002') { // Unique constraint violation
    const target = err.meta?.target;
    err = new AppError(`Duplicate field value: ${target}. Please use another value!`, 400);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = globalErrorHandler;
