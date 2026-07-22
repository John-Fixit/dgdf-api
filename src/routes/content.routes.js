import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, editorOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  contentPageParamSchema,
  updateContentSectionBodySchema,
} from '../schemas/content.schema.js';
import {
  getContent,
  replaceContent,
  updateContentSection,
} from '../controllers/content.controller.js';

const router = Router();

router.get('/', asyncHandler(getContent));
router.put('/', protect, editorOnly, asyncHandler(replaceContent));
router.patch(
  '/:page/:section',
  protect,
  editorOnly,
  validate({
    params: contentPageParamSchema,
    body: updateContentSectionBodySchema,
  }),
  asyncHandler(updateContentSection)
);

export default router;
