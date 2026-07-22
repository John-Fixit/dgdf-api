import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, editorOnly } from '../middleware/auth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import { uploadMedia } from '../controllers/media.controller.js';

const router = Router();

router.post(
  '/upload',
  protect,
  editorOnly,
  uploadSingleImage,
  asyncHandler(uploadMedia)
);

export default router;
