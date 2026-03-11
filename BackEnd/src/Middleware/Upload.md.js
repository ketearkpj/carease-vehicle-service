// ===== src/middleware/upload.js =====
const multer = require('multer');
const path = require('path');
const AppError = require('../Utils/AppError');

// ===== CONFIGURE STORAGE =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    // Determine folder based on file type
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars';
    } else if (file.fieldname === 'vehicle') {
      uploadPath += 'vehicles';
    } else if (file.fieldname === 'document') {
      uploadPath += 'documents';
    } else {
      uploadPath += 'misc';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// ===== FILE FILTER =====
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    video: ['video/mp4', 'video/quicktime']
  };

  let isValid = false;

  if (file.fieldname.includes('image') || file.fieldname === 'avatar' || file.fieldname === 'vehicle') {
    isValid = allowedTypes.image.includes(file.mimetype);
  } else if (file.fieldname === 'document') {
    isValid = allowedTypes.document.includes(file.mimetype);
  } else if (file.fieldname === 'video') {
    isValid = allowedTypes.video.includes(file.mimetype);
  }

  if (isValid) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images, PDFs, and videos are allowed.', 400), false);
  }
};

// ===== CREATE MULTER UPLOAD INSTANCE =====
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Max 10 files per request
  }
});

// ===== SINGLE FILE UPLOAD =====
exports.uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Max size is 5MB.', 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

// ===== MULTIPLE FILES UPLOAD =====
exports.uploadMultiple = (req, res, next) => {
  const fields = [
    { name: 'avatar', maxCount: 1 },
    { name: 'main', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
    { name: 'document', maxCount: 5 },
    { name: 'video', maxCount: 3 }
  ];

  upload.fields(fields)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File too large. Max size is 5MB.', 400));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError('Too many files uploaded.', 400));
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

// ===== UPLOAD TO MEMORY (FOR CLOUD STORAGE) =====
const memoryStorage = multer.memoryStorage();

exports.uploadToMemory = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10
  }
});