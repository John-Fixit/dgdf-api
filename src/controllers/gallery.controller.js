import { success } from '../utils/ApiResponse.js';
import * as galleryService from '../services/gallery.service.js';
import { recordAudit } from '../services/audit.service.js';
import {
  EDITOR_ROLES,
  getClientIp,
} from '../middleware/auth.middleware.js';

/**
 * GET /gallery
 * Public: active only. Admin with ?all=true: every status.
 */
export async function getGallery(req, res) {
  const wantsAll = req.query.all === 'true' || req.query.all === '1';
  const isEditor = EDITOR_ROLES.includes(req.user?.role) ||
    req.user?.role === 'viewer';
  const items = await galleryService.listGallery({
    all: Boolean(wantsAll && isEditor),
  });
  return success(res, items, 'Gallery retrieved');
}

/**
 * POST /gallery
 */
export async function createGalleryItem(req, res) {
  const item = await galleryService.createGalleryItem(req.file, req.body);
  const filename = item.title || req.file?.originalname || 'media';
  await recordAudit({
    actor: req.user,
    action: 'create',
    entity: 'gallery',
    entityId: item.id,
    entityLabel: filename,
    category: 'gallery',
    details: `${req.user.name} uploaded ${filename} to gallery`,
    ipAddress: getClientIp(req),
    changes: ['added 1 entry'],
  });
  return success(res, item, 'Gallery item created', 201);
}

/**
 * PATCH /gallery/:id
 */
export async function updateGalleryItem(req, res) {
  const item = await galleryService.updateGalleryItem(
    req.params.id,
    req.file || null,
    req.body
  );
  const changes = [];
  if (req.file) changes.push('photo');
  if (req.body.title !== undefined || req.body.caption !== undefined) {
    changes.push('title');
  }
  if (req.body.description !== undefined) changes.push('description');
  if (req.body.category !== undefined) changes.push('category');
  if (req.body.status !== undefined) changes.push('status');
  if (changes.length === 0) changes.push('updated');

  await recordAudit({
    actor: req.user,
    action: 'update',
    entity: 'gallery',
    entityId: item.id,
    entityLabel: item.title,
    category: 'gallery',
    details: `${req.user.name} updated ${item.title} in gallery`,
    ipAddress: getClientIp(req),
    changes,
  });
  return success(res, item, 'Gallery item updated');
}

/**
 * DELETE /gallery/:id
 */
export async function deleteGalleryItem(req, res) {
  const item = await galleryService.deleteGalleryItem(req.params.id);
  await recordAudit({
    actor: req.user,
    action: 'delete',
    entity: 'gallery',
    entityId: item.id,
    entityLabel: item.title,
    category: 'gallery',
    details: `${req.user.name} deleted ${item.title} from gallery`,
    ipAddress: getClientIp(req),
    changes: ['removed'],
  });
  return success(res, null, 'Gallery item deleted');
}
