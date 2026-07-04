const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const tagRoutes = require('./routes/tagRoutes');
const commentRoutes = require('./routes/commentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

const app = express();

// 1) GLOBAL MIDDLEWARES
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false })); // allows serving images locally easily
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serving static files (uploaded images)
app.use('/public/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 2) ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3) GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
