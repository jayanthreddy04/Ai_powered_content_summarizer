const SUMMARY_TYPES = [
  { value: 'short', label: 'Short Summary' },
  { value: 'detailed', label: 'Detailed Summary' },
  { value: 'bullets', label: 'Bullet Points' },
  { value: 'insights', label: 'Key Insights' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
];

export default function SummaryOptions({
  summaryType,
  length,
  onSummaryTypeChange,
  onLengthChange,
  disabled = false,
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Summary Type
        </label>
        <select
          value={summaryType}
          onChange={(e) => onSummaryTypeChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800"
        >
          {SUMMARY_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Summary Length
        </label>
        <select
          value={length}
          onChange={(e) => onLengthChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800"
        >
          {LENGTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
