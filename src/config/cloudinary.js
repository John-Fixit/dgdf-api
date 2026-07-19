import { v2 as cloudinary } from 'cloudinary';

const hasCredentials =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (hasCredentials) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Whether Cloudinary credentials are configured.
 * @returns {boolean}
 */
export function isCloudinaryConfigured() {
  return hasCredentials;
}

/**
 * Upload a buffer (from multer memory storage) to Cloudinary.
 * Falls back to a mock URL when credentials are missing.
 * @param {Buffer} buffer - File buffer
 * @param {string} [folder='dgdf/gallery'] - Cloudinary folder
 * @param {string} [originalname='upload'] - Original filename for mock responses
 * @returns {Promise<{ imageUrl: string, publicId: string, stub?: boolean }>}
 */
export async function uploadImage(buffer, folder = 'dgdf/gallery', originalname = 'upload') {
  if (!hasCredentials) {
    const stubId = `stub_${Date.now()}`;
    return {
      imageUrl: `https://placehold.co/800x600?text=${encodeURIComponent(originalname)}`,
      publicId: stubId,
      stub: true,
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by public ID.
 * No-ops gracefully when credentials are missing or publicId is a stub.
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<{ result: string, stub?: boolean }>}
 */
export async function deleteImage(publicId) {
  if (!hasCredentials || !publicId || String(publicId).startsWith('stub_')) {
    return { result: 'ok', stub: true };
  }

  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}

export default cloudinary;
