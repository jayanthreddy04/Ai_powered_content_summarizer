/**
 * Rough token estimate (~4 chars per token for English text).
 */
export const estimateTokens = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
};

export const estimateSummaryTokens = (summaries) => {
  if (!summaries) return 0;
  const combined = Object.values(summaries).join(' ');
  return estimateTokens(combined);
};
