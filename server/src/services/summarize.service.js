import { generateSummaries } from './groq.service.js';
import { scrapeWebpage } from './scrape.service.js';
import { extractTextFromPdf } from './pdf.service.js';
import { storeSummaryRecord } from './pinecone.service.js';
import { estimateTokens, estimateSummaryTokens } from '../utils/tokenEstimator.js';
import { AppError } from '../utils/apiResponse.js';
import config from '../config/index.js';

const persistSummary = async (record) => {
  try {
    return await storeSummaryRecord(record);
  } catch (error) {
    console.warn('[Storage]', error.message);
    return {
      id: null,
      createdAt: new Date().toISOString(),
      storageWarning:
        error.message ||
        'Summary was generated but could not be saved to Pinecone. History and search may not include this item.',
    };
  }
};

const normalizeOptions = (options = {}) => {
  const summaryType = options.summaryType || 'short';
  const generateAll =
    options.generateAll === true ||
    options.generateAll === 'true' ||
    options.generateAll === '1';

  return {
    summaryType,
    length: options.length || 'medium',
    // Default: only the selected type (fast). Set generateAll=true for all 4 tabs.
    types: generateAll
      ? ['short', 'detailed', 'bullets', 'insights']
      : [summaryType],
  };
};

export const summarizeText = async (text, options = {}) => {
  const trimmed = (text || '').trim();
  if (!trimmed) throw new AppError('Text content is required', 400);
  if (trimmed.length > config.limits.maxTextLength) {
    throw new AppError(`Text exceeds maximum length of ${config.limits.maxTextLength} characters`, 400);
  }

  const opts = normalizeOptions(options);
  const summaries = await generateSummaries(trimmed, opts);
  const inputTokens = estimateTokens(trimmed);
  const outputTokens = estimateSummaryTokens(summaries);

  const stored = await persistSummary({
    sourceType: 'text',
    source: trimmed.slice(0, 200) + (trimmed.length > 200 ? '...' : ''),
    title: 'Text Summary',
    originalContent: trimmed,
    summaries,
    summaryType: opts.summaryType,
    length: opts.length,
    tokenEstimate: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
  });

  return {
    id: stored.id,
    createdAt: stored.createdAt,
    storageWarning: stored.storageWarning,
    sourceType: 'text',
    summaries,
    activeSummary: summaries[opts.summaryType],
    summaryType: opts.summaryType,
    length: opts.length,
    tokenEstimate: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
  };
};

export const summarizeUrl = async (url, options = {}) => {
  const { title, content, url: fetchedUrl } = await scrapeWebpage(url);
  const opts = normalizeOptions(options);
  const summaries = await generateSummaries(content, opts);
  const inputTokens = estimateTokens(content);
  const outputTokens = estimateSummaryTokens(summaries);

  const stored = await persistSummary({
    sourceType: 'url',
    source: fetchedUrl,
    title,
    originalContent: content,
    summaries,
    summaryType: opts.summaryType,
    length: opts.length,
    tokenEstimate: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
  });

  return {
    id: stored.id,
    createdAt: stored.createdAt,
    storageWarning: stored.storageWarning,
    sourceType: 'url',
    source: fetchedUrl,
    title,
    summaries,
    activeSummary: summaries[opts.summaryType],
    summaryType: opts.summaryType,
    length: opts.length,
    tokenEstimate: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
  };
};

export const summarizePdf = async (file, options = {}) => {
  if (!file) throw new AppError('PDF file is required', 400);

  console.log('[PDF] Extracting text from', file.originalname);
  const { title, content, pageCount } = await extractTextFromPdf(file.buffer, file.originalname);
  console.log('[PDF] Extracted', content.length, 'chars from', pageCount, 'pages');
  const opts = normalizeOptions(options);
  const summaries = await generateSummaries(content, opts);
  const inputTokens = estimateTokens(content);
  const outputTokens = estimateSummaryTokens(summaries);

  const stored = await persistSummary({
    sourceType: 'pdf',
    source: file.originalname,
    title,
    originalContent: content,
    summaries,
    summaryType: opts.summaryType,
    length: opts.length,
    tokenEstimate: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
  });

  return {
    id: stored.id,
    createdAt: stored.createdAt,
    storageWarning: stored.storageWarning,
    sourceType: 'pdf',
    source: file.originalname,
    title,
    pageCount,
    summaries,
    activeSummary: summaries[opts.summaryType],
    summaryType: opts.summaryType,
    length: opts.length,
    tokenEstimate: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
  };
};
