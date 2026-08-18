import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, editorOnly, optionalProtect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParamSchema } from '../schemas/common.schema.js';
import {
  createMilestoneBodySchema,
  updateMilestoneBodySchema,
} from '../schemas/milestone.schema.js';
import {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../controllers/milestone.controller.js';

const router = Router();

router.get('/', optionalProtect, asyncHandler(getMilestones));
router.post(
  '/',
  protect,
  editorOnly,
  validate({ body: createMilestoneBodySchema }),
  asyncHandler(createMilestone)
);
router.patch(
  '/:id',
  protect,
  editorOnly,
  validate({ params: idParamSchema, body: updateMilestoneBodySchema }),
  asyncHandler(updateMilestone)
);
router.delete(
  '/:id',
  protect,
  editorOnly,
  validate({ params: idParamSchema }),
  asyncHandler(deleteMilestone)
);

export default router;
