import { Router } from 'express';
import summarizeRoutes from './summarize.routes.js';
import historyRoutes from './history.routes.js';
import searchRoutes from './search.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Content Summarizer API is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/summarize', summarizeRoutes);
router.use('/history', historyRoutes);
router.use('/search', searchRoutes);

export default router;
