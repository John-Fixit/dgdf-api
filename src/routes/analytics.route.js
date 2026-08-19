import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { analyticsSummary, analyticsDaily } from '../controllers/analytics.controller.js';
const router = Router();

router.get('/summary', protect, analyticsSummary);
router.get('/daily', protect, analyticsDaily);

export default router