import { AppError } from '../utils/AppError.js';
import * as messageDao from '../daos/message.dao.js';

/**
 * List contact messages.
 * @returns {Promise<Array>}
 */
export async function listMessages() {
  const items = await messageDao.findAll();
  return items.map(mapMessage);
}

/**
 * Create a contact message.
 * @param {{ name: string, email: string, phone?: string, message: string }} input
 * @returns {Promise<object>}
 */
export async function createMessage(input) {
  const body = input.message || input.body || '';
  const subject =
    input.subject ||
    input.inquiryType ||
    'General Inquiry';

  return messageDao.create({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone || '',
    message: subject ? `[${subject}]\n\n${body}` : body,
    isRead: false,
  });
}

/**
 * Map message docs to admin portal shape.
 * @param {object} doc
 * @returns {object}
 */
export function mapMessage(doc) {
  const source = doc?.toObject ? doc.toObject() : doc;
  const raw = source.message || '';
  const subjectMatch = raw.match(/^\[([^\]]+)\]\n\n([\s\S]*)$/);
  return {
    id: String(source._id),
    name: source.name,
    email: source.email,
    phone: source.phone || undefined,
    subject: subjectMatch?.[1] || 'Inquiry',
    body: subjectMatch?.[2] || raw,
    read: Boolean(source.isRead),
    createdAt:
      source.createdAt instanceof Date
        ? source.createdAt.toISOString()
        : source.createdAt,
  };
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
  return mapMessage(updated);
}

/**
 * Delete a message.
 * @param {string} id
 * @returns {Promise<object>} Deleted message snapshot
 */
export async function deleteMessage(id) {
  const deleted = await messageDao.deleteById(id);
  if (!deleted) {
    throw new AppError('Message not found', 404);
  }
  return mapMessage(deleted);
}
