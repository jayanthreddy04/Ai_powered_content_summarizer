/**
 * Run once to create the Pinecone index:
 * node scripts/create-index.js
 */
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'content-summarizer';
const DIMENSION = 1024;

async function main() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    console.error('PINECONE_API_KEY is required');
    process.exit(1);
  }

  const pc = new Pinecone({ apiKey });
  const existing = await pc.listIndexes();
  const names = existing.indexes?.map((i) => i.name) || [];

  if (names.includes(INDEX_NAME)) {
    console.log(`Index "${INDEX_NAME}" already exists.`);
    return;
  }

  await pc.createIndex({
    name: INDEX_NAME,
    dimension: DIMENSION,
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
  });

  console.log(`Index "${INDEX_NAME}" created. Wait ~60s before using.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
