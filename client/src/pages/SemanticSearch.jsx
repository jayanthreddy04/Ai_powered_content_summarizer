import { useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { semanticSearch, getApiData } from '../api/client';

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Enter a search query');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await semanticSearch({ query, topK: 10 });
      const data = getApiData(response);
      setResults(data?.results || []);
      if (!data?.results?.length) {
        toast('No matching summaries found', { icon: '🔍' });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Semantic Search"
        description="Search your summary history using natural language. Powered by Pinecone vector embeddings."
        icon={Search}
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Natural Language Query
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. articles about machine learning ethics"
          disabled={loading}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading && <LoadingSpinner label="Searching vector database..." />}

      <div className="mt-8 space-y-4">
        {results.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {item.title || 'Untitled'}
              </h3>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                {(item.score * 100).toFixed(0)}% match
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{item.source}</p>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              {item.summaries?.short || item.contentPreview}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
