import multer from 'multer';
import config from '../config/index.js';
import { AppError } from '../utils/apiResponse.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed', 400), false);
  }
};

const maxSize = config.upload.maxFileSizeMb * 1024 * 1024;

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});
