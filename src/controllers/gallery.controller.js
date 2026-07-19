import { success, error } from '../utils/ApiResponse.js';
import { isDBConnected } from '../config/db.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import Gallery from '../models/Gallery.js';

/** In-memory gallery store when MongoDB is unavailable */
const mockGallery = [
  {
    _id: 'mock-gallery-1',
    imageUrl: 'https://placehold.co/800x600?text=Gallery+1',
    publicId: 'stub_mock_1',
    caption: 'Community outreach',
    category: 'events',
    isActive: true,
    uploadedAt: new Date().toISOString(),
  },
];

/**
 * GET /api/gallery — list active gallery items (public).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getGallery(req, res) {
  if (isDBConnected()) {
    try {
      const items = await Gallery.find({ isActive: true }).sort({ uploadedAt: -1 });
      return success(res, items, 'Gallery retrieved');
    } catch (err) {
      console.warn('[gallery/list] DB error:', err.message);
    }
  }

  return success(
    res,
    mockGallery.filter((g) => g.isActive),
    'Gallery retrieved (mock)'
  );
}

/**
 * POST /api/gallery — upload an image (admin).
 * Accepts multipart field "image" plus optional caption/category.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function createGalleryItem(req, res) {
  if (!req.file) {
    return error(res, 'Image file is required (field: image)', 400);
  }

  const caption = req.body?.caption || '';
  const category = req.body?.category || 'general';

  let uploaded;
  try {
    uploaded = await uploadImage(
      req.file.buffer,
      'dgdf/gallery',
      req.file.originalname
    );
  } catch (err) {
    return error(res, `Upload failed: ${err.message}`, 500);
  }

  const payload = {
    imageUrl: uploaded.imageUrl,
    publicId: uploaded.publicId,
    caption,
    category,
    isActive: true,
    uploadedAt: new Date(),
  };

  if (isDBConnected()) {
    try {
      const item = await Gallery.create(payload);
      return success(res, item, 'Gallery item created', 201);
    } catch (err) {
      console.warn('[gallery/create] DB error:', err.message);
    }
  }

  const mockItem = {
    _id: `mock-gallery-${Date.now()}`,
    ...payload,
    uploadedAt: payload.uploadedAt.toISOString(),
  };
  mockGallery.unshift(mockItem);
  return success(res, mockItem, 'Gallery item created (mock)', 201);
}

/**
 * DELETE /api/gallery/:id — remove a gallery item (admin).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function deleteGalleryItem(req, res) {
  const { id } = req.params;

  if (isDBConnected()) {
    try {
      const item = await Gallery.findById(id);
      if (!item) {
        return error(res, 'Gallery item not found', 404);
      }
      await deleteImage(item.publicId);
      await item.deleteOne();
      return success(res, null, 'Gallery item deleted');
    } catch (err) {
      console.warn('[gallery/delete] DB error:', err.message);
      if (err.name === 'CastError') {
        return error(res, 'Invalid gallery ID', 400);
      }
    }
  }

  const index = mockGallery.findIndex((g) => g._id === id);
  if (index === -1) {
    return error(res, 'Gallery item not found', 404);
  }
  const [removed] = mockGallery.splice(index, 1);
  await deleteImage(removed.publicId);
  return success(res, null, 'Gallery item deleted (mock)');
}
