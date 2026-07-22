import { AppError } from '../utils/AppError.js';
import { success } from '../utils/ApiResponse.js';
import { uploadImage } from '../config/cloudinary.js';

/**
 * POST /media/upload — generic admin image upload for CMS fields.
 */
export async function uploadMedia(req, res) {
  if (!req.file) {
    throw new AppError('Image file is required (field: image)', 400);
  }

  const folder =
    typeof req.body.folder === 'string' && req.body.folder.trim()
      ? req.body.folder.trim()
      : 'dgdf/cms';

  const uploaded = await uploadImage(
    req.file.buffer,
    folder,
    req.file.originalname
  );

  return success(
    res,
    {
      imageUrl: uploaded.imageUrl,
      publicId: uploaded.publicId,
    },
    'Media uploaded',
    201
  );
}
