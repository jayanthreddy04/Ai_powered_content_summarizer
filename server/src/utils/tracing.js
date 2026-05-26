import { traceable } from 'langsmith/traceable';
import { langsmithConfig } from '../config/langsmith.js';

const DEFAULT_TAGS = ['content-summarizer'];

export const isTracingEnabled = () => langsmithConfig.enabled;

/** RunnableConfig for LangChain model.invoke — shows as child LLM runs in LangSmith */
export const llmInvokeConfig = ({ summaryType, length, sourceType, model }) => ({
  runName: `groq_${summaryType || 'summary'}`,
  tags: ['groq', 'llm', summaryType, sourceType].filter(Boolean),
  metadata: {
    summaryType,
    length,
    sourceType,
    model,
    provider: 'groq',
  },
});

export const traceOperation = (name, fn, options = {}) =>
  traceable(fn, {
    name,
    run_type: options.run_type || 'chain',
    project_name: langsmithConfig.project,
    ...options,
    tags: [...DEFAULT_TAGS, ...(options.tags || [])],
  });

export const summarizeTextInput = (value) => {
  const text = String(value || '');
  return {
    length: text.length,
    preview: text.slice(0, 120),
  };
};

export const summarizeOutputs = (summaries = {}) =>
  Object.fromEntries(
    Object.entries(summaries).map(([key, value]) => [
      key,
      { length: String(value || '').length },
    ])
  );
