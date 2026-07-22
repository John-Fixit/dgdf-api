import { success } from '../utils/ApiResponse.js';
import * as settingsService from '../services/settings.service.js';
import { recordAudit } from '../services/audit.service.js';

/**
 * GET /settings
 */
export async function getSettings(req, res) {
  const settings = await settingsService.getSettings();
  return success(res, settings, 'Settings retrieved');
}

/**
 * PATCH /settings/:section
 */
export async function updateSettingsSection(req, res) {
  const settings = await settingsService.updateSettingsSection(
    req.params.section,
    req.body.data ?? req.body
  );
  const data = req.body.data ?? req.body;
  const changes = Object.keys(data || {}).length
    ? Object.keys(data)
    : ['updated'];

  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'settings',
    entityId: req.params.section,
    entityLabel: capitalize(req.params.section),
    changes,
  });
  return success(res, settings, 'Settings section updated');
}

/**
 * @param {string} value
 * @returns {string}
 */
function capitalize(value = '') {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
