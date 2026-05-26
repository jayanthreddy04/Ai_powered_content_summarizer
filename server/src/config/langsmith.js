/**
 * Initialize LangSmith tracing BEFORE any LangChain imports.
 * Import this module first in server/src/index.js and api/index.js.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const readEnv = (key) => {
  const value = process.env[key]?.trim();
  if (!value || value.startsWith('your_')) return undefined;
  return value;
};

const tracingRequested =
  process.env.LANGSMITH_TRACING === 'true' || process.env.LANGCHAIN_TRACING_V2 === 'true';

const apiKey = readEnv('LANGSMITH_API_KEY') || readEnv('LANGCHAIN_API_KEY');
const project =
  process.env.LANGSMITH_PROJECT?.trim() ||
  process.env.LANGCHAIN_PROJECT?.trim() ||
  'content_summarizer';
const endpoint =
  process.env.LANGSMITH_ENDPOINT?.trim() ||
  process.env.LANGCHAIN_ENDPOINT?.trim() ||
  'https://api.smith.langchain.com';

export const langsmithEnabled = Boolean(tracingRequested && apiKey);

if (langsmithEnabled) {
  process.env.LANGSMITH_TRACING = 'true';
  process.env.LANGCHAIN_TRACING_V2 = 'true';
  process.env.LANGSMITH_API_KEY = apiKey;
  process.env.LANGCHAIN_API_KEY = apiKey;
  process.env.LANGSMITH_PROJECT = project;
  process.env.LANGCHAIN_PROJECT = project;
  process.env.LANGSMITH_ENDPOINT = endpoint;
  process.env.LANGCHAIN_ENDPOINT = endpoint;
}

export const langsmithConfig = {
  enabled: langsmithEnabled,
  project,
  endpoint,
  tracingRequested,
  hasApiKey: Boolean(apiKey),
};
