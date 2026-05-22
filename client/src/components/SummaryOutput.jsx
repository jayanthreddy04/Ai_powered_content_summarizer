import { useState } from 'react';
import { Copy, Download, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadAsTxt, downloadAsPdf } from '../utils/download';

const TABS = [
  { key: 'short', label: 'Short' },
  { key: 'detailed', label: 'Detailed' },
  { key: 'bullets', label: 'Bullets' },
  { key: 'insights', label: 'Insights' },
];

export default function SummaryOutput({ result }) {
  const defaultTab =
    result?.summaryType && result?.summaries?.[result.summaryType]
      ? result.summaryType
      : Object.keys(result?.summaries || {})[0] || 'short';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState(false);

  if (!result?.summaries) return null;

  const availableTabs = TABS.filter((tab) => result.summaries[tab.key]);
  const content = result.summaries[activeTab] || '';

  if (availableTabs.length === 0) return null;

  const handleCopy = async () => {
    try {
      await copyToClipboard(content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const baseName = (result.title || result.source || 'summary')
    .replace(/[^a-z0-9]/gi, '_')
    .slice(0, 40);

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Summary Result</h3>
          {result.tokenEstimate && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Est. tokens — input: {result.tokenEstimate.input}, output:{' '}
              {result.tokenEstimate.output}, total: {result.tokenEstimate.total}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            Copy
          </button>
          <button
            type="button"
            onClick={() => {
              downloadAsTxt(content, `${baseName}.txt`);
              toast.success('Downloaded as TXT');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <FileText className="h-4 w-4" />
            TXT
          </button>
          <button
            type="button"
            onClick={() => {
              downloadAsPdf(content, result.title || 'Summary', `${baseName}.pdf`);
              toast.success('Downloaded as PDF');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {availableTabs.length > 1 && (
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-4 dark:border-slate-700">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-brand-600 text-brand-600'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="prose prose-slate max-w-none px-6 py-6 dark:prose-invert">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {content}
        </pre>
      </div>
    </div>
  );
}
