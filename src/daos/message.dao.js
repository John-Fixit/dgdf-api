import { isDBConnected } from '../config/db.js';
import Message from '../models/Message.js';

/** In-memory messages when MongoDB is unavailable */
const mockMessages = [];

/**
 * List all messages, newest first.
 * @returns {Promise<Array>}
 */
export async function findAll() {
  if (isDBConnected()) {
    try {
      return await Message.find().sort({ createdAt: -1 });
    } catch (err) {
      console.warn('[messageDao/findAll] DB error:', err.message);
    }
  }

  return [...mockMessages];
}

/**
 * Create a contact message.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  if (isDBConnected()) {
    try {
      return await Message.create(payload);
    } catch (err) {
      console.warn('[messageDao/create] DB error:', err.message);
    }
  }

  const mockItem = {
    _id: `mock-message-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  mockMessages.unshift(mockItem);
  return mockItem;
}

/**
 * Mark a message as read.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function markAsRead(id) {
  if (isDBConnected()) {
    try {
      return await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
    } catch (err) {
      console.warn('[messageDao/markAsRead] DB error:', err.message);
      if (err.name === 'CastError') {
        const castErr = new Error('Invalid message ID');
        castErr.statusCode = 400;
        throw castErr;
      }
    }
  }

  const item = mockMessages.find((m) => m._id === id);
  if (!item) {
    return null;
  }
  item.isRead = true;
  return item;
}

/**
 * Delete a message by id.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function deleteById(id) {
  if (isDBConnected()) {
    try {
      return await Message.findByIdAndDelete(id);
    } catch (err) {
      console.warn('[messageDao/deleteById] DB error:', err.message);
      if (err.name === 'CastError') {
        const castErr = new Error('Invalid message ID');
        castErr.statusCode = 400;
        throw castErr;
      }
    }
  }

  const index = mockMessages.findIndex((m) => m._id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = mockMessages.splice(index, 1);
  return removed;
}
