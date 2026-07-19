import { success, error } from '../utils/ApiResponse.js';
import { isDBConnected } from '../config/db.js';
import Message from '../models/Message.js';

/** In-memory messages when MongoDB is unavailable */
const mockMessages = [];

/**
 * GET /api/messages — list contact messages (admin).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getMessages(req, res) {
  if (isDBConnected()) {
    try {
      const messages = await Message.find().sort({ createdAt: -1 });
      return success(res, messages, 'Messages retrieved');
    } catch (err) {
      console.warn('[messages/list] DB error:', err.message);
    }
  }

  return success(res, mockMessages, 'Messages retrieved (mock)');
}

/**
 * POST /api/messages — submit a contact message (public).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function createMessage(req, res) {
  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return error(res, 'name, email, and message are required', 400);
  }

  const payload = {
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    message,
    isRead: false,
  };

  if (isDBConnected()) {
    try {
      const created = await Message.create(payload);
      return success(res, created, 'Message sent', 201);
    } catch (err) {
      console.warn('[messages/create] DB error:', err.message);
    }
  }

  const mockItem = {
    _id: `mock-message-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  mockMessages.unshift(mockItem);
  return success(res, mockItem, 'Message sent (mock)', 201);
}

/**
 * PATCH /api/messages/:id/read — mark a message as read (admin).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function markMessageRead(req, res) {
  const { id } = req.params;

  if (isDBConnected()) {
    try {
      const updated = await Message.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );
      if (!updated) {
        return error(res, 'Message not found', 404);
      }
      return success(res, updated, 'Message marked as read');
    } catch (err) {
      console.warn('[messages/read] DB error:', err.message);
      if (err.name === 'CastError') {
        return error(res, 'Invalid message ID', 400);
      }
    }
  }

  const item = mockMessages.find((m) => m._id === id);
  if (!item) {
    return error(res, 'Message not found', 404);
  }
  item.isRead = true;
  return success(res, item, 'Message marked as read (mock)');
}

/**
 * DELETE /api/messages/:id — delete a message (admin).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function deleteMessage(req, res) {
  const { id } = req.params;

  if (isDBConnected()) {
    try {
      const deleted = await Message.findByIdAndDelete(id);
      if (!deleted) {
        return error(res, 'Message not found', 404);
      }
      return success(res, null, 'Message deleted');
    } catch (err) {
      console.warn('[messages/delete] DB error:', err.message);
      if (err.name === 'CastError') {
        return error(res, 'Invalid message ID', 400);
      }
    }
  }

  const index = mockMessages.findIndex((m) => m._id === id);
  if (index === -1) {
    return error(res, 'Message not found', 404);
  }
  mockMessages.splice(index, 1);
  return success(res, null, 'Message deleted (mock)');
}
