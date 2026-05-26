# LangSmith Tracing Guide

This project sends traces to [LangSmith](https://smith.langchain.com) for every summarization flow (text, URL, PDF), Groq LLM calls, and semantic search.

## What gets traced

| Trace name | Description |
|------------|-------------|
| `summarize_text` | Full text summarization pipeline |
| `summarize_url` | URL scrape + summarize |
| `summarize_pdf` | PDF extract + summarize |
| `generate_summaries` | Groq summary generation (parent) |
| `groq_short`, `groq_detailed`, … | Individual LLM calls (child runs) |
| `semantic_search` | Vector search query |

Inputs are **sanitized** (length + preview only — not full document text) to reduce sensitive data in LangSmith.

---

## Step 1 — Create a LangSmith account

1. Go to [https://smith.langchain.com](https://smith.langchain.com)
2. Sign up (free tier available)
3. Open **Settings → API Keys**
4. Create an API key (`lsv2_...`)

---

## Step 2 — Configure environment variables

Edit `server/.env`:

```env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_your_key_here
LANGSMITH_PROJECT=content_summarizer
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

| Variable | Required | Description |
|----------|----------|-------------|
| `LANGSMITH_TRACING` | Yes | Set to `true` to enable |
| `LANGSMITH_API_KEY` | Yes | From LangSmith settings |
| `LANGSMITH_PROJECT` | No | Project name in dashboard (default: `content_summarizer`) |
| `LANGSMITH_ENDPOINT` | No | Usually leave as default |

Legacy names also work: `LANGCHAIN_TRACING_V2`, `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT`.

---

## Step 3 — Install dependencies & restart server

```bash
cd server
npm install
npm run dev
```

You should see:

```text
LangSmith tracing: ON → project "content_summarizer"
  Dashboard: https://smith.langchain.com/
```

---

## Step 4 — Run smoke test

```bash
cd server
npm run trace:test
```

Expected output:

```text
LangSmith smoke trace sent to project: content_summarizer
```

---

## Step 5 — Generate real traces

1. Start the frontend: `cd client && npm run dev`
2. Open [http://localhost:5173/text](http://localhost:5173/text)
3. Paste sample text → **Generate Summary**
4. Open [https://smith.langchain.com](https://smith.langchain.com) → your project → **Runs**

You should see a tree like:

```text
summarize_text
  └── generate_summaries
        └── groq_short (LLM)
```

Filter by tags: `content-summarizer`, `text`, `pdf`, `groq`.

---

## Step 6 — Production (Vercel / Render)

Add the same variables in your host dashboard:

```env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_PROJECT=content_summarizer
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

Redeploy after saving. Traces from production appear in the same LangSmith project (use **Environment** filters in the UI to separate dev/prod).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `LangSmith tracing: off` | Set `LANGSMITH_TRACING=true` in `server/.env` and restart |
| `LANGSMITH_API_KEY is missing` | Use a real `lsv2_` key, not `your_langsmith_api_key_here` |
| No runs in dashboard | Run `npm run trace:test`, wait 10s, refresh LangSmith |
| Only parent runs, no LLM children | Restart server after env change (bootstrap must load first) |
| Traces delayed | Normal — batches flush every few seconds |

---

## Disable tracing

Set in `server/.env`:

```env
LANGSMITH_TRACING=false
```

Or remove `LANGSMITH_API_KEY`. Restart the server.

---

## Security

- Do **not** commit `LANGSMITH_API_KEY` to GitHub
- Traces may contain content previews — use a private LangSmith workspace for production
- Rotate keys if exposed (Settings → API Keys)
