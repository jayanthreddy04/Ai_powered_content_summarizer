import { useState } from 'react';
import { Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import SummaryOptions from '../components/SummaryOptions';
import SummaryOutput from '../components/SummaryOutput';
import LoadingSpinner from '../components/LoadingSpinner';
import { summarizeUrl, getApiData } from '../api/client';
import { useSummary } from '../context/SummaryContext';

export default function UrlSummarizer() {
  const [url, setUrl] = useState('');
  const [summaryType, setSummaryType] = useState('short');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { setLastResult } = useSummary();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await summarizeUrl({ url, summaryType, length });
      const data = getApiData(response);
      setResult(data);
      setLastResult(data);
      toast.success('Webpage summarized successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="URL Summarizer"
        description="Enter a public webpage URL. We'll scrape the content and summarize it with AI."
        icon={Globe}
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Webpage URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          disabled={loading}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800"
        />

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
          {loading ? 'Fetching & summarizing...' : 'Summarize URL'}
        </button>
      </form>

      {loading && <LoadingSpinner label="Scraping webpage and generating summary..." />}
      {result && <SummaryOutput result={result} />}
    </div>
  );
}
