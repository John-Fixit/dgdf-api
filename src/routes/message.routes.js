import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createMessageBodySchema } from '../schemas/message.schema.js';
import { idParamSchema } from '../schemas/common.schema.js';
import {
  getMessages,
  createMessage,
  markMessageRead,
  deleteMessage,
} from '../controllers/message.controller.js';

const router = Router();

router.get('/', protect, adminOnly, asyncHandler(getMessages));
router.post(
  '/',
  validate({ body: createMessageBodySchema }),
  asyncHandler(createMessage)
);
router.patch(
  '/:id/read',
  protect,
  adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(markMessageRead)
);
router.delete(
  '/:id',
  protect,
  adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(deleteMessage)
);

export default router;
