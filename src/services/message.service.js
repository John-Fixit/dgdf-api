import { AppError } from '../utils/AppError.js';
import * as messageDao from '../daos/message.dao.js';

/**
 * List contact messages.
 * @returns {Promise<Array>}
 */
export async function listMessages() {
  return messageDao.findAll();
}

/**
 * Create a contact message.
 * @param {{ name: string, email: string, phone?: string, message: string }} input
 * @returns {Promise<object>}
 */
export async function createMessage(input) {
  return messageDao.create({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone || '',
    message: input.message,
    isRead: false,
  });
}

/**
 * Mark a message as read.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function markMessageRead(id) {
  const updated = await messageDao.markAsRead(id);
  if (!updated) {
    throw new AppError('Message not found', 404);
  }
  return updated;
}

/**
 * Delete a message.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteMessage(id) {
  const deleted = await messageDao.deleteById(id);
  if (!deleted) {
    throw new AppError('Message not found', 404);
  }
}
