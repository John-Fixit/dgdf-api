import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import {
  getGallery,
  createGalleryItem,
  deleteGalleryItem,
} from '../controllers/gallery.controller.js';

const router = Router();

router.get('/', asyncHandler(getGallery));
router.post(
  '/',
  protect,
  adminOnly,
  uploadSingleImage,
  asyncHandler(createGalleryItem)
);
router.delete('/:id', protect, adminOnly, asyncHandler(deleteGalleryItem));

export default router;
