import { success, error } from '../utils/ApiResponse.js';
import { isDBConnected } from '../config/db.js';
import SiteContent, { SITE_CONTENT_KEYS } from '../models/SiteContent.js';

/** Default site content for mock / seed fallbacks */
const DEFAULT_CONTENT = {
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
 * Build a key→value map from an array of SiteContent documents.
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
 * GET /api/content — return all site content as a key→value object (public).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getContent(req, res) {
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
        return success(res, toContentMap(seeded), 'Content retrieved');
      }
      return success(res, toContentMap(docs), 'Content retrieved');
    } catch (err) {
      console.warn('[content/get] DB error:', err.message);
    }
  }

  return success(res, { ...mockContent }, 'Content retrieved (mock)');
}

/**
 * PATCH /api/content/:key — update a single content key (admin).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function updateContent(req, res) {
  const { key } = req.params;
  const { value } = req.body || {};

  if (!SITE_CONTENT_KEYS.includes(key)) {
    return error(
      res,
      `Invalid key. Allowed: ${SITE_CONTENT_KEYS.join(', ')}`,
      400
    );
  }

  if (value == null || typeof value !== 'string') {
    return error(res, 'value (string) is required', 400);
  }

  if (isDBConnected()) {
    try {
      const doc = await SiteContent.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return success(res, { key: doc.key, value: doc.value, updatedAt: doc.updatedAt }, 'Content updated');
    } catch (err) {
      console.warn('[content/update] DB error:', err.message);
    }
  }

  mockContent[key] = value;
  return success(
    res,
    { key, value, updatedAt: new Date().toISOString() },
    'Content updated (mock)'
  );
}
