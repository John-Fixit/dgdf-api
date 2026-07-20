import { success } from '../utils/ApiResponse.js';
import * as donationService from '../services/donation.service.js';

/**
 * GET /api/donations
 */
export async function getDonations(req, res) {
  const donations = await donationService.listDonations();
  return success(res, donations, 'Donations retrieved');
}

/**
 * POST /api/donations/initiate
 */
export async function initiateDonation(req, res) {
  const data = await donationService.initiateDonation(req.body);
  return success(res, data, 'Donation initiated', 201);
}

/**
 * POST /api/donations/verify
 */
export async function verifyDonation(req, res) {
  const result = await donationService.verifyDonation(req.body.reference);
  return success(
    res,
    { donation: result.donation, paystack: result.paystack },
    result.verifiedStatus === 'success' ? 'Payment verified' : 'Payment failed'
  );
}

/**
 * POST /api/donations/webhook
 */
export async function webhook(req, res) {
  const result = await donationService.handleWebhook(req.body);

  if (result.ignored) {
    return success(res, { ignored: true }, 'Event ignored');
  }

  return success(
    res,
    { donation: result.donation, paystack: result.paystack },
    result.verifiedStatus === 'success'
      ? 'Webhook processed — payment verified'
      : 'Webhook processed — payment failed'
  );
}
