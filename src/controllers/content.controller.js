import { success } from '../utils/ApiResponse.js';
import * as contentService from '../services/content.service.js';
import { recordAudit } from '../services/audit.service.js';
import { getClientIp } from '../middleware/auth.middleware.js';

/**
 * GET /content
 */
export async function getContent(req, res) {
  const content = await contentService.getContent();
  return success(res, content, 'Content retrieved');
}

/**
 * PUT /content
 */
export async function replaceContent(req, res) {
  const content = await contentService.replaceContent(req.body);
  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'content',
    entityId: 'site',
    entityLabel: 'Site content',
    category: 'content',
    details: `${req.user.name} updated site content`,
    ipAddress: getClientIp(req),
    changes: ['replaced'],
  });
  return success(res, content, 'Content replaced');
}

/**
 * PATCH /content/:page/:section
 */
export async function updateContentSection(req, res) {
  const content = await contentService.updateContentSection(
    req.params.page,
    req.params.section,
    req.body.data ?? req.body
  );
  const data = req.body.data ?? req.body;
  const changes = Object.keys(data || {}).length
    ? Object.keys(data)
    : ['updated'];
  const sectionName = capitalize(req.params.section);
  const pageName = capitalize(req.params.page);

  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'content',
    entityId: `${req.params.page}/${req.params.section}`,
    entityLabel: `${pageName} · ${sectionName}`,
    category: 'content',
    details: `${req.user.name} updated ${sectionName} on ${pageName} page`,
    ipAddress: getClientIp(req),
    changes,
  });
  return success(res, content, 'Content section updated');
}

/**
 * @param {string} value
 * @returns {string}
 */
function capitalize(value = '') {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
