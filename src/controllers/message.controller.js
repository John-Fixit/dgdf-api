import { success } from '../utils/ApiResponse.js';
import * as messageService from '../services/message.service.js';

/**
 * GET /api/messages
 */
export async function getMessages(req, res) {
  const messages = await messageService.listMessages();
  return success(res, messages, 'Messages retrieved');
}

/**
 * POST /api/messages
 */
export async function createMessage(req, res) {
  const created = await messageService.createMessage(req.body);
  return success(res, created, 'Message sent', 201);
}

/**
 * PATCH /api/messages/:id/read
 */
export async function markMessageRead(req, res) {
  const updated = await messageService.markMessageRead(req.params.id);
  return success(res, updated, 'Message marked as read');
}

/**
 * DELETE /api/messages/:id
 */
export async function deleteMessage(req, res) {
  await messageService.deleteMessage(req.params.id);
  return success(res, null, 'Message deleted');
}
