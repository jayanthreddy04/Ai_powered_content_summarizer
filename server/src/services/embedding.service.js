import { Pinecone } from '@pinecone-database/pinecone';
import config from '../config/index.js';
import { AppError } from '../utils/apiResponse.js';

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

export const embedTexts = async (texts) => {
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
};

export const embedQuery = async (query) => {
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
};
