import { AppError } from '../utils/AppError.js';
import { SETTINGS_SECTIONS } from '../models/SiteSettings.js';
import * as settingsDao from '../daos/settings.dao.js';
import { notifyPublicRevalidate } from '../utils/notifyPublicRevalidate.js';

/**
 * Get site settings.
 * @returns {Promise<object>}
 */
export async function getSettings() {
  return settingsDao.getSettings();
}

/**
 * Update one settings section.
 * @param {string} section
 * @param {Record<string, string>} data
 * @returns {Promise<object>}
 */
export async function updateSettingsSection(section, data) {
  if (!SETTINGS_SECTIONS.includes(section)) {
    throw new AppError(`Invalid settings section: ${section}`, 400);
  }
  if (!data || typeof data !== 'object') {
    throw new AppError('Section data is required', 400);
  }
  const settings = await settingsDao.updateSection(section, data);
  await notifyPublicRevalidate(`settings-${section}`);
  return settings;
}
