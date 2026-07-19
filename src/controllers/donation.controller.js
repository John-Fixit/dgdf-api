import { success, error } from '../utils/ApiResponse.js';
import { isDBConnected } from '../config/db.js';
import Donation from '../models/Donation.js';

/** In-memory donations when MongoDB is unavailable */
const mockDonations = [];

/**
 * GET /api/donations — list all donations (admin).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getDonations(req, res) {
  if (isDBConnected()) {
    try {
      const donations = await Donation.find().sort({ createdAt: -1 });
      return success(res, donations, 'Donations retrieved');
    } catch (err) {
      console.warn('[donations/list] DB error:', err.message);
    }
  }

  return success(res, mockDonations, 'Donations retrieved (mock)');
}

/**
 * POST /api/donations/initiate — start a donation (public).
 * Creates a pending record and returns a Paystack-ready reference.
 * When PAYSTACK_SECRET_KEY is missing, returns a mock authorization URL.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function initiateDonation(req, res) {
  const { donorName, email, amount } = req.body || {};

  if (!donorName || !email || amount == null) {
    return error(res, 'donorName, email, and amount are required', 400);
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return error(res, 'amount must be a positive number', 400);
  }

  const paystackRef = `dgdf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const payload = {
    donorName,
    email: email.toLowerCase(),
    amount: numericAmount,
    paystackRef,
    status: 'pending',
  };

  let donation;

  if (isDBConnected()) {
    try {
      donation = await Donation.create(payload);
    } catch (err) {
      console.warn('[donations/initiate] DB error:', err.message);
    }
  }

  if (!donation) {
    donation = {
      _id: `mock-donation-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    mockDonations.unshift(donation);
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  let authorizationUrl;
  let accessCode = null;

  if (paystackKey) {
    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: payload.email,
          amount: Math.round(numericAmount * 100),
          reference: paystackRef,
          callback_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/donate/verify`,
          metadata: { donorName },
        }),
      });
      const data = await response.json();
      if (data.status && data.data) {
        authorizationUrl = data.data.authorization_url;
        accessCode = data.data.access_code;
      } else {
        authorizationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/donate/mock?ref=${paystackRef}`;
      }
    } catch (err) {
      console.warn('[donations/initiate] Paystack error:', err.message);
      authorizationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/donate/mock?ref=${paystackRef}`;
    }
  } else {
    authorizationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/donate/mock?ref=${paystackRef}`;
  }

  return success(
    res,
    {
      donation,
      reference: paystackRef,
      authorizationUrl,
      accessCode,
      mock: !paystackKey,
    },
    'Donation initiated',
    201
  );
}

/**
 * POST /api/donations/verify — verify a Paystack payment (public).
 * Body: { reference }. Updates donation status accordingly.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function verifyDonation(req, res) {
  const { reference } = req.body || {};

  if (!reference) {
    return error(res, 'reference is required', 400);
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  let verifiedStatus = 'success';
  let paystackData = null;

  if (paystackKey) {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: { Authorization: `Bearer ${paystackKey}` },
        }
      );
      const data = await response.json();
      paystackData = data.data || null;
      verifiedStatus =
        data.status && data.data?.status === 'success' ? 'success' : 'failed';
    } catch (err) {
      console.warn('[donations/verify] Paystack error:', err.message);
      verifiedStatus = 'failed';
    }
  }

  if (isDBConnected()) {
    try {
      const donation = await Donation.findOneAndUpdate(
        { paystackRef: reference },
        { status: verifiedStatus },
        { new: true }
      );
      if (!donation) {
        return error(res, 'Donation not found for reference', 404);
      }
      return success(
        res,
        { donation, paystack: paystackData, mock: !paystackKey },
        verifiedStatus === 'success' ? 'Payment verified' : 'Payment failed'
      );
    } catch (err) {
      console.warn('[donations/verify] DB error:', err.message);
    }
  }

  const donation = mockDonations.find((d) => d.paystackRef === reference);
  if (!donation) {
    return error(res, 'Donation not found for reference', 404);
  }
  donation.status = verifiedStatus;
  return success(
    res,
    { donation, paystack: paystackData, mock: !paystackKey },
    verifiedStatus === 'success' ? 'Payment verified (mock)' : 'Payment failed (mock)'
  );
}
