import { requireDb } from '../config/db.js';
import SiteSettings, { SETTINGS_SECTIONS } from '../models/SiteSettings.js';
import { DEFAULT_SITE_SETTINGS } from '../data/defaults.js';

/**
 * @param {object} doc
 * @returns {object}
 */
function toSettings(doc) {
  const source = doc?.toObject ? doc.toObject() : doc;
  return {
    organization: source.organization,
    contact: source.contact,
    social: source.social,
    lastUpdatedAt:
      source.lastUpdatedAt instanceof Date
        ? source.lastUpdatedAt.toISOString()
        : source.lastUpdatedAt,
  };
}

/**
 * Get site settings singleton, seeding defaults into the DB when missing.
 * @returns {Promise<object>}
 */
export async function getSettings() {
  requireDb();

  let doc = await SiteSettings.findOne({ slug: 'default' });
  if (!doc) {
    doc = await SiteSettings.create({
      slug: 'default',
      ...structuredClone(DEFAULT_SITE_SETTINGS),
      lastUpdatedAt: new Date(),
    });
  }
  return toSettings(doc);
}

/**
 * Update one settings section.
 * @param {string} section
 * @param {Record<string, string>} data
 * @returns {Promise<object>}
 */
export async function updateSection(section, data) {
  if (!SETTINGS_SECTIONS.includes(section)) {
    const err = new Error(`Invalid settings section: ${section}`);
    err.statusCode = 400;
    throw err;
  }

  requireDb();

  let doc = await SiteSettings.findOne({ slug: 'default' });
  if (!doc) {
    doc = await SiteSettings.create({
      slug: 'default',
      ...structuredClone(DEFAULT_SITE_SETTINGS),
      lastUpdatedAt: new Date(),
    });
  }

  doc[section] = {
    ...doc[section]?.toObject?.() ?? doc[section],
    ...data,
  };
  doc.lastUpdatedAt = new Date();
  doc.markModified(section);
  await doc.save();
  return toSettings(doc);
}
