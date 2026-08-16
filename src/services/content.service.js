import { AppError } from '../utils/AppError.js';
import { CONTENT_PAGES } from '../models/SiteContent.js';
import * as contentDao from '../daos/content.dao.js';

/**
 * Get the full CMS document.
 * @returns {Promise<object>}
 */
export async function getContent() {
  return contentDao.getDocument();
}

/**
 * Replace the full CMS document.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function replaceContent(payload) {
  for (const page of CONTENT_PAGES) {
    if (!payload?.[page] || typeof payload[page] !== 'object') {
      throw new AppError(`Missing content page: ${page}`, 400);
    }
  }
  const doc = await contentDao.replaceDocument(payload);
  return doc;
}

/**
 * Update a single page section.
 * @param {string} page
 * @param {string} section
 * @param {Record<string, unknown>} data
 * @returns {Promise<object>}
 */
export async function updateContentSection(page, section, data) {
  if (!CONTENT_PAGES.includes(page)) {
    throw new AppError(`Invalid content page: ${page}`, 400);
  }
  if (!section || typeof section !== 'string') {
    throw new AppError('Section is required', 400);
  }
  if (!data || typeof data !== 'object') {
    throw new AppError('Section data is required', 400);
  }
  const doc = await contentDao.updateSection(page, section, data);
  return doc;
}
