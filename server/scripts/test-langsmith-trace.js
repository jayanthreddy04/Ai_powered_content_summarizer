import '../src/config/langsmith.js';
import { Client } from 'langsmith';
import { traceable } from 'langsmith/traceable';
import { langsmithConfig } from '../src/config/langsmith.js';

const isPlaceholder = (value = '') => !value.trim() || value.trim().startsWith('your_');

const apiKey = process.env.LANGSMITH_API_KEY || process.env.LANGCHAIN_API_KEY;
const apiUrl = langsmithConfig.endpoint;
const projectName = langsmithConfig.project;

if (isPlaceholder(apiKey)) {
  console.error('LANGSMITH_API_KEY is missing in server/.env');
  console.error('');
  console.error('  .env.example = template only (not loaded by the app)');
  console.error('  .env         = your real keys (create this file)');
  console.error('');
  console.error('  cp .env.example .env');
  console.error('  # Edit .env and paste your lsv2_ key into LANGSMITH_API_KEY');
  console.error('  npm run trace:test');
  process.exit(1);
}

process.env.LANGSMITH_TRACING = 'true';

const client = new Client({ apiKey, apiUrl });

const smokeTrace = traceable(
  async ({ input }) => ({
    output: `LangSmith tracing is connected for ${input}.`,
    checkedAt: new Date().toISOString(),
  }),
  {
    name: 'langsmith_smoke_test',
    run_type: 'chain',
    project_name: projectName,
    tags: ['content-summarizer', 'smoke-test'],
    client,
  }
);

await smokeTrace({ input: projectName });
await client.awaitPendingTraceBatches();

console.log(`LangSmith smoke trace sent to project: ${projectName}`);
