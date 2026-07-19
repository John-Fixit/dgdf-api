import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  getMessages,
  createMessage,
  markMessageRead,
  deleteMessage,
} from '../controllers/message.controller.js';

const router = Router();

router.get('/', protect, adminOnly, asyncHandler(getMessages));
router.post('/', asyncHandler(createMessage));
router.patch('/:id/read', protect, adminOnly, asyncHandler(markMessageRead));
router.delete('/:id', protect, adminOnly, asyncHandler(deleteMessage));

export default router;
