import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { uploadPdf } from '../middleware/upload.js';
import {
  summarizeTextHandler,
  summarizeUrlHandler,
  summarizeFileHandler,
} from '../controllers/summarize.controller.js';

const router = Router();

router.post(
  '/text',
  [
    body('text').trim().notEmpty().withMessage('Text is required'),
    body('summaryType')
      .optional()
      .isIn(['short', 'detailed', 'bullets', 'insights'])
      .withMessage('Invalid summary type'),
    body('length').optional().isIn(['short', 'medium', 'long']).withMessage('Invalid length'),
  ],
  validate,
  summarizeTextHandler
);

router.post(
  '/url',
  [
    body('url').trim().notEmpty().isURL().withMessage('Valid URL is required'),
    body('summaryType')
      .optional()
      .isIn(['short', 'detailed', 'bullets', 'insights'])
      .withMessage('Invalid summary type'),
    body('length').optional().isIn(['short', 'medium', 'long']).withMessage('Invalid length'),
  ],
  validate,
  summarizeUrlHandler
);

const pdfUploadHandlers = [
  uploadPdf.single('file'),
  [
    body('summaryType')
      .optional()
      .isIn(['short', 'detailed', 'bullets', 'insights'])
      .withMessage('Invalid summary type'),
    body('length').optional().isIn(['short', 'medium', 'long']).withMessage('Invalid length'),
  ],
  validate,
  summarizeFileHandler,
];

// /pdf preferred on Vercel (some deployments 404 on path segment "file")
router.post('/pdf', ...pdfUploadHandlers);
router.post('/file', ...pdfUploadHandlers);

export default router;
