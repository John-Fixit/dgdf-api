import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  getDonations,
  initiateDonation,
  verifyDonation,
} from '../controllers/donation.controller.js';

const router = Router();

router.get('/', protect, adminOnly, asyncHandler(getDonations));
router.post('/initiate', asyncHandler(initiateDonation));
router.post('/verify', asyncHandler(verifyDonation));

export default router;
