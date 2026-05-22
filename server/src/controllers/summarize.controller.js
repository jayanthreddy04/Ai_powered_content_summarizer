import { summarizeText, summarizeUrl, summarizePdf } from '../services/summarize.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/apiResponse.js';

export const summarizeTextHandler = async (req, res, next) => {
  try {
    const { text, summaryType, length } = req.body;
    const result = await summarizeText(text, { summaryType, length });
    return successResponse(res, result, 'Text summarized successfully');
  } catch (error) {
    next(error);
  }
};

export const summarizeUrlHandler = async (req, res, next) => {
  try {
    const { url, summaryType, length } = req.body;
    const result = await summarizeUrl(url, { summaryType, length });
    return successResponse(res, result, 'URL summarized successfully');
  } catch (error) {
    next(error);
  }
};

export const summarizeFileHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(
        'PDF file was not received by the server. Re-select the file and try again. If the problem persists, restart the backend.',
        400
      );
    }
    const { summaryType, length } = req.body;
    const result = await summarizePdf(req.file, { summaryType, length });
    return successResponse(res, result, 'PDF summarized successfully');
  } catch (error) {
    next(error);
  }
};
