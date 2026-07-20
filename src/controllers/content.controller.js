import { success } from '../utils/ApiResponse.js';
import * as contentService from '../services/content.service.js';

/**
 * GET /api/content
 */
export async function getContent(req, res) {
  const content = await contentService.getContent();
  return success(res, content, 'Content retrieved');
}

/**
 * PATCH /api/content/:key
 */
export async function updateContent(req, res) {
  const updated = await contentService.updateContent(req.params.key, req.body.value);
  return success(res, updated, 'Content updated');
}
