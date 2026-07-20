import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  contentKeyParamSchema,
  updateContentBodySchema,
} from '../schemas/content.schema.js';
import { getContent, updateContent } from '../controllers/content.controller.js';

const router = Router();

router.get('/', asyncHandler(getContent));
router.patch(
  '/:key',
  protect,
  adminOnly,
  validate({ params: contentKeyParamSchema, body: updateContentBodySchema }),
  asyncHandler(updateContent)
);

export default router;
