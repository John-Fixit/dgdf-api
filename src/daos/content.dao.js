import { isDBConnected } from '../config/db.js';
import SiteContent, { CONTENT_PAGES } from '../models/SiteContent.js';
import { DEFAULT_CMS_DOCUMENT } from '../data/defaults.js';

/** In-memory CMS document when MongoDB is unavailable */
let mockDocument = structuredClone(DEFAULT_CMS_DOCUMENT);

/**
 * Serialize a CMS mongoose doc (or mock) for API responses.
 * @param {object} doc
 * @returns {object}
 */
export function toContentDocument(doc) {
  const source = doc?.toObject ? doc.toObject() : doc;
  return {
    home: source.home,
    about: source.about,
    founder: source.founder,
    gallery: source.gallery,
    donate: source.donate,
    contact: source.contact,
    lastUpdatedAt:
      source.lastUpdatedAt instanceof Date
        ? source.lastUpdatedAt.toISOString()
        : source.lastUpdatedAt,
  };
}

/**
 * Get the singleton CMS document, seeding defaults when missing.
 * @returns {Promise<object>}
 */
export async function getDocument() {
  if (isDBConnected()) {
    try {
      let doc = await SiteContent.findOne({ slug: 'default' });
      if (!doc) {
        doc = await SiteContent.create({
          slug: 'default',
          ...structuredClone(DEFAULT_CMS_DOCUMENT),
          lastUpdatedAt: new Date(),
        });
      }
      return toContentDocument(doc);
    } catch (err) {
      console.warn('[contentDao/getDocument] DB error:', err.message);
    }
  }

  return structuredClone(mockDocument);
}

/**
 * Replace the full CMS document.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function replaceDocument(payload) {
  const next = {
    ...structuredClone(payload),
    lastUpdatedAt: new Date(),
  };

  if (isDBConnected()) {
    try {
      const doc = await SiteContent.findOneAndUpdate(
        { slug: 'default' },
        { slug: 'default', ...next },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return toContentDocument(doc);
    } catch (err) {
      console.warn('[contentDao/replaceDocument] DB error:', err.message);
    }
  }

  mockDocument = {
    home: next.home,
    about: next.about,
    founder: next.founder,
    gallery: next.gallery,
    donate: next.donate,
    contact: next.contact,
    lastUpdatedAt: next.lastUpdatedAt.toISOString(),
  };
  return structuredClone(mockDocument);
}

/**
 * Update one page section inside the CMS document.
 * @param {string} page
 * @param {string} section
 * @param {Record<string, unknown>} data
 * @returns {Promise<object>}
 */
export async function updateSection(page, section, data) {
  if (!CONTENT_PAGES.includes(page)) {
    const err = new Error(`Invalid content page: ${page}`);
    err.statusCode = 400;
    throw err;
  }

  if (isDBConnected()) {
    try {
      let doc = await SiteContent.findOne({ slug: 'default' });
      if (!doc) {
        doc = await SiteContent.create({
          slug: 'default',
          ...structuredClone(DEFAULT_CMS_DOCUMENT),
          lastUpdatedAt: new Date(),
        });
      }

      if (!doc[page] || typeof doc[page] !== 'object') {
        const err = new Error(`Unknown page: ${page}`);
        err.statusCode = 400;
        throw err;
      }

      doc[page] = {
        ...doc[page],
        [section]: { ...data },
      };
      doc.lastUpdatedAt = new Date();
      doc.markModified(page);
      await doc.save();
      return toContentDocument(doc);
    } catch (err) {
      if (err.statusCode) throw err;
      console.warn('[contentDao/updateSection] DB error:', err.message);
    }
  }

  if (!mockDocument[page]) {
    const err = new Error(`Unknown page: ${page}`);
    err.statusCode = 400;
    throw err;
  }

  mockDocument = {
    ...structuredClone(mockDocument),
    [page]: {
      ...mockDocument[page],
      [section]: { ...data },
    },
    lastUpdatedAt: new Date().toISOString(),
  };
  return structuredClone(mockDocument);
}
