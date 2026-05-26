# Deploy to Vercel

This project deploys as a **single Vercel app**: React frontend (`client/dist`) + Express API (`api/index.js` serverless function).

## Prerequisites

1. [Vercel account](https://vercel.com)
2. [Groq API key](https://console.groq.com/keys)
3. [Pinecone API key](https://app.pinecone.io) + index created
4. [LangSmith API key](https://smith.langchain.com) (optional, for tracing)
5. **Vercel Pro** (recommended) — summarization needs up to **60s** (`maxDuration: 60`). Hobby plan limits functions to **10s**.

## 1. Create Pinecone index (one time)

```bash
cd server
cp .env.example .env
# Add PINECONE_API_KEY and GROQ_API_KEY
npm run create-index
```

Wait ~60 seconds before using the app.

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin <your-repo-url>
git push -u origin main
```

## 3. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Root Directory:** leave as `.` (repository root)
4. Framework Preset: **Other** (uses `vercel.json`)
5. Build settings are auto-detected from `vercel.json`:
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/dist`
   - Install Command: `npm install && npm install --prefix client`

## 4. Environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Required | Example |
|----------|----------|---------|
| `GROQ_API_KEY` | Yes | `gsk_...` |
| `PINECONE_API_KEY` | Yes | `pcsk_...` |
| `PINECONE_INDEX_NAME` | Yes | `content-summarizer` |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` |
| `PINECONE_EMBED_MODEL` | No | `multilingual-e5-large` |
| `LANGSMITH_TRACING` | No | `true` |
| `LANGSMITH_ENDPOINT` | No | `https://api.smith.langchain.com` |
| `LANGSMITH_API_KEY` | If tracing | `lsv2_...` |
| `LANGSMITH_PROJECT` | If tracing | `content_summarizer` |
| `NODE_ENV` | No | `production` |

Apply to **Production**, **Preview**, and **Development**.

You do **not** need `VITE_API_URL` on Vercel — the frontend uses `/api` on the same domain.

## 5. Deploy

Click **Deploy**. After build:

- App: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/health`

## 6. Verify

```bash
curl https://your-project.vercel.app/api/health
```

Open the site and run a **Text** summary first (fastest). Then try PDF/URL.

## Project layout for Vercel

```
/
├── api/index.js          → Serverless Express handler
├── vercel.json           → Build + rewrites + function config
├── package.json          → API dependencies (root)
├── client/               → React app (built to client/dist)
└── server/src/           → Express app (imported by api/index.js)
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Function timeout | Upgrade to Vercel Pro (60s) or use shorter content |
| `Groq API key is not configured` | Add `GROQ_API_KEY` in Vercel env vars, redeploy |
| `Pinecone index not found` | Run `npm run create-index` locally with same `PINECONE_INDEX_NAME` |
| No LangSmith traces | Confirm `LANGSMITH_TRACING=true`, `LANGSMITH_API_KEY`, and `LANGSMITH_PROJECT`, then redeploy |
| 404 on page refresh | `vercel.json` SPA rewrite is included |
| PDF fails on Vercel | File must be &lt; 4.5MB; use text-based PDFs |

## Local dev (unchanged)

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

## Optional: frontend-only on Vercel

If you host the API on Render/Railway instead:

1. Set Vercel **Root Directory** to `client`
2. Add `VITE_API_URL=https://your-api.onrender.com/api`
3. Do not deploy the `api/` folder
