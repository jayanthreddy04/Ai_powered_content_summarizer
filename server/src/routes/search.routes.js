import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { searchHandler } from '../controllers/search.controller.js';

const router = Router();

router.post(
  '/',
  [
    body('query').trim().notEmpty().withMessage('Search query is required'),
    body('topK').optional().isInt({ min: 1, max: 20 }).withMessage('topK must be between 1 and 20'),
  ],
  validate,
  searchHandler
);

export default router;
