import { isDBConnected } from '../config/db.js';
import SiteSettings, { SETTINGS_SECTIONS } from '../models/SiteSettings.js';
import { DEFAULT_SITE_SETTINGS } from '../data/defaults.js';

let mockSettings = structuredClone(DEFAULT_SITE_SETTINGS);

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
 * Get site settings singleton.
 * @returns {Promise<object>}
 */
export async function getSettings() {
  if (isDBConnected()) {
    try {
      let doc = await SiteSettings.findOne({ slug: 'default' });
      if (!doc) {
        doc = await SiteSettings.create({
          slug: 'default',
          ...structuredClone(DEFAULT_SITE_SETTINGS),
          lastUpdatedAt: new Date(),
        });
      }
      return toSettings(doc);
    } catch (err) {
      console.warn('[settingsDao/getSettings] DB error:', err.message);
    }
  }

  return structuredClone(mockSettings);
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

  if (isDBConnected()) {
    try {
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
    } catch (err) {
      if (err.statusCode) throw err;
      console.warn('[settingsDao/updateSection] DB error:', err.message);
    }
  }

  mockSettings = {
    ...structuredClone(mockSettings),
    [section]: {
      ...mockSettings[section],
      ...data,
    },
    lastUpdatedAt: new Date().toISOString(),
  };
  return structuredClone(mockSettings);
}
