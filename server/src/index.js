import app from './app.js';
import config from './config/index.js';

const startServer = () => {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
    console.log(`API: http://localhost:${config.port}/api`);

    if (!config.groq.apiKey) {
      console.warn(
        '\n⚠️  GROQ_API_KEY is missing. Copy server/.env.example to server/.env and add your key from https://console.groq.com/keys\n'
      );
    }
    if (!config.pinecone.apiKey) {
      console.warn(
        '⚠️  PINECONE_API_KEY is missing. Add it to server/.env from https://app.pinecone.io\n'
      );
    } else {
      console.log(`Pinecone index: ${config.pinecone.indexName} (run npm run create-index if missing)`);
    }
  });
};

startServer();
