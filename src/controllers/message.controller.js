import { success } from '../utils/ApiResponse.js';
import * as messageService from '../services/message.service.js';
import { recordAudit } from '../services/audit.service.js';
import { getClientIp } from '../middleware/auth.middleware.js';

/**
 * GET /messages
 */
export async function getMessages(req, res) {
  const messages = await messageService.listMessages();
  return success(res, messages, 'Messages retrieved');
}

/**
 * POST /messages
 */
export async function createMessage(req, res) {
  const created = await messageService.createMessage(req.body);
  return success(res, created, 'Message sent', 201);
}

/**
 * PATCH /messages/:id/read
 */
export async function markMessageRead(req, res) {
  const updated = await messageService.markMessageRead(req.params.id);
  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'message',
    entityId: updated.id,
    entityLabel: updated.name,
    category: 'message',
    details: `${req.user.name} read message from ${updated.name}`,
    ipAddress: getClientIp(req),
    changes: ['verified'],
  });
  return success(res, updated, 'Message marked as read');
}

/**
 * DELETE /messages/:id
 */
export async function deleteMessage(req, res) {
  const deleted = await messageService.deleteMessage(req.params.id);
  await recordAudit({
    actor: req.user,
    action: 'delete',
    entity: 'message',
    entityId: deleted.id,
    entityLabel: deleted.name,
    category: 'message',
    details: `${req.user.name} deleted message from ${deleted.name}`,
    ipAddress: getClientIp(req),
    changes: ['removed'],
  });
  return success(res, null, 'Message deleted');
}
