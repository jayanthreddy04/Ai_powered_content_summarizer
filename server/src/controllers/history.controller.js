import { listHistory } from '../services/pinecone.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getHistoryHandler = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
    const items = await listHistory(limit);
    return successResponse(res, { items, count: items.length }, 'History retrieved successfully');
  } catch (error) {
    next(error);
  }
};
