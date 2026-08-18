import { success } from '../utils/ApiResponse.js';
import * as milestoneService from '../services/milestone.service.js';
import { recordAudit } from '../services/audit.service.js';

/**
 * GET /milestones
 */
export async function getMilestones(req, res) {
  const items = await milestoneService.listMilestones();
  return success(res, items, 'Milestones retrieved');
}

/**
 * POST /milestones
 */
export async function createMilestone(req, res) {
  const item = await milestoneService.createMilestone(req.body);
  await recordAudit({
    actor: req.user,
    action: 'create',
    entity: 'milestone',
    entityId: item.id,
    entityLabel: item.title,
    changes: ['added 1 entry'],
  });
  return success(res, item, 'Milestone created', 201);
}

/**
 * PATCH /milestones/:id
 */
export async function updateMilestone(req, res) {
  const item = await milestoneService.updateMilestone(req.params.id, req.body);
  const changes = [];
  if (req.body.year !== undefined) changes.push('year');
  if (req.body.title !== undefined) changes.push('title');
  if (req.body.description !== undefined) changes.push('description');
  if (req.body.sortOrder !== undefined) changes.push('order');
  if (changes.length === 0) changes.push('updated');

  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'milestone',
    entityId: item.id,
    entityLabel: item.title,
    changes,
  });
  return success(res, item, 'Milestone updated');
}

/**
 * DELETE /milestones/:id
 */
export async function deleteMilestone(req, res) {
  const item = await milestoneService.deleteMilestone(req.params.id);
  await recordAudit({
    actor: req.user,
    action: 'delete',
    entity: 'milestone',
    entityId: item.id,
    entityLabel: item.title,
    changes: ['removed'],
  });
  return success(res, null, 'Milestone deleted');
}
