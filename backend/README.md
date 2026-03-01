# Chatbot Backend

FastAPI backend for the Physical AI textbook RAG chatbot.

## Stack

- **FastAPI** — async REST API
- **Qdrant Cloud** — vector database (Free Tier)
- **OpenRouter API** — embeddings (`openai/text-embedding-3-small`) + LLM (`google/gemini-flash-1.5`)
- **LangChain text splitters** — chunk docs with 512-token chunks, 50-token overlap

## Setup

```bash
cd backend
cp .env.example .env
# Fill in your API keys in .env
pip install -r requirements.txt
```

## Index the docs

```bash
python scripts/index_docs.py --docs-dir ../docs --collection book_chunks
```

## Run locally

```bash
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`. Swagger UI at `http://localhost:8000/docs`.

## Deploy with Docker

```bash
# Build and start
docker compose -f ../docker-compose.prod.yml up -d

# Check health
curl http://localhost:8000/api/health
```

## Environment Variables

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `QDRANT_URL` | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | Qdrant Cloud API key |
| `QDRANT_COLLECTION` | Collection name (default: `book_chunks`) |
| `EMBEDDING_MODEL` | Embedding model (default: `openai/text-embedding-3-small`) |
| `LLM_MODEL` | LLM model (default: `google/gemini-flash-1.5`) |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check + chunk count |
| `POST` | `/api/chat` | Ask a question, get an answer with citations |
| `POST` | `/api/index/rebuild` | Trigger background reindex of docs |

### POST /api/chat

```json
{
  "query": "What is Physical AI?",
  "scope": "global",
  "session_id": "optional-uuid"
}
```

Response:
```json
{
  "session_id": "uuid",
  "turn_id": "uuid",
  "answer": "Physical AI refers to...",
  "citations": [
    {
      "chunk_id": "...",
      "chapter_title": "Introduction",
      "section_title": "What is Physical AI",
      "url_fragment": "/intro-physical-ai#what-is-physical-ai",
      "relevance_score": 0.92
    }
  ]
}
```
