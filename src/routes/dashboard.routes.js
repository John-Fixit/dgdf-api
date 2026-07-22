import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { getDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', protect, adminOnly, asyncHandler(getDashboard));

export default router;
