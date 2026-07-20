import { success } from '../utils/ApiResponse.js';
import * as galleryService from '../services/gallery.service.js';

/**
 * GET /api/gallery
 */
export async function getGallery(req, res) {
  const items = await galleryService.listGallery();
  return success(res, items, 'Gallery retrieved');
}

/**
 * POST /api/gallery
 */
export async function createGalleryItem(req, res) {
  const item = await galleryService.createGalleryItem(req.file, req.body);
  return success(res, item, 'Gallery item created', 201);
}

/**
 * DELETE /api/gallery/:id
 */
export async function deleteGalleryItem(req, res) {
  await galleryService.deleteGalleryItem(req.params.id);
  return success(res, null, 'Gallery item deleted');
}
