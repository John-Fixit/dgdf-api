import { AppError } from '../utils/AppError.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import * as galleryDao from '../daos/gallery.dao.js';

/**
 * List active gallery items.
 * @returns {Promise<Array>}
 */
export async function listGallery() {
  return galleryDao.findActive();
}

/**
 * Upload an image and create a gallery item.
 * @param {{ buffer: Buffer, originalname: string }} file
 * @param {{ caption?: string, category?: string }} meta
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

  return galleryDao.create({
    imageUrl: uploaded.imageUrl,
    publicId: uploaded.publicId,
    caption: meta.caption || '',
    category: meta.category || 'general',
    isActive: true,
    uploadedAt: new Date(),
  });
}

/**
 * Delete a gallery item and its Cloudinary asset.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteGalleryItem(id) {
  const item = await galleryDao.findById(id);
  if (!item) {
    throw new AppError('Gallery item not found', 404);
  }

  await deleteImage(item.publicId);
  await galleryDao.deleteById(id);
}
