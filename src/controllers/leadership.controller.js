import { success } from '../utils/ApiResponse.js';
import * as leadershipService from '../services/leadership.service.js';
import { recordAudit } from '../services/audit.service.js';

/**
 * GET /leadership
 * Public: published only. Admin with ?all=true: every status.
 */
export async function getLeadership(req, res) {
  const wantsAll = req.query.all === 'true' || req.query.all === '1';
  const isAdmin = req.user?.role === 'admin';
  const items = await leadershipService.listLeadership(
    Boolean(wantsAll && isAdmin)
  );
  return success(res, items, 'Leadership retrieved');
}

/**
 * POST /leadership
 */
export async function createLeadership(req, res) {
  const item = await leadershipService.createLeadership(req.file || null, req.body);
  await recordAudit({
    actor: req.user,
    action: 'create',
    entity: 'leadership',
    entityId: item.id,
    entityLabel: item.name,
    changes: ['added 1 entry'],
  });
  return success(res, item, 'Leadership member created', 201);
}

/**
 * PATCH /leadership/:id
 */
export async function updateLeadership(req, res) {
  const item = await leadershipService.updateLeadership(
    req.params.id,
    req.file || null,
    req.body
  );
  const changes = [];
  if (req.file) changes.push('photo');
  if (req.body.name !== undefined) changes.push('name');
  if (req.body.role !== undefined) changes.push('role');
  if (req.body.bio !== undefined) changes.push('bio');
  if (req.body.status !== undefined) changes.push('status');
  if (changes.length === 0) changes.push('updated');

  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'leadership',
    entityId: item.id,
    entityLabel: item.name,
    changes,
  });
  return success(res, item, 'Leadership member updated');
}

/**
 * DELETE /leadership/:id
 */
export async function deleteLeadership(req, res) {
  const item = await leadershipService.deleteLeadership(req.params.id);
  await recordAudit({
    actor: req.user,
    action: 'delete',
    entity: 'leadership',
    entityId: item.id,
    entityLabel: item.name,
    changes: ['removed'],
  });
  return success(res, null, 'Leadership member deleted');
}
