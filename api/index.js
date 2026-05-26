/**
 * Vercel serverless entry — mounts the Express API at /api/*
 */
import '../server/src/config/langsmith.js';
import app from '../server/src/app.js';

export const config = {
  maxDuration: 60,
  memory: 1024,
};

export default app;
