import { useState, useRef, useEffect } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import SummaryOptions from '../components/SummaryOptions';
import SummaryOutput from '../components/SummaryOutput';
import LoadingSpinner from '../components/LoadingSpinner';
import ApiStatus from '../components/ApiStatus';
import { summarizeFile, getApiData } from '../api/client';

export default function PdfSummarizer() {
  const [file, setFile] = useState(null);
  const [summaryType, setSummaryType] = useState('short');
  const [length, setLength] = useState('medium');
  const [generateAll, setGenerateAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (!loading) return;
    const messages = generateAll
      ? [
          'Extracting PDF text...',
          'Generating 4 summary types (15–45s)...',
          'Saving to history...',
        ]
      : ['Extracting PDF text...', 'Generating AI summary...', 'Saving to history...'];
    let i = 0;
    setLoadingMsg(messages[0]);
    const interval = setInterval(() => {
      i = Math.min(i + 1, messages.length - 1);
      setLoadingMsg(messages[i]);
    }, 8000);
    return () => clearInterval(interval);
  }, [loading, generateAll]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isPdf =
      selected.type === 'application/pdf' ||
      selected.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      toast.error('Please upload a PDF file');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setFile(selected);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('summaryType', summaryType);
    formData.append('length', length);
    if (generateAll) formData.append('generateAll', 'true');

    try {
      const response = await summarizeFile(formData);
      const data = getApiData(response);

      if (!data?.summaries || Object.keys(data.summaries).length === 0) {
        throw new Error('Server returned an empty summary. Try the Text summarizer with pasted content.');
      }

      setResult(data);

      if (data.storageWarning) {
        toast.success('PDF summarized (history not saved)');
        toast(data.storageWarning, { icon: '⚠️', duration: 6000 });
      } else {
        toast.success('PDF summarized successfully');
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      const msg = err.message || 'Failed to summarize PDF';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  return (
    <div>
      <PageHeader
        title="PDF Summarizer"
        description="Upload a PDF document (max 10MB). Text is extracted and summarized with AI."
        icon={Upload}
      />

      <ApiStatus />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 transition hover:border-brand-400 hover:bg-brand-50/50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-brand-600"
        >
          {file ? (
            <>
              <File className="mb-2 h-10 w-10 text-brand-600" />
              <span className="font-medium text-slate-900 dark:text-white">{file.name}</span>
              <span className="mt-1 text-sm text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </>
          ) : (
            <>
              <Upload className="mb-2 h-10 w-10 text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Click to upload PDF
              </span>
              <span className="mt-1 text-sm text-slate-500">PDF only, max 10MB</span>
            </>
          )}
        </button>

        <div className="mt-6">
          <SummaryOptions
            summaryType={summaryType}
            length={length}
            onSummaryTypeChange={setSummaryType}
            onLengthChange={setLength}
            disabled={loading}
          />
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={generateAll}
            onChange={(e) => setGenerateAll(e.target.checked)}
            disabled={loading}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Generate all 4 summary types (slower, ~30–60 seconds)
        </label>

        <button
          type="submit"
          disabled={loading || !file}
          className="mt-6 w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {loading ? 'Processing PDF...' : 'Summarize PDF'}
        </button>
      </form>

      {loading && (
        <LoadingSpinner
          label={loadingMsg || 'Extracting text and generating summary...'}
        />
      )}

      {error && !loading && (
        <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Summarization failed</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-red-600 dark:text-red-300">
              Ensure the backend is running:{' '}
              <code className="rounded bg-red-100 px-1 dark:bg-red-900">
                cd server && npm run dev
              </code>
            </p>
          </div>
        </div>
      )}

      <div ref={resultRef}>{result && <SummaryOutput result={result} />}</div>
    </div>
  );
}
