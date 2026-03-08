# Physical AI Backend

FastAPI backend for the Physical AI & Humanoid Robotics textbook.

## Stack

- **FastAPI** — async REST API
- **Qdrant Cloud** — vector database (Free Tier)
- **Cohere** — embeddings (`embed-english-v3.0`, 1024-dim)
- **OpenRouter** — LLM (`google/gemini-2.0-flash-001`)
- **Neon Postgres** — user auth, personalization/translation cache (Step 3)
- **LangChain text splitters** — chunk docs with 512-token chunks, 50-token overlap

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Index the docs

```bash
python -m backend.app.rag.ingest
```

## Run locally

```bash
uvicorn app.main:app --reload --port 8000
```

API available at `http://localhost:8000`. Swagger UI at `http://localhost:8000/docs`.

## Auth Server (Step 3)

Better-Auth runs as a separate Node.js server on port 3001.

```bash
cd auth-server
npm install
npm run dev
```

## Deploy with Docker

```bash
docker compose -f ../docker-compose.prod.yml up -d
curl http://localhost:8000/api/health
```

## Environment Variables

| Variable | Description |
|---|---|
| `COHERE_API_KEY` | Cohere API key for embeddings |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM |
| `QDRANT_URL` | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | Qdrant Cloud API key |
| `EMBEDDING_MODEL` | Embedding model (default: `embed-english-v3.0`) |
| `LLM_MODEL` | LLM model (default: `google/gemini-2.0-flash-001`) |
| `DATABASE_URL` | Neon Postgres connection string (Step 3) |
| `BETTER_AUTH_SECRET` | Better-Auth session secret (Step 3) |

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check + chunk count |
| `POST` | `/api/chat` | No | RAG chatbot Q&A with citations |
| `POST` | `/api/index/rebuild` | No | Trigger background reindex |
| `POST` | `/api/personalize` | Yes | Personalize chapter for user |
| `POST` | `/api/translate` | Yes | Translate chapter to Urdu |
| `GET` | `/api/profile` | Yes | Get user profile |
| `PUT` | `/api/profile` | Yes | Update user profile |

### POST /api/chat

```json
{
  "query": "What is Physical AI?",
  "scope": "global",
  "session_id": "optional-uuid"
}
```

### POST /api/personalize (requires Bearer token)

```json
{
  "chapter_slug": "intro-physical-ai",
  "chapter_content": "Chapter text..."
}
```

### POST /api/translate (requires Bearer token)

```json
{
  "chapter_slug": "intro-physical-ai",
  "chapter_content": "Chapter text..."
}
```
