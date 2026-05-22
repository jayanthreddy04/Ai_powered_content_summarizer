import { useState } from 'react';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import SummaryOptions from '../components/SummaryOptions';
import SummaryOutput from '../components/SummaryOutput';
import LoadingSpinner from '../components/LoadingSpinner';
import { summarizeText, getApiData } from '../api/client';
import { useSummary } from '../context/SummaryContext';

export default function TextSummarizer() {
  const [text, setText] = useState('');
  const [summaryType, setSummaryType] = useState('short');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { setLastResult } = useSummary();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please enter some text to summarize');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await summarizeText({ text, summaryType, length });
      const data = getApiData(response);
      setResult(data);
      setLastResult(data);
      toast.success('Summary generated successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Text Summarizer"
        description="Paste any raw text content and generate AI-powered summaries in multiple formats."
        icon={FileText}
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Your Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste your article, notes, or any text here..."
          disabled={loading}
          className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800"
        />
        <p className="mt-1 text-xs text-slate-500">{text.length} characters</p>

        <div className="mt-6">
          <SummaryOptions
            summaryType={summaryType}
            length={length}
            onSummaryTypeChange={setSummaryType}
            onLengthChange={setLength}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {loading ? 'Summarizing...' : 'Generate Summary'}
        </button>
      </form>

      {loading && <LoadingSpinner label="AI is analyzing your text..." />}
      {result && <SummaryOutput result={result} />}
    </div>
  );
}
