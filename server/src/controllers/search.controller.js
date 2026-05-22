import { semanticSearch } from '../services/pinecone.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const searchHandler = async (req, res, next) => {
  try {
    const { query, topK } = req.body;
    const limit = Math.min(parseInt(topK || '10', 10), 20);
    const results = await semanticSearch(query, limit);
    return successResponse(res, { results, count: results.length }, 'Search completed successfully');
  } catch (error) {
    next(error);
  }
};
