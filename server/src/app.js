import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import config from './config/index.js';
import apiRoutes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { vercelPathNormalizer } from './middleware/vercelPath.js';
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
      if (!origin) return callback(null, true);
      callback(null, true);
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

if (config.isVercel) {
  app.use(vercelPathNormalizer);
  app.use(apiLimiter, apiRoutes);
} else {
  app.use('/api', apiLimiter, apiRoutes);
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
