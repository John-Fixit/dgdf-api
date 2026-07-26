import { AppError } from '../utils/AppError.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import * as galleryDao from '../daos/gallery.dao.js';
import { notifyPublicRevalidate } from '../utils/notifyPublicRevalidate.js';

/**
 * Map gallery doc to admin/public API shape.
 * @param {object} doc
 * @returns {object}
 */
export function mapGalleryItem(doc) {
  const source = doc?.toObject ? doc.toObject() : doc;
  const status =
    source.status ||
    (source.isActive === false ? 'draft' : 'active');
  return {
    id: String(source._id),
    title: source.title || source.caption || '',
    description: source.description || '',
    imageUrl: source.imageUrl,
    category: source.category || 'General',
    status,
    sortOrder: source.sortOrder ?? 0,
    mediaType: source.mediaType || 'image',
    location: source.location || undefined,
    fileSize: source.fileSize || undefined,
    format: source.format || undefined,
    createdAt:
      source.uploadedAt instanceof Date
        ? source.uploadedAt.toISOString()
        : source.uploadedAt || source.createdAt,
    updatedAt:
      source.updatedAt instanceof Date
        ? source.updatedAt.toISOString()
        : source.updatedAt ||
          (source.uploadedAt instanceof Date
            ? source.uploadedAt.toISOString()
            : source.uploadedAt),
  };
}

/**
 * @param {{ all?: boolean }} [options]
 * @returns {Promise<object[]>}
 */
export async function listGallery(options = {}) {
  const items = await galleryDao.findMany(options);
  return items.map(mapGalleryItem);
}

/**
 * @param {{ buffer: Buffer, originalname: string, mimetype?: string, size?: number }} file
 * @param {object} meta
 * @returns {Promise<object>}
 */
export async function createGalleryItem(file, meta = {}) {
  if (!file) {
    throw new AppError('Image file is required (field: image)', 400);
  }

  let uploaded;
  try {
    uploaded = await uploadImage(file.buffer, 'dgdf/gallery', file.originalname);
  } catch (err) {
    throw new AppError(`Upload failed: ${err.message}`, 500);
  }

  const title = meta.title || meta.caption || 'Untitled asset';
  const status = ['active', 'draft', 'archived'].includes(meta.status)
    ? meta.status
    : 'active';
  const format =
    file.originalname.split('.').pop()?.toUpperCase().slice(0, 4) || 'JPG';

  const created = await galleryDao.create({
    imageUrl: uploaded.imageUrl,
    publicId: uploaded.publicId,
    title,
    caption: title,
    description: meta.description || '',
    category: meta.category || 'General',
    status,
    sortOrder: Number(meta.sortOrder) || 0,
    mediaType: meta.mediaType === 'video' ? 'video' : 'image',
    location: meta.location || '',
    fileSize: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '',
    format: format === 'JPEG' ? 'JPG' : format,
    isActive: status === 'active',
    uploadedAt: new Date(),
  });

  await notifyPublicRevalidate('gallery-create');
  return mapGalleryItem(created);
}

/**
 * @param {string} id
 * @param {{ buffer: Buffer, originalname: string, size?: number } | null} file
 * @param {object} meta
 * @returns {Promise<object>}
 */
export async function updateGalleryItem(id, file, meta = {}) {
  const existing = await galleryDao.findById(id);
  if (!existing) {
    throw new AppError('Gallery item not found', 404);
  }

  const updates = {};
  if (meta.title !== undefined || meta.caption !== undefined) {
    updates.title = meta.title || meta.caption || existing.title;
    updates.caption = updates.title;
  }
  if (meta.description !== undefined) updates.description = meta.description;
  if (meta.category !== undefined) updates.category = meta.category;
  if (meta.location !== undefined) updates.location = meta.location;
  if (meta.sortOrder !== undefined) updates.sortOrder = Number(meta.sortOrder) || 0;
  if (['active', 'draft', 'archived'].includes(meta.status)) {
    updates.status = meta.status;
    updates.isActive = meta.status === 'active';
  }

  if (file) {
    if (existing.publicId) {
      await deleteImage(existing.publicId);
    }
    const uploaded = await uploadImage(
      file.buffer,
      'dgdf/gallery',
      file.originalname
    );
    updates.imageUrl = uploaded.imageUrl;
    updates.publicId = uploaded.publicId;
    updates.format =
      file.originalname.split('.').pop()?.toUpperCase().slice(0, 4) ||
      existing.format;
    if (file.size) {
      updates.fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  const updated = await galleryDao.updateById(id, updates);
  await notifyPublicRevalidate('gallery-update');
  return mapGalleryItem(updated);
}

/**
 * @param {string} id
 * @returns {Promise<object>} Deleted item snapshot
 */
export async function deleteGalleryItem(id) {
  const item = await galleryDao.findById(id);
  if (!item) {
    throw new AppError('Gallery item not found', 404);
  }

  const mapped = mapGalleryItem(item);
  await deleteImage(item.publicId);
  await galleryDao.deleteById(id);
  await notifyPublicRevalidate('gallery-delete');
  return mapped;
}