import { success } from '../utils/ApiResponse.js';
import * as administratorService from '../services/administrator.service.js';
import { recordAudit } from '../services/audit.service.js';
import { getClientIp } from '../middleware/auth.middleware.js';

/**
 * GET /administrators
 */
export async function getAdministrators(req, res) {
  const data = await administratorService.listAdministrators();
  return success(res, data, 'Administrators retrieved');
}

/**
 * POST /administrators
 */
export async function createAdministrator(req, res) {
  const admin = await administratorService.createAdministrator(
    req.body,
    req.user.id
  );

  await recordAudit({
    actor: req.user,
    action: 'create',
    entity: 'admin',
    entityId: admin.id,
    entityLabel: admin.name,
    category: 'admin',
    details: `${req.user.name} added ${admin.name} as ${admin.role}`,
    ipAddress: getClientIp(req),
    changes: [`role:${admin.role}`],
  });

  return success(res, admin, 'Administrator created', 201);
}

/**
 * PATCH /administrators/:id/role
 */
export async function updateAdministratorRole(req, res) {
  const result = await administratorService.updateAdministratorRole(
    req.params.id,
    req.body
  );

  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'admin',
    entityId: result.admin.id,
    entityLabel: result.admin.name,
    category: 'admin',
    details: `${req.user.name} changed ${result.admin.name} role from ${result.previousRole} to ${result.admin.role}`,
    ipAddress: getClientIp(req),
    changes: [
      `role:${result.previousRole}→${result.admin.role}`,
      ...(result.reason ? [`reason:${result.reason}`] : []),
    ],
  });

  return success(res, result.admin, 'Administrator role updated');
}

/**
 * PATCH /administrators/:id/status
 */
export async function updateAdministratorStatus(req, res) {
  const admin = await administratorService.updateAdministratorStatus(
    req.params.id,
    req.body,
    req.user.id
  );

  const verb = admin.status === 'active' ? 'reactivated' : 'deactivated';
  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'admin',
    entityId: admin.id,
    entityLabel: admin.name,
    category: 'admin',
    details: `${req.user.name} ${verb} ${admin.name}`,
    ipAddress: getClientIp(req),
    changes: [`status:${admin.status}`],
  });

  return success(res, admin, `Administrator ${verb}`);
}

/**
 * PATCH /administrators/:id/reset-password
 */
export async function resetAdministratorPassword(req, res) {
  const admin = await administratorService.resetAdministratorPassword(
    req.params.id,
    req.body
  );

  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'admin',
    entityId: admin.id,
    entityLabel: admin.name,
    category: 'admin',
    details: `${req.user.name} reset password for ${admin.name}`,
    ipAddress: getClientIp(req),
    changes: ['password_reset'],
  });

  return success(res, admin, 'Password reset successfully');
}
