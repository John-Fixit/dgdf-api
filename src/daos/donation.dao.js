import { requireDb } from '../config/db.js';
import Donation from '../models/Donation.js';

/**
 * List all donations, newest first.
 * @returns {Promise<Array>}
 */
export async function findAll() {
  requireDb();
  return Donation.find().sort({ createdAt: -1 });
}

/**
 * Create a pending donation record.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  requireDb();
  return Donation.create(payload);
}

/**
 * Find a donation by Paystack reference and update its status.
 * @param {string} reference
 * @param {string} status
 * @returns {Promise<object | null>}
 */
export async function updateStatusByReference(reference, status) {
  requireDb();
  return Donation.findOneAndUpdate(
    { paystackRef: reference },
    { status },
    { new: true }
  );
}
