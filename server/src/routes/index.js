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
    vercel: process.env.VERCEL === '1',
  });
});

router.get('/debug', (req, res) => {
  res.json({
    success: true,
    url: req.url,
    path: req.path,
    method: req.method,
    query: req.query,
  });
});

router.use('/summarize', summarizeRoutes);
router.use('/history', historyRoutes);
router.use('/search', searchRoutes);

export default router;
