import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Local: server/.env — Vercel: env vars are injected; also try repo root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const readEnv = (key) => {
  const value = process.env[key]?.trim();
  if (!value || value.startsWith('your_')) return undefined;
  return value;
};

const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl:
    process.env.CLIENT_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'),
  isVercel: process.env.VERCEL === '1',
  groq: {
    apiKey: readEnv('GROQ_API_KEY'),
    model: process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant',
  },
  pinecone: {
    apiKey: readEnv('PINECONE_API_KEY'),
    indexName: process.env.PINECONE_INDEX_NAME || 'content-summarizer',
    embedModel: process.env.PINECONE_EMBED_MODEL || 'multilingual-e5-large',
    dimension: 1024,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  },
  limits: {
    maxTextLength: parseInt(process.env.MAX_TEXT_LENGTH || '50000', 10),
  },
};

export default config;
