import { isDBConnected } from '../config/db.js';
import SiteContent, { SITE_CONTENT_KEYS } from '../models/SiteContent.js';

/** Default site content for mock / seed fallbacks */
export const DEFAULT_CONTENT = {
  vision:
    'A world where every community experiences the transformative joy of the Gospel through love, service, and hope.',
  mandate:
    'To proclaim the Gospel, serve the vulnerable, and build lasting communities of faith and compassion.',
  aboutText:
    'Divine Gospel Delight Foundation is a faith-based nonprofit dedicated to spreading the Gospel and meeting practical needs in underserved communities.',
  heroHeadline: 'Bringing Hope Through Faith and Service',
  missionText:
    'We exist to delight in the Gospel by sharing Christ, caring for people, and empowering communities to thrive.',
};

/** In-memory content map when MongoDB is unavailable */
const mockContent = { ...DEFAULT_CONTENT };

/**
 * Build a key→value map from SiteContent documents.
 * @param {Array<{ key: string, value: string }>} docs
 * @returns {Record<string, string>}
 */
function toContentMap(docs) {
  const map = { ...DEFAULT_CONTENT };
  for (const doc of docs) {
    map[doc.key] = doc.value;
  }
  return map;
}

/**
 * Return all site content as a key→value object, seeding defaults when empty.
 * @returns {Promise<Record<string, string>>}
 */
export async function findAllAsMap() {
  if (isDBConnected()) {
    try {
      const docs = await SiteContent.find();
      if (docs.length === 0) {
        const seeded = await Promise.all(
          SITE_CONTENT_KEYS.map((key) =>
            SiteContent.findOneAndUpdate(
              { key },
              { value: DEFAULT_CONTENT[key] },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            )
          )
        );
        return toContentMap(seeded);
      }
      return toContentMap(docs);
    } catch (err) {
      console.warn('[contentDao/findAllAsMap] DB error:', err.message);
    }
  }

  return { ...mockContent };
}

/**
 * Upsert a single content key.
 * @param {string} key
 * @param {string} value
 * @returns {Promise<{ key: string, value: string, updatedAt: Date | string }>}
 */
export async function upsert(key, value) {
  if (isDBConnected()) {
    try {
      const doc = await SiteContent.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return { key: doc.key, value: doc.value, updatedAt: doc.updatedAt };
    } catch (err) {
      console.warn('[contentDao/upsert] DB error:', err.message);
    }
  }

  mockContent[key] = value;
  return { key, value, updatedAt: new Date().toISOString() };
}
