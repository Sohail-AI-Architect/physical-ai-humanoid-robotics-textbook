# Research: RAG Chatbot for Physical AI Textbook

**Feature**: 002-rag-chatbot
**Branch**: `002-rag-chatbot`
**Date**: 2026-02-27
**Phase**: 0 — Research

---

## 1. OpenRouter API

### Embeddings

OpenRouter exposes an OpenAI-compatible `/embeddings` endpoint. The recommended model for text
embeddings is **`openai/text-embedding-3-small`** via the OpenRouter proxy:

- **Endpoint**: `https://openrouter.ai/api/v1/embeddings`
- **Model ID**: `openai/text-embedding-3-small`
- **Dimensions**: 1536 (default) — fits within Qdrant Free Tier limits
- **Cost**: ~$0.02 / 1M tokens (negligible for a ~300k-token textbook)
- **Auth header**: `Authorization: Bearer $OPENROUTER_API_KEY`
- **Note**: `text-embedding-3-large` (constitution default) uses 3072 dims; at free-tier scale
  `text-embedding-3-small` is preferred to stay within the 100k vector / 1 GB Qdrant limit.
  If the constitution mandates `text-embedding-3-large`, use dimension reduction: `dimensions=1536`
  parameter to halve storage while preserving most quality.

**Python call example**:
```python
import openai

client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

response = client.embeddings.create(
    model="openai/text-embedding-3-small",
    input=["chunk text here"],
)
vector = response.data[0].embedding  # list[float], len=1536
```

### LLM for RAG chat

Recommended: **`google/gemini-flash-1.5`** (primary) with **`mistralai/mistral-7b-instruct`**
as fallback.

| Model | Context window | Cost (input/output per 1M) | Notes |
|---|---|---|---|
| `google/gemini-flash-1.5` | 1M tokens | $0.075 / $0.30 | Fast, cheap, strong instruction following |
| `mistralai/mistral-7b-instruct` | 32k tokens | $0.055 / $0.055 | Ultra-cheap, solid for Q&A |
| `openai/gpt-4o-mini` | 128k tokens | $0.15 / $0.60 | Constitution baseline, moderate cost |

**Selected**: `google/gemini-flash-1.5` — best latency/cost for p95 < 10s target at university
scale (~10 concurrent users).

**RAG prompt template**:
```
You are an assistant for the "Physical AI & Humanoid Robotics" textbook.
Answer the question using ONLY the provided context chunks.
If the answer is not in the context, say "This topic is not covered in this textbook."
Cite sources as [Chapter Title > Section Title].

Context:
{context_chunks}

Question: {query}

Answer:
```

---

## 2. Qdrant Cloud Free Tier

### Limits

| Resource | Free Tier Limit |
|---|---|
| Clusters | 1 |
| Collections | Unlimited (but 1 recommended to stay within storage) |
| Storage | 1 GB |
| Vector count | ~100k vectors (at 1536 dims, float32 = ~614 MB for 100k) |
| RAM | 1 GB shared |
| API rate limit | Not officially published; ~100 req/s safe assumption |

**Practical implication**: A 13-chapter textbook at 512-token chunks with ~50% overlap produces
approximately 2,000–4,000 chunks. At 1536 dims × 4 bytes = 6 KB/vector → total ~24 MB.
Well within free-tier limits.

### Python Client Usage

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

# Create collection (once)
client.create_collection(
    collection_name="book_chunks",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
)

# Upsert chunks
client.upsert(
    collection_name="book_chunks",
    points=[
        PointStruct(
            id=chunk_id,
            vector=embedding,
            payload={
                "doc_id": "chapter-04-kinematics",
                "chunk_id": "chunk-042",
                "chapter_title": "Chapter 4: Kinematics",
                "section_title": "4.3 Inverse Kinematics",
                "url_fragment": "/docs/chapter-04-kinematics#inverse-kinematics",
                "content": "chunk text...",
            },
        )
    ],
)

# Query
results = client.query_points(
    collection_name="book_chunks",
    query=query_embedding,
    limit=3,
    with_payload=True,
)
```

---

## 3. RAG Chunking Strategy

### Strategy: Markdown-Aware Recursive Splitting

- **Chunk size**: 512 tokens (tiktoken `cl100k_base` tokenizer)
- **Overlap**: 50 tokens
- **Splitter priority**: `\n## ` → `\n### ` → `\n\n` → `\n` → ` `
  (splits at markdown headers first, then paragraphs, then sentences)

**Rationale**:
- Respects semantic boundaries (section breaks > paragraph breaks > sentence breaks)
- 512 tokens fits comfortably in embedding model context
- 50-token overlap preserves continuity across chunk boundaries
- Markdown-aware splitting prevents splitting mid-heading

**Metadata per chunk**:
```python
{
    "doc_id": str,         # e.g. "chapter-04-kinematics"
    "chunk_id": str,       # e.g. "chapter-04-kinematics-chunk-003"
    "chapter_title": str,  # e.g. "Chapter 4: Kinematics"
    "section_title": str,  # e.g. "4.3 Inverse Kinematics"
    "url_fragment": str,   # e.g. "/docs/chapter-04-kinematics#43-inverse-kinematics"
    "content": str,        # Raw chunk text (stored for display/reranking)
    "token_count": int,    # Actual token count of this chunk
}
```

**Implementation approach**: Use `langchain_text_splitters.MarkdownHeaderTextSplitter` followed
by `RecursiveCharacterTextSplitter` with tiktoken tokenizer. Walk `docs/` directory, parse
frontmatter for chapter/section metadata, split, embed, upsert.

---

## 4. Docusaurus Plugin Pattern

### Chosen approach: `src/theme/` component swizzling (theme override)

**Options considered**:

| Pattern | Pros | Cons |
|---|---|---|
| `src/theme/` component override | No plugin registration needed; works in any Docusaurus v3 project without theme eject | Components must be placed exactly in `src/theme/` |
| Client-side plugin in `docusaurus.config.ts` | Can inject scripts globally | Requires plugin package or inline JS; harder to maintain React components |
| npm plugin package | Clean separation | Requires publish/symlink; overkill for single-project use |

**Selected**: `src/theme/` override via `src/theme/ChatBot/` — place a `Root.tsx` wrapper or
use `swizzle --wrap` to inject the `<ChatBot />` component into every page's root without
modifying theme internals.

**Implementation**:
1. Create `src/theme/Root.tsx` (wraps every page):
```tsx
// src/theme/Root.tsx
import React from 'react';
import OriginalRoot from '@theme-original/Root';
import ChatBot from './ChatBot';

export default function Root({ children }) {
  return (
    <OriginalRoot>
      {children}
      <ChatBot />
    </OriginalRoot>
  );
}
```
2. `ChatBot/index.tsx` renders the orb + modal.
3. No `docusaurus.config.ts` changes required for component injection.

**Environment variable** for backend URL: `CHATBOT_API_URL` (set as `customFields` in
`docusaurus.config.ts` or read from `process.env.CHATBOT_API_URL` during build).

---

## 5. Docker Deployment

### Multi-stage Dockerfile for FastAPI

```dockerfile
# Stage 1: builder
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.prod.yml

```yaml
version: "3.9"
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Secrets**: All three API keys passed via `./backend/.env` (excluded from git via `.gitignore`).
Never baked into image layers.

### Deploy scripts

- `scripts/deploy-context7.sh`: SSH + `docker compose pull && docker compose up -d`
- `scripts/deploy-github-vps.sh`: Used in GitHub Actions workflow; same logic with
  `${{ secrets.VPS_SSH_KEY }}` and `${{ secrets.VPS_HOST }}`.

---

## 6. Citation Strategy

### Storage in Qdrant Payload

Each chunk stored with the following citation fields in its Qdrant payload:

```json
{
  "doc_id": "chapter-04-kinematics",
  "chunk_id": "chapter-04-kinematics-chunk-003",
  "chapter_title": "Chapter 4: Kinematics",
  "section_title": "4.3 Inverse Kinematics",
  "url_fragment": "/docs/chapter-04-kinematics#43-inverse-kinematics",
  "content": "...",
  "relevance_score": 0.87
}
```

### Top-3 Chunks Return Strategy

- Query Qdrant with `limit=5`; take top 3 by cosine similarity score
- All 3 chunks' payloads returned as `citations[]` in API response
- Frontend renders each citation as: `[Chapter Title > Section Title](url_fragment)`
- `relevance_score` included in response for potential future reranking; not displayed to user

### Deduplication

If multiple top-3 chunks share the same `section_title`, deduplicate citations by `section_title`
before returning (keep highest-score chunk per section).

---

## 7. Selected Text Flow

### Implementation

1. **Browser event listener** (in `ChatBot/index.tsx`):
```tsx
useEffect(() => {
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      setSelectedText(text);
      setShowSelectionButton(true);
      // Position button near selection end
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setButtonPosition({ top: rect.bottom + window.scrollY, left: rect.right });
    } else {
      setShowSelectionButton(false);
    }
  };
  document.addEventListener('selectionchange', handleSelectionChange);
  return () => document.removeEventListener('selectionchange', handleSelectionChange);
}, []);
```

2. **Floating button** (`ChatOrb.tsx` variant): positioned absolutely near selection end.

3. **On button click**: open modal, set scope to `selected_text`, pre-populate context display.

4. **POST /api/chat** body:
```json
{
  "query": "What does this mean?",
  "scope": "selected_text",
  "selected_text": "...the highlighted passage...",
  "session_id": "optional-existing-session"
}
```

5. **Backend**: when `scope == "selected_text"`, embed the `selected_text` directly and perform
   Qdrant search within that embedded context (or use selected_text as additional context in the
   LLM prompt without Qdrant search — chosen for simplicity at this scale).

---

## Decision Summary

| Decision | Selected | Rationale |
|---|---|---|
| Embedding model | `openai/text-embedding-3-small` (1536 dim) | Qdrant free tier storage budget |
| LLM | `google/gemini-flash-1.5` | Best latency/cost for p95 < 10s at 10 users |
| Chunk size | 512 tokens / 50 overlap | Standard RAG best practice; markdown-aware |
| Frontend integration | `src/theme/Root.tsx` swizzle | Zero config changes to Docusaurus core |
| Selected text flow | `window.getSelection()` + floating button | Native browser API, no deps |
| Citation count | Top 3, deduplicated by section | Balance completeness vs. UI clutter |
| Deployment | Docker multi-stage + `docker-compose.prod.yml` | Single compose, 2 deploy targets |
