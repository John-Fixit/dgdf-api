import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { getContent, updateContent } from '../controllers/content.controller.js';

const router = Router();

router.get('/', asyncHandler(getContent));
router.patch('/:key', protect, adminOnly, asyncHandler(updateContent));

export default router;
