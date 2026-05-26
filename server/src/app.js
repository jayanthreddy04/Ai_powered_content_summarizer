import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import config from './config/index.js';
import apiRoutes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/apiResponse.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: config.isVercel ? false : undefined,
  })
);

const corsOrigin = config.isVercel
  ? (origin, callback) => {
      // Same-origin on Vercel; allow preview/production URLs and local dev
      if (!origin) return callback(null, true);
      const allowed = [
        config.clientUrl,
        process.env.FRONTEND_URL,
        process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
        process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
        'http://localhost:5173',
      ].filter(Boolean);
      if (allowed.some((o) => origin === o || origin.startsWith(o.replace(/\/$/, '')))) {
        return callback(null, true);
      }
      callback(null, true); // public API — rate-limited
    }
  : config.clientUrl;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Local dev + standard: /api/* — Vercel serverless may also pass /summarize/* without /api prefix
app.use('/api', apiLimiter, apiRoutes);
if (config.isVercel) {
  app.use(apiLimiter, apiRoutes);
}

app.use(notFoundHandler);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(`File too large. Max size is ${config.upload.maxFileSizeMb}MB`, 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
});

app.use(errorHandler);

export default app;
