import { AppError } from '../utils/AppError.js';
import * as donationDao from '../daos/donation.dao.js';

/**
 * @returns {string}
 */
function requirePaystackKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new AppError('Payment provider is not configured', 503);
  }
  return key;
}

/**
 * Initialize a Paystack transaction.
 * @param {string} email
 * @param {number} amount
 * @param {string} paystackRef
 * @param {{ donorName: string, isAnonymous: boolean }} meta
 * @returns {Promise<{ authorizationUrl: string, accessCode: string }>}
 */
async function initializePaystack(email, amount, paystackRef, meta) {
  const paystackKey = requirePaystackKey();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      reference: paystackRef,
      callback_url: `${clientUrl}/donate`,
      metadata: {
        donorName: meta.isAnonymous ? 'Anonymous' : meta.donorName,
        isAnonymous: meta.isAnonymous,
      },
    }),
  });

  const data = await response.json();
  if (!data.status || !data.data?.authorization_url) {
    throw new AppError(data.message || 'Unable to initialize payment', 502);
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
  };
}

/**
 * Verify a Paystack transaction by reference.
 * @param {string} reference
 * @returns {Promise<{ verifiedStatus: 'success' | 'failed', paystackData: object | null }>}
 */
async function verifyWithPaystack(reference) {
  const paystackKey = requirePaystackKey();

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${paystackKey}` } }
  );
  const data = await response.json();
  const verifiedStatus =
    data.status && data.data?.status === 'success' ? 'success' : 'failed';

  return {
    verifiedStatus,
    paystackData: data.data || null,
  };
}

/**
 * List all donations.
 * @returns {Promise<Array>}
 */
export async function listDonations() {
  return donationDao.findAll();
}

/**
 * Start a one-time donation and return the Paystack checkout URL.
 * @param {{ donorName: string, email: string, amount: number, currency?: string, isAnonymous?: boolean }} input
 * @returns {Promise<object>}
 */
export async function initiateDonation(input) {
  const isAnonymous = Boolean(input.isAnonymous);
  const paystackRef = `dgdf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const donation = await donationDao.create({
    donorName: input.donorName.trim(),
    email: input.email.toLowerCase().trim(),
    amount: input.amount,
    currency: input.currency || 'NGN',
    isAnonymous,
    frequency: 'one-time',
    paystackRef,
    status: 'pending',
  });

  const paystack = await initializePaystack(
    donation.email,
    donation.amount,
    paystackRef,
    { donorName: donation.donorName, isAnonymous }
  );

  return {
    donation,
    reference: paystackRef,
    authorizationUrl: paystack.authorizationUrl,
    accessCode: paystack.accessCode,
  };
}

/**
 * Verify a donation payment and update its status.
 * @param {string} reference
 * @returns {Promise<{ donation: object, paystack: object | null, verifiedStatus: string }>}
 */
export async function verifyDonation(reference) {
  if (!reference) {
    throw new AppError('reference is required', 400);
  }

  const { verifiedStatus, paystackData } = await verifyWithPaystack(reference);
  const donation = await donationDao.updateStatusByReference(reference, verifiedStatus);

  if (!donation) {
    throw new AppError('Donation not found for reference', 404);
  }

  return {
    donation,
    paystack: paystackData,
    verifiedStatus,
  };
}

/**
 * Handle Paystack webhook events by re-verifying the transaction.
 * @param {object} body - Paystack event payload
 * @returns {Promise<{ donation?: object, paystack?: object | null, verifiedStatus?: string, ignored?: boolean }>}
 */
export async function handleWebhook(body) {
  const event = body?.event;
  const reference = body?.data?.reference;

  if (!reference) {
    throw new AppError('Invalid webhook payload', 400);
  }

  if (event && event !== 'charge.success' && event !== 'charge.failed') {
    return { ignored: true };
  }

  return verifyDonation(reference);
}
