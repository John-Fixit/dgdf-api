import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, editorOnly, optionalProtect } from '../middleware/auth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParamSchema } from '../schemas/common.schema.js';
import {
  createLeadershipBodySchema,
  updateLeadershipBodySchema,
} from '../schemas/leadership.schema.js';
import {
  getLeadership,
  createLeadership,
  updateLeadership,
  deleteLeadership,
} from '../controllers/leadership.controller.js';

const router = Router();

router.get('/', optionalProtect, asyncHandler(getLeadership));
router.post(
  '/',
  protect,
  editorOnly,
  uploadSingleImage,
  validate({ body: createLeadershipBodySchema }),
  asyncHandler(createLeadership)
);
router.patch(
  '/:id',
  protect,
  editorOnly,
  uploadSingleImage,
  validate({ params: idParamSchema, body: updateLeadershipBodySchema }),
  asyncHandler(updateLeadership)
);
router.delete(
  '/:id',
  protect,
  editorOnly,
  validate({ params: idParamSchema }),
  asyncHandler(deleteLeadership)
);

export default router;
