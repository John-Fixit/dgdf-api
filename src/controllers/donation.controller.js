import { success } from '../utils/ApiResponse.js';
import * as donationService from '../services/donation.service.js';
import { recordAudit } from '../services/audit.service.js';
import { getClientIp } from '../middleware/auth.middleware.js';

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
  const donation = data.donation;
  await recordAudit({
    actor: {
      id: 'system',
      email: donation.email,
      name: donation.isAnonymous ? 'Anonymous donor' : donation.donorName,
    },
    action: 'create',
    entity: 'donation',
    entityId: String(donation._id || donation.id || ''),
    entityLabel: donation.isAnonymous ? 'Anonymous' : donation.donorName,
    changes: ['pending'],
  });
  return success(res, data, 'Donation initiated', 201);
}

/**
 * POST /api/donations/verify
 */
export async function verifyDonation(req, res) {
  const result = await donationService.verifyDonation(req.body.reference);
  const donation = result.donation;
  await recordAudit({
    actor: {
      id: 'system',
      email: donation.email,
      name: donation.isAnonymous ? 'Anonymous donor' : donation.donorName,
    },
    action: 'update',
    entity: 'donation',
    entityId: String(donation._id || donation.id || ''),
    entityLabel: donation.isAnonymous ? 'Anonymous' : donation.donorName,
    changes: [result.verifiedStatus],
  });
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

  const donation = result.donation;
  if (donation) {
    await recordAudit({
      actor: {
        id: 'system',
        email: donation.email,
        name: donation.isAnonymous ? 'Anonymous donor' : donation.donorName,
      },
      action: 'update',
      entity: 'donation',
      entityId: String(donation._id || donation.id || ''),
      entityLabel: donation.isAnonymous ? 'Anonymous' : donation.donorName,
      changes: [result.verifiedStatus || donation.status],
    });
  }

  return success(
    res,
    { donation: result.donation, paystack: result.paystack },
    result.verifiedStatus === 'success'
      ? 'Webhook processed — payment verified'
      : 'Webhook processed — payment failed'
  );
}

/**
 * POST /donations/export-log
 * Records that an admin exported donation records (client-side Excel download).
 */
export async function recordDonationExport(req, res) {
  await recordAudit({
    actor: req.user,
    action: 'create',
    entity: 'donation',
    entityId: 'export',
    entityLabel: 'Donation records',
    category: 'donation',
    details: `${req.user.name} exported donation records`,
    ipAddress: getClientIp(req),
    changes: ['export'],
  });
  return success(res, { recorded: true }, 'Export logged');
}
