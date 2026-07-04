const multer = require('multer');
const AppError = require('../utils/AppError');
const { supabaseAdmin } = require('../config/supabase');

// Use memory storage — file goes into buffer, then we push to Supabase Storage
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

// Middleware: multer parses multipart form, this runs after to push to Supabase
exports.uploadPostImage = upload.single('featuredImage');

/**
 * After multer stores the file in memory (req.file.buffer),
 * this middleware uploads it to Supabase Storage and sets
 * req.file.supabaseUrl to the public URL for downstream use.
 */
exports.saveImageToSupabase = async (req, res, next) => {
  if (!req.file) return next(); // No image uploaded — skip

  try {
    const ext = req.file.mimetype.split('/')[1];
    const fileName = `post-${Date.now()}.${ext}`;
    const bucket = 'posts'; // Supabase Storage bucket name

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

    // Get the permanent public URL
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
    req.file.supabaseUrl = data.publicUrl;

    next();
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
