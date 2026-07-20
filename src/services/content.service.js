import * as contentDao from '../daos/content.dao.js';

/**
 * Get all site content as a key→value map.
 * @returns {Promise<Record<string, string>>}
 */
export async function getContent() {
  return contentDao.findAllAsMap();
}

/**
 * Update a single content key.
 * @param {string} key
 * @param {string} value
 * @returns {Promise<{ key: string, value: string, updatedAt: Date | string }>}
 */
export async function updateContent(key, value) {
  return contentDao.upsert(key, value);
}
