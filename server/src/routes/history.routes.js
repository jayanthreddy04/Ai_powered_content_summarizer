import { Router } from 'express';
import { getHistoryHandler } from '../controllers/history.controller.js';

const router = Router();

router.get('/', getHistoryHandler);

export default router;
