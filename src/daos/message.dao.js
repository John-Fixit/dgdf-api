import { requireDb } from '../config/db.js';
import Message from '../models/Message.js';

/**
 * List all messages, newest first.
 * @returns {Promise<Array>}
 */
export async function findAll() {
  requireDb();
  return Message.find().sort({ createdAt: -1 });
}

/**
 * Create a contact message.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  requireDb();
  return Message.create(payload);
}

/**
 * Mark a message as read.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function markAsRead(id) {
  requireDb();
  try {
    return await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid message ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}

/**
 * Delete a message by id.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function deleteById(id) {
  requireDb();
  try {
    return await Message.findByIdAndDelete(id);
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid message ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}
