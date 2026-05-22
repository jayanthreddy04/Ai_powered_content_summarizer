# AI-Powered Content Summarizer

A full-stack web application that summarizes **text**, **webpages (URLs)**, and **PDF documents** using the **Groq API**, stores vector embeddings in **Pinecone**, and supports **semantic search** over your summary history.

![Stack](https://img.shields.io/badge/React-Vite-61DAFB)
![Stack](https://img.shields.io/badge/Node-Express-339933)
![Stack](https://img.shields.io/badge/AI-Groq-F55036)
![Stack](https://img.shields.io/badge/Vector-Pinecone-000000)

## Features

- **Text Summarizer** — Paste raw text and generate summaries
- **URL Summarizer** — Scrape public webpages (Cheerio + Axios) and summarize
- **PDF Summarizer** — Upload PDFs, extract text (`pdf-parse`), and summarize
- **Multiple summary types** — Short, detailed, bullet points, key insights
- **Summary length** — Short, medium, long
- **Summary History** — Dashboard backed by Pinecone metadata
- **Semantic Search** — Natural language search via vector embeddings
- **Modern UI** — Tailwind CSS, dark/light mode, toast notifications, loading states
- **Export** — Copy, download TXT, download PDF
- **Token estimation** — Rough input/output token counts per request

## Project Structure

```
Ai_powered_content_summarizer/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Theme + Summary Context API
│   │   ├── pages/          # Route pages
│   │   └── utils/          # Download helpers
│   └── vercel.json
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/       # Groq, Pinecone, scrape, PDF
│   │   └── utils/
│   └── scripts/
│       └── create-index.js
└── README.md
```

## Prerequisites

- **Node.js** 18+
- **Groq API key** — [console.groq.com](https://console.groq.com)
- **Pinecone API key** — [app.pinecone.io](https://app.pinecone.io)
- Pinecone index with **1024 dimensions** (for `multilingual-e5-large`)

## Security (before GitHub push)

- **Never commit** `server/.env` or `client/.env` — they are gitignored.
- Copy from `.env.example` files and use **placeholder-only** examples in git.
- Run `./scripts/check-secrets.sh` before your first push.
- See **[SECURITY.md](./SECURITY.md)** if keys were ever committed.

## Quick Start

### 1. Clone and install

```bash
cd Ai_powered_content_summarizer

# Backend
cd server
cp .env.example .env
# Edit .env with your API keys (keep .env local only — never commit)
npm install

# Frontend
cd ../client
cp .env.example .env
npm install
```

### 2. Create Pinecone index

```bash
cd server
node scripts/create-index.js
```

Wait ~60 seconds for the index to become ready before making requests.

### 3. Run locally

**Terminal 1 — API (port 5001):**

```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (port 5173):**

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to the backend.

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5001`) |
| `CLIENT_URL` | Frontend URL for CORS |
| `GROQ_API_KEY` | Groq API key |
| `GROQ_MODEL` | Model ID (default `llama-3.3-70b-versatile`) |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX_NAME` | Index name (default `content-summarizer`) |
| `PINECONE_EMBED_MODEL` | Embedding model (default `multilingual-e5-large`) |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (default `http://localhost:5001/api` in prod) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/summarize/text` | Summarize raw text |
| `POST` | `/api/summarize/url` | Summarize webpage URL |
| `POST` | `/api/summarize/file` | Summarize PDF (multipart) |
| `GET` | `/api/history` | List summary history |
| `POST` | `/api/search` | Semantic search |

### API Testing Examples (cURL)

**Health check:**

```bash
curl http://localhost:5001/api/health
```

**Summarize text:**

```bash
curl -X POST http://localhost:5001/api/summarize/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial intelligence is transforming how we work and learn...",
    "summaryType": "short",
    "length": "medium"
  }'
```

**Summarize URL:**

```bash
curl -X POST http://localhost:5001/api/summarize/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://en.wikipedia.org/wiki/Machine_learning",
    "summaryType": "bullets",
    "length": "short"
  }'
```

**Summarize PDF:**

```bash
curl -X POST http://localhost:5001/api/summarize/file \
  -F "file=@/path/to/document.pdf" \
  -F "summaryType=detailed" \
  -F "length=long"
```

**History:**

```bash
curl "http://localhost:5001/api/history?limit=20"
```

**Semantic search:**

```bash
curl -X POST http://localhost:5001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning overview",
    "topK": 5
  }'
```

### Response Format

```json
{
  "success": true,
  "message": "Text summarized successfully",
  "data": {
    "id": "uuid",
    "summaries": {
      "short": "...",
      "detailed": "...",
      "bullets": "...",
      "insights": "..."
    },
    "tokenEstimate": { "input": 120, "output": 80, "total": 200 }
  }
}
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Axios, react-hot-toast |
| State | React Context API |
| Backend | Node.js, Express.js |
| AI | Groq (`@langchain/groq`) — `llama-3.3-70b-versatile` |
| Vector DB | Pinecone + inference embeddings |
| Scraping | Cheerio, Axios |
| PDF | pdf-parse, Multer |
| Security | Helmet, CORS, express-rate-limit |

## Deployment

### Full stack on Vercel (recommended)

Deploy **frontend + API** from the repository root. See **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** for the full guide.

Quick steps:

1. Push the repo to GitHub.
2. Import on [vercel.com/new](https://vercel.com/new) — **Root Directory:** `.` (repo root).
3. Add env vars: `GROQ_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`.
4. Deploy. The app serves the UI and `/api/*` on the same domain.

> **Note:** AI summarization can take 30–60s. Use **Vercel Pro** for the 60s function timeout. Hobby (10s) may time out on PDF/URL jobs.

### Alternative: split hosting

| Service | Host | Root |
|---------|------|------|
| Frontend | Vercel | `client/` + `VITE_API_URL=https://your-api.com/api` |
| Backend | Render / Railway | `server/` |

**Render:** New Web Service → root `server` → `npm start` → env from `server/.env.example`.

### Post-deploy checklist

- [ ] Pinecone index created (`cd server && npm run create-index`)
- [ ] `GROQ_API_KEY` and `PINECONE_API_KEY` set in Vercel (or Render)
- [ ] `curl https://your-app.vercel.app/api/health` returns success

## Production Best Practices

- Never commit `.env` files
- Use rate limiting (configured in `server/src/middleware/rateLimiter.js`)
- Rotate API keys periodically
- Monitor Groq and Pinecone usage quotas
- Keep PDF uploads under 10MB
- Use HTTPS in production

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Groq API key is not configured` | Set `GROQ_API_KEY` in `server/.env` |
| `Pinecone API key is not configured` | Set `PINECONE_API_KEY` |
| `Failed to generate embeddings` | Confirm index exists and embed model is enabled on your Pinecone plan |
| URL scrape fails | URL must be public; some sites block bots |
| PDF empty text | Scanned PDFs need OCR (not included) |
| CORS errors | Match `CLIENT_URL` to your frontend origin |

## License

MIT — free to use for learning and portfolio projects.
