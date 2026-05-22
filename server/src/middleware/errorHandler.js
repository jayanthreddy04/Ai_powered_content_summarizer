import { errorResponse } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res) => {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

export const errorHandler = (err, req, res, _next) => {
  console.error('[Error]', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  errorResponse(res, message, statusCode, err.errors || null);
};
