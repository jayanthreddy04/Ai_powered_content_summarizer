import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';
import { AppError } from '../utils/apiResponse.js';
import { embedTexts, embedQuery } from './embedding.service.js';

let index = null;

const getIndex = () => {
  if (!config.pinecone.apiKey) {
    throw new AppError('Pinecone API key is not configured', 503);
  }
  if (!index) {
    const pc = new Pinecone({ apiKey: config.pinecone.apiKey });
    index = pc.index(config.pinecone.indexName);
  }
  return index;
};

export const storeSummaryRecord = async ({
  sourceType,
  source,
  title,
  originalContent,
  summaries,
  summaryType,
  length,
  tokenEstimate,
}) => {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  const contentSnippet = originalContent.slice(0, 2000);
  const summaryText = summaries[summaryType] || Object.values(summaries)[0] || '';

  const [contentVector, summaryVector] = await embedTexts([
    contentSnippet,
    summaryText.slice(0, 2000),
  ]);

  const tokens = tokenEstimate || {};
  const metadata = {
    id,
    sourceType,
    source: source.slice(0, 500),
    title: (title || 'Untitled').slice(0, 200),
    summaryType,
    length,
    tokenInput: Number(tokens.input) || 0,
    tokenOutput: Number(tokens.output) || 0,
    tokenTotal: Number(tokens.total) || 0,
    createdAt,
    summariesShort: (summaries.short || '').slice(0, 1000),
    summariesDetailed: (summaries.detailed || '').slice(0, 2000),
    summariesBullets: (summaries.bullets || '').slice(0, 1500),
    summariesInsights: (summaries.insights || '').slice(0, 1500),
    contentPreview: contentSnippet.slice(0, 500),
  };

  const idx = getIndex();

  try {
    await idx.upsert([
      {
        id: `${id}-content`,
        values: contentVector,
        metadata: { ...metadata, vectorType: 'content' },
      },
      {
        id: `${id}-summary`,
        values: summaryVector,
        metadata: { ...metadata, vectorType: 'summary' },
      },
    ]);
  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
      throw new AppError(
        `Pinecone index "${config.pinecone.indexName}" not found. Run: cd server && npm run create-index, wait 60s, then retry.`,
        503
      );
    }
    console.error('[Pinecone Upsert]', msg);
    throw new AppError(`Failed to store summary in Pinecone: ${msg}`, 503);
  }

  return { id, createdAt, metadata };
};

export const semanticSearch = async (query, topK = 10) => {
  const queryVector = await embedQuery(query);
  const idx = getIndex();

  const results = await idx.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  const seen = new Set();
  const items = [];

  for (const match of results.matches || []) {
    const meta = match.metadata || {};
    const recordId = meta.id;
    if (!recordId || seen.has(recordId)) continue;
    seen.add(recordId);

    items.push({
      id: recordId,
      score: match.score,
      sourceType: meta.sourceType,
      source: meta.source,
      title: meta.title,
      summaryType: meta.summaryType,
      length: meta.length,
      tokenEstimate: {
        input: meta.tokenInput,
        output: meta.tokenOutput,
        total: meta.tokenTotal,
      },
      createdAt: meta.createdAt,
      contentPreview: meta.contentPreview,
      summaries: {
        short: meta.summariesShort,
        detailed: meta.summariesDetailed,
        bullets: meta.summariesBullets,
        insights: meta.summariesInsights,
      },
    });
  }

  return items;
};

export const listHistory = async (limit = 50) => {
  const idx = getIndex();

  try {
    const stats = await idx.describeIndexStats();
    const namespaces = stats.namespaces || { '': {} };

    const records = [];

    for (const nsKey of Object.keys(namespaces)) {
      const listResult = await idx.namespace(nsKey).listPaginated({ limit: 200 });
      const ids = (listResult.vectors || []).map((v) => v.id).filter((id) => id.endsWith('-summary'));

      if (ids.length === 0) continue;

      const fetchResult = await idx.namespace(nsKey).fetch(ids.slice(0, limit * 2));
      const vectors = fetchResult.records || {};

      for (const vectorId of Object.keys(vectors)) {
        const meta = vectors[vectorId].metadata || {};
        if (meta.vectorType !== 'summary') continue;

        records.push({
          id: meta.id,
          sourceType: meta.sourceType,
          source: meta.source,
          title: meta.title,
          summaryType: meta.summaryType,
          length: meta.length,
          tokenEstimate: {
        input: meta.tokenInput,
        output: meta.tokenOutput,
        total: meta.tokenTotal,
      },
          createdAt: meta.createdAt,
          contentPreview: meta.contentPreview,
          summaries: {
            short: meta.summariesShort,
            detailed: meta.summariesDetailed,
            bullets: meta.summariesBullets,
            insights: meta.summariesInsights,
          },
        });
      }
    }

    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unique = [];
    const seenIds = new Set();
    for (const r of records) {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        unique.push(r);
      }
      if (unique.length >= limit) break;
    }

    return unique;
  } catch (error) {
    console.error('[History]', error.message);
    throw new AppError('Failed to fetch history from vector database', 503);
  }
};
