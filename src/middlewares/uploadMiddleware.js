const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure the "public/uploads" folder exists, we'll create it via server.js or explicitly
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    // e.g. post-12498124.jpeg
    const ext = file.mimetype.split('/')[1];
    cb(null, `post-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPostImage = upload.single('featuredImage');
