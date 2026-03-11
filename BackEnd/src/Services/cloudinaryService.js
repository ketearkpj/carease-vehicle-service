// ===== src/services/cloudinaryService.js =====
const cloudinary = require('cloudinary').v2;
const { logger } = require('../Middleware/Logger.md.js');

// ===== CONFIGURE CLOUDINARY =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===== UPLOAD IMAGE =====
exports.uploadImage = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'carease',
      transformation: options.transformation || [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ],
      ...options
    });

    logger.info(`Image uploaded: ${result.public_id}`);
    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    logger.error('Cloudinary upload failed:', error);
    throw error;
  }
};

// ===== UPLOAD MULTIPLE IMAGES =====
exports.uploadMultiple = async (files, options = {}) => {
  const uploadPromises = files.map(file => exports.uploadImage(file, options));
  return Promise.all(uploadPromises);
};

// ===== DELETE IMAGE =====
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted: ${publicId}`);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete failed:', error);
    throw error;
  }
};

// ===== GET IMAGE URL WITH TRANSFORMATIONS =====
exports.getImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    transformation: options.transformation,
    secure: true,
    ...options
  });
};

// ===== CREATE VIDEO THUMBNAIL =====
exports.createVideoThumbnail = async (videoUrl, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(videoUrl, {
      resource_type: 'video',
      eager: [
        { width: options.width || 800, height: options.height || 600, crop: 'pad' }
      ],
      ...options
    });

    return {
      publicId: result.public_id,
      thumbnailUrl: result.secure_url,
      videoUrl: result.secure_url
    };
  } catch (error) {
    logger.error('Cloudinary video thumbnail creation failed:', error);
    throw error;
  }
};