import { Link } from 'react-router-dom';
import { FileText, Globe, Upload, History, Search, ArrowRight } from 'lucide-react';

const features = [
  {
    to: '/text',
    icon: FileText,
    title: 'Text Summarizer',
    description: 'Paste raw text and get short, detailed, bullet, and insight summaries.',
  },
  {
    to: '/url',
    icon: Globe,
    title: 'URL Summarizer',
    description: 'Scrape any public webpage and summarize its main content instantly.',
  },
  {
    to: '/pdf',
    icon: Upload,
    title: 'PDF Summarizer',
    description: 'Upload PDF documents and extract + summarize their text content.',
  },
  {
    to: '/history',
    icon: History,
    title: 'Summary History',
    description: 'Browse and search all your past summaries stored in Pinecone.',
  },
  {
    to: '/search',
    icon: Search,
    title: 'Semantic Search',
    description: 'Find previous summaries using natural language queries.',
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 px-8 py-16 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            AI-Powered Content Summarizer
          </h1>
          <p className="mt-4 text-lg text-brand-100">
            Summarize text, webpages, and PDFs with Groq AI. Store embeddings in Pinecone and
            search your history semantically.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/text"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 font-semibold transition hover:bg-white/10"
            >
              Semantic Search
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/40">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
          </Link>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/50">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">How it works</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            'Choose text, URL, or PDF input',
            'Select summary type and length',
            'Get AI summaries stored for semantic search',
          ].map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
