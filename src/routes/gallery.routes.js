import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createGalleryBodySchema } from '../schemas/gallery.schema.js';
import { idParamSchema } from '../schemas/common.schema.js';
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
  validate({ body: createGalleryBodySchema }),
  asyncHandler(createGalleryItem)
);
router.delete(
  '/:id',
  protect,
  adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(deleteGalleryItem)
);

export default router;
