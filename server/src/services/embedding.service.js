import { Pinecone } from '@pinecone-database/pinecone';
import config from '../config/index.js';
import { AppError } from '../utils/apiResponse.js';
import { traceOperation } from '../utils/tracing.js';

let pineconeClient = null;

const getClient = () => {
  if (!config.pinecone.apiKey) {
    throw new AppError('Pinecone API key is not configured', 503);
  }
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: config.pinecone.apiKey });
  }
  return pineconeClient;
};

export const embedTexts = traceOperation('embed_texts', async (texts) => {
  const pc = getClient();
  const inputs = Array.isArray(texts) ? texts : [texts];

  try {
    const response = await pc.inference.embed(
      config.pinecone.embedModel,
      inputs.map((text) => String(text).slice(0, 8000)),
      { inputType: 'passage', truncate: 'END' }
    );

    return response.data.map((item) => item.values);
  } catch (error) {
    console.error('[Embedding]', error.message);
    throw new AppError(
      `Failed to generate embeddings: ${error.message}`,
      503
    );
  }
}, {
  run_type: 'embedding',
  tags: ['pinecone', 'embedding'],
  metadata: {
    provider: 'pinecone',
    model: config.pinecone.embedModel,
  },
  processInputs: ({ input }) => {
    const inputs = Array.isArray(input) ? input : [input];
    return {
      count: inputs.length,
      lengths: inputs.map((text) => String(text || '').length),
      inputType: 'passage',
    };
  },
  processOutputs: (outputs) => ({
    count: outputs?.outputs?.length || 0,
    dimensions: outputs?.outputs?.[0]?.length || 0,
  }),
});

export const embedQuery = traceOperation('embed_query', async (query) => {
  const pc = getClient();
  try {
    const response = await pc.inference.embed(
      config.pinecone.embedModel,
      [query.slice(0, 2000)],
      { inputType: 'query', truncate: 'END' }
    );
    return response.data[0].values;
  } catch (error) {
    console.error('[Embedding Query]', error.message);
    throw new AppError(
      `Failed to generate query embedding: ${error.message}`,
      503
    );
  }
}, {
  run_type: 'embedding',
  tags: ['pinecone', 'embedding', 'search'],
  metadata: {
    provider: 'pinecone',
    model: config.pinecone.embedModel,
  },
  processInputs: ({ input }) => ({
    queryLength: String(input || '').length,
    inputType: 'query',
  }),
  processOutputs: (outputs) => ({
    dimensions: outputs?.outputs?.length || 0,
  }),
});
