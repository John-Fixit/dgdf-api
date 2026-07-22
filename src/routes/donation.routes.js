import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly, editorOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  initiateDonationBodySchema,
  verifyDonationBodySchema,
} from '../schemas/donation.schema.js';
import {
  getDonations,
  initiateDonation,
  verifyDonation,
  webhook,
  recordDonationExport,
} from '../controllers/donation.controller.js';

const router = Router();

router.get('/', protect, adminOnly, asyncHandler(getDonations));
router.post(
  '/export-log',
  protect,
  editorOnly,
  asyncHandler(recordDonationExport)
);
router.post(
  '/initiate',
  validate({ body: initiateDonationBodySchema }),
  asyncHandler(initiateDonation)
);
router.post('/webhook', asyncHandler(webhook));
router.post(
  '/verify',
  validate({ body: verifyDonationBodySchema }),
  asyncHandler(verifyDonation)
);

export default router;
