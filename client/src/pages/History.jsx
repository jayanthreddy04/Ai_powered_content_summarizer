import { useEffect, useState } from 'react';
import { History as HistoryIcon, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { getHistory, getApiData } from '../api/client';

const TYPE_BADGES = {
  text: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  url: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  pdf: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory(50);
        const data = getApiData(response);
        setItems(data?.items || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.source?.toLowerCase().includes(q) ||
      item.contentPreview?.toLowerCase().includes(q) ||
      item.summaries?.short?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Summary History"
        description="Browse all summaries stored in Pinecone. Use the search box to filter locally."
        icon={HistoryIcon}
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter history by title, source, or content..."
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-900"
        />
      </div>

      {loading && <LoadingSpinner label="Loading history..." />}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-600">
          <p className="text-slate-500">No summaries found. Create one to get started.</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${TYPE_BADGES[item.sourceType] || ''}`}
                  >
                    {item.sourceType}
                  </span>
                  <time className="text-xs text-slate-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                  </time>
                </div>
                <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">
                  {item.title || 'Untitled'}
                </h3>
                <p className="mt-1 truncate text-sm text-slate-500">{item.source}</p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                {expanded === item.id ? 'Hide' : 'View'}
              </button>
            </div>

            {expanded === item.id && (
              <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                {['short', 'detailed', 'bullets', 'insights'].map((key) => (
                  <div key={key}>
                    <h4 className="text-xs font-semibold uppercase text-slate-500">{key}</h4>
                    <pre className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                      {item.summaries?.[key] || '—'}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
