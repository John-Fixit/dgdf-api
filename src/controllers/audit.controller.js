import { success } from '../utils/ApiResponse.js';
import * as auditService from '../services/audit.service.js';

/**
 * GET /audit-logs
 */
export async function getAuditLogs(req, res) {
  const data = await auditService.listAuditLogs(req.query);
  return success(res, data, 'Audit logs retrieved');
}

/**
 * DELETE /audit-logs
 */
export async function deleteAuditLogs(req, res) {
  const data = await auditService.clearAuditLogs();
  return success(res, data, 'Audit logs cleared');
}
