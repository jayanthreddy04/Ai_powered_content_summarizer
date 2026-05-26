import './config/langsmith.js';
import app from './app.js';
import config from './config/index.js';
import { langsmithConfig } from './config/langsmith.js';

const startServer = () => {
  app.listen(config.port, config.host, () => {
    console.log(`Server running on ${config.host}:${config.port} (${config.nodeEnv})`);
    console.log(`API: http://${config.host}:${config.port}/api`);

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
    if (langsmithConfig.enabled) {
      console.log(`LangSmith tracing: ON → project "${langsmithConfig.project}"`);
      console.log('  Dashboard: https://smith.langchain.com/');
    } else if (langsmithConfig.tracingRequested && !langsmithConfig.hasApiKey) {
      console.warn(
        '⚠️  LANGSMITH_TRACING=true but LANGSMITH_API_KEY is missing. Add key to server/.env'
      );
    } else {
      console.log('LangSmith tracing: off (set LANGSMITH_TRACING=true in server/.env to enable)');
    }
  });
};

startServer();
