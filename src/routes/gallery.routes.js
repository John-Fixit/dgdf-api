import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  protect,
  adminOnly,
  editorOnly,
  optionalProtect,
} from '../middleware/auth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createGalleryBodySchema,
  updateGalleryBodySchema,
} from '../schemas/gallery.schema.js';
import { idParamSchema } from '../schemas/common.schema.js';
import {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/gallery.controller.js';

const router = Router();

router.get('/', optionalProtect, asyncHandler(getGallery));
router.post(
  '/',
  protect,
  editorOnly,
  uploadSingleImage,
  validate({ body: createGalleryBodySchema }),
  asyncHandler(createGalleryItem)
);
router.patch(
  '/:id',
  protect,
  editorOnly,
  uploadSingleImage,
  validate({ params: idParamSchema, body: updateGalleryBodySchema }),
  asyncHandler(updateGalleryItem)
);
router.delete(
  '/:id',
  protect,
  editorOnly,
  validate({ params: idParamSchema }),
  asyncHandler(deleteGalleryItem)
);

export default router;
