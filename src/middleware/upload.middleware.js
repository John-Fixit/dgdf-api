import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * Multer instance for single image uploads (field name: "image").
 * Uses memory storage so buffers can be streamed to Cloudinary.
 */
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
      return;
    }
    cb(null, true);
  },
});

/**
 * Middleware that accepts a single image field named "image".
 */
export const uploadSingleImage = upload.single('image');
