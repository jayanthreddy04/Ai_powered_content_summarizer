import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import config from '../config/index.js';
import { AppError } from '../utils/apiResponse.js';
import { llmInvokeConfig, summarizeOutputs, traceOperation } from '../utils/tracing.js';

const LENGTH_GUIDE = {
  short: 'Keep the response very concise (2-4 sentences or 3-5 bullet points max).',
  medium: 'Provide a balanced summary (1-2 short paragraphs or 6-10 bullet points).',
  long: 'Provide a comprehensive summary with thorough detail while staying focused.',
};

const TYPE_PROMPTS = {
  short: 'Write a brief executive summary capturing only the most essential points.',
  detailed: 'Write a detailed narrative summary covering main themes, arguments, and conclusions.',
  bullets: 'Write a clear bullet-point summary with the key points. Use markdown bullet list format.',
  insights: 'Extract key insights, actionable takeaways, and notable quotes or data points.',
};

let chatModel = null;

const getModel = () => {
  if (!config.groq.apiKey) {
    throw new AppError(
      'Groq API key is not configured. Add GROQ_API_KEY to server/.env (local) or Vercel Environment Variables (production).',
      503
    );
  }
  if (!chatModel) {
    chatModel = new ChatGroq({
      apiKey: config.groq.apiKey,
      model: config.groq.model,
      temperature: 0.3,
      maxTokens: 2048,
      timeout: 90000,
    });
  }
  return chatModel;
};

const truncateContent = (content, maxChars = 28000) => {
  if (content.length <= maxChars) return content;
  return content.slice(0, maxChars) + '\n\n[Content truncated for processing...]';
};

const toGroqAppError = (error) => {
  const status = error.status || error.statusCode || error.response?.status;
  const message = error.message || '';

  if (status === 401 || message.toLowerCase().includes('invalid api key')) {
    return new AppError(
      'Groq API key is invalid. Update GROQ_API_KEY in server/.env, then restart the backend.',
      503
    );
  }

  return new AppError(`Groq summary generation failed: ${message || 'Unknown error'}`, 503);
};

export const generateSummaries = traceOperation(
  'generate_summaries',
  async (content, { length = 'medium', types = ['short'], sourceType = 'unknown' } = {}) => {
  const model = getModel();
  const trimmed = truncateContent(content);
  const lengthGuide = LENGTH_GUIDE[length] || LENGTH_GUIDE.medium;

  const summaries = {};
  console.log(`[Groq] Generating ${types.length} summary type(s) with ${config.groq.model}...`);

  const generateOne = async (type) => {
    const started = Date.now();
    const typePrompt = TYPE_PROMPTS[type] || TYPE_PROMPTS.short;
    const messages = [
      new SystemMessage(
        `You are an expert content summarizer. ${typePrompt} ${lengthGuide} ` +
          'Respond only with the summary content. Do not include preamble like "Here is the summary".'
      ),
      new HumanMessage(`Summarize the following content:\n\n${trimmed}`),
    ];
    try {
      const response = await model.invoke(
        messages,
        llmInvokeConfig({
          summaryType: type,
          length,
          sourceType,
          model: config.groq.model,
        })
      );
      summaries[type] =
        typeof response.content === 'string'
          ? response.content.trim()
          : String(response.content).trim();
    } catch (error) {
      throw toGroqAppError(error);
    }
    console.log(`[Groq] ${type} done in ${Date.now() - started}ms`);
  };

  // Sequential on Vercel to stay within serverless timeout (60s max on Pro)
  if (config.isVercel) {
    for (const type of types) {
      await generateOne(type);
    }
  } else {
    await Promise.all(types.map(generateOne));
  }

  return summaries;
},
  {
    tags: ['groq', 'llm'],
    metadata: {
      provider: 'groq',
      model: config.groq.model,
    },
    processInputs: ({ args = [] }) => ({
      contentLength: String(args[0] || '').length,
      options: {
        length: args[1]?.length,
        types: args[1]?.types,
        sourceType: args[1]?.sourceType,
      },
    }),
    processOutputs: (outputs) => ({
      summaries: summarizeOutputs(outputs),
    }),
  }
);

export const generateSingleSummary = async (content, { summaryType = 'short', length = 'medium' } = {}) => {
  const all = await generateSummaries(content, { length, types: [summaryType] });
  return all[summaryType];
};
