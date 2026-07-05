const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// Keep file in memory (buffer), then stream to Cloudinary
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Step 1: multer parses the multipart form and buffers the file
exports.uploadPostImage = upload.single('featuredImage');

/**
 * Step 2: Stream the buffered file to Cloudinary.
 * Sets req.file.cloudinaryUrl to the secure public URL.
 */
exports.saveImageToCloudinary = (req, res, next) => {
  if (!req.file) return next(); // No image uploaded — skip

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'massavusports/posts',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }, // auto compress & convert to WebP
        { width: 1200, crop: 'limit' }              // cap at 1200px wide
      ]
    },
    (error, result) => {
      if (error) {
        return next(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
      }
      req.file.cloudinaryUrl = result.secure_url;
      next();
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};
