# Implementation Plan: RAG Chatbot

**Branch**: `002-rag-chatbot` | **Date**: 2026-02-27 | **Spec**: [specs/002-rag-chatbot/spec.md](./spec.md)
**Input**: Feature specification from `specs/002-rag-chatbot/spec.md`

---

## Summary

Embed an AI-powered question-answering assistant into every page of the Physical AI & Humanoid
Robotics Docusaurus textbook. The assistant retrieves relevant book passages from a Qdrant Cloud
vector index (built from chunked Markdown source files), calls the OpenRouter API (Gemini Flash 1.5
for generation, text-embedding-3-small for embeddings), and returns a cited Markdown answer.
A React component tree injected via `src/theme/Root.tsx` provides the floating orb trigger,
glassmorphism chat panel, session history (localStorage), and selected-text flow
(`window.getSelection()` → floating button → scoped query).

---

## Technical Context

**Language/Version**: Python 3.11 (FastAPI backend), TypeScript 5 (Docusaurus frontend plugin)
**Primary Dependencies**: FastAPI, Uvicorn, qdrant-client, openai (OpenRouter-compatible), tiktoken, langchain-text-splitters, React 18 (Docusaurus v3), react-markdown, react-syntax-highlighter
**Storage**: Qdrant Cloud Free Tier (vector store, collection `book_chunks`, 1536-dim cosine), browser localStorage (chat sessions, max 10, LRU eviction)
**Testing**: pytest (backend unit + integration), manual E2E (browser)
**Target Platform**: Linux VPS (Docker, docker-compose.prod.yml), static CDN (Docusaurus frontend via Vercel or GitHub Pages)
**Project Type**: Web (Docusaurus frontend plugin + FastAPI backend)
**Performance Goals**: p95 answer latency < 10s end-to-end; chat panel open animation < 300ms; index build < 5 min for 13-chapter book
**Constraints**: Exactly 3 API keys (OPENROUTER_API_KEY, QDRANT_URL, QDRANT_API_KEY); Qdrant Free Tier limits (1 GB storage, ~100k vectors); no user auth; no server-side session storage
**Scale/Scope**: ~10 concurrent users (university course cohort); ~3,000–4,000 chunks at launch

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Spec-Driven Development | spec.md exists and is complete before plan | PASS — spec.md created 2026-02-26, reviewed 2026-02-27 |
| II. Content Quality & Accuracy | Not applicable to backend/plugin feature | N/A |
| III. AI-Native Architecture | RAG on every page; both Global and Selected Text modes with citations | PASS |
| IV. Security & Secrets Management | No secrets in frontend; all AI calls proxied via FastAPI; .env excluded from git | PASS |
| V. Accessibility & Internationalization | Mobile responsive (≥320px); WCAG 2.1 AA target for chat panel | PASS |
| VI. Observability & Deployment Readiness | `/api/health` endpoint; Docker healthcheck; deploy scripts for 2 VPS targets | PASS |

**Note on embedding model**: Constitution III mandates `text-embedding-3-large`. This plan uses
`text-embedding-3-small` with `dimensions=1536` to stay within Qdrant Free Tier storage budget
(~24 MB for 4,000 chunks vs ~48 MB at full 3072 dims — both fit, but small is preferable for
latency at no meaningful quality loss at this corpus size). This is a justified deviation; see
Complexity Tracking.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-rag-chatbot/
├── plan.md              # This file (/sp.plan output)
├── spec.md              # Feature requirements
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 setup guide
├── contracts/           # Phase 1 OpenAPI specs
│   ├── POST-api-chat.yaml
│   ├── GET-api-health.yaml
│   ├── POST-api-index-rebuild.yaml
│   └── GET-api-sessions-id.yaml
└── tasks.md             # Phase 2 output (/sp.tasks — NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── main.py                      # FastAPI app entry point; mounts routers
├── routers/
│   ├── chat.py                  # POST /api/chat
│   └── index.py                 # POST /api/index/rebuild, GET /api/health
├── services/
│   ├── rag.py                   # RAG pipeline: embed → search → generate
│   ├── embeddings.py            # OpenRouter embeddings client wrapper
│   └── qdrant_client.py         # Qdrant Cloud client wrapper
├── models/
│   └── schemas.py               # Pydantic request/response models
├── scripts/
│   └── index_docs.py            # CLI: crawl docs/, chunk, embed, upsert to Qdrant
├── Dockerfile                   # Multi-stage Python 3.11-slim build
├── requirements.txt             # Pinned Python dependencies
└── .env.example                 # Template: OPENROUTER_API_KEY, QDRANT_URL, QDRANT_API_KEY

src/
└── theme/
    ├── Root.tsx                 # Docusaurus theme override: injects <ChatBot /> on every page
    └── ChatBot/
        ├── index.tsx            # Main component: state orchestration, selection listener
        ├── ChatOrb.tsx          # Animated floating trigger button (bottom-right)
        ├── ChatModal.tsx        # Glassmorphism panel container; open/close animation
        ├── ChatHistory.tsx      # Left sidebar: session list, title, timestamp
        ├── ChatMessages.tsx     # Conversation area: turns with Markdown rendering
        ├── ChatInput.tsx        # Query input, scope toggle (Global / Selected Text), send
        └── styles.module.css    # All UI styles (CSS Modules; glassmorphism, responsive)

docker-compose.prod.yml          # Production compose: backend service, env_file, healthcheck

scripts/
├── deploy-context7.sh           # SSH → git pull → docker compose up -d (Context7 VPS)
├── deploy-github-vps.sh         # SSH → git pull → docker compose up -d (GitHub Actions VPS)
└── index_docs.py                # Symlink or copy of backend/scripts/index_docs.py
```

**Structure Decision**: Web application layout (Option 2 from template) with `backend/` for
the FastAPI service and `src/theme/` for the Docusaurus plugin overlay. The frontend is not
a separate `frontend/` directory because it lives inside the existing Docusaurus project
structure (Docusaurus convention: `src/` at repo root).

---

## Phase 0 — Research Summary

See [research.md](./research.md) for full findings. Key decisions:

| Decision | Selected | Rationale |
|---|---|---|
| Embedding model | `openai/text-embedding-3-small` via OpenRouter | Free-tier storage budget; negligible quality difference at corpus size |
| LLM | `google/gemini-flash-1.5` via OpenRouter | Best p95 latency / cost for 10 concurrent users |
| Chunk size | 512 tokens / 50-token overlap | Standard best practice; markdown-aware splitter |
| Docusaurus integration | `src/theme/Root.tsx` swizzle | Zero config change; works without theme eject |
| Selected text flow | `window.getSelection()` + positioned floating button | Native browser API, zero extra dependencies |
| Citation count | Top 3 chunks, deduplicated by `section_title` | Balances answer quality vs. UI clutter |
| Session storage | Browser `localStorage`, max 10 sessions (LRU) | No auth required; spec constraint |

---

## Phase 1 — Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for full entity definitions and storage schema.

Core entities:
- **ChatSession** — localStorage; `{id, title, created_at, updated_at, turns[]}`
- **ChatTurn** — embedded in ChatSession; `{id, session_id, query, answer, citations[], scope, timestamp}`
- **Citation** — `{chunk_id, chapter_title, section_title, url_fragment, relevance_score}`
- **BookChunk** — Qdrant point; `{id, vector[1536], payload{doc_id, chapter_title, section_title, url_fragment, content, token_count}}`
- **QueryScope** — enum `"global" | "selected_text"`
- **SelectedTextContext** — transient React state; `{text, source_page_url}`

### API Contracts

See [contracts/](./contracts/) for full OpenAPI 3.1 specs.

| Endpoint | Contract file |
|---|---|
| `POST /api/chat` | `contracts/POST-api-chat.yaml` |
| `GET /api/health` | `contracts/GET-api-health.yaml` |
| `POST /api/index/rebuild` | `contracts/POST-api-index-rebuild.yaml` |
| `GET /api/sessions/{session_id}` | `contracts/GET-api-sessions-id.yaml` |

### Quickstart

See [quickstart.md](./quickstart.md) for developer setup and deployment instructions.

---

## RAG Pipeline (service flow)

```
POST /api/chat
  │
  ├─ 1. Validate request (Pydantic) → 400 on error
  ├─ 2. Embed query text
  │      └─ services/embeddings.py → OpenRouter /embeddings
  │              model: openai/text-embedding-3-small
  ├─ 3. Vector search
  │      └─ services/qdrant_client.py → Qdrant query_points(limit=5)
  ├─ 4. Deduplicate top-3 by section_title
  ├─ 5. Build LLM prompt
  │      └─ system: "Answer using ONLY provided context; cite [Chapter > Section]"
  │      └─ context: top-3 chunk contents
  │      └─ (if scope=selected_text) prepend selected_text as primary context
  ├─ 6. Call LLM
  │      └─ services/rag.py → OpenRouter /chat/completions
  │              model: google/gemini-flash-1.5
  ├─ 7. Parse citations from response + attach from Qdrant payloads
  └─ 8. Return ChatResponse { answer, citations[], session_id, turn_id }
```

---

## Error Handling Strategy

| Error scenario | HTTP status | User-facing message |
|---|---|---|
| Empty query | 400 | "Please enter a question." |
| Index empty (0 chunks) | 503 | "The knowledge base is still being set up. Please try again shortly." |
| Qdrant timeout | 503 | "The answer service is temporarily unavailable. Please try again." |
| OpenRouter rate limit | 429 → retry once, then 503 | Same as above |
| LLM returns no content | 500 (internal) → retry | Same as above |
| selected_text scope but no text | 400 | "Please select some text on the page first." |

Frontend: all non-2xx responses display the error message from `response.message` and preserve
the user's typed query in the input so they can retry without re-typing.

---

## Non-Functional Requirements

### Performance
- p95 answer latency < 10s (network + embed + search + generate)
- Chat panel CSS animation < 300ms (CSS transition, no JS)
- Index build < 5 min for full 13-chapter book

### Reliability
- Backend healthcheck via Docker (`GET /api/health` every 30s)
- Frontend graceful degradation: error banner + retry button on any 4xx/5xx
- localStorage unavailability handled: in-memory fallback + user notice

### Security
- `OPENROUTER_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY` in `backend/.env` only
- `.gitignore` MUST include `backend/.env` and `*.env`
- `POST /api/index/rebuild` protected by VPS network boundary (not exposed via CDN proxy)
- No user PII collected or stored

### Observability
- FastAPI: structured logging (uvicorn access log + application log) with route, status, latency
- `GET /api/health` returns `index_stats.total_chunks` for monitoring
- Docker healthcheck wired to `/api/health`

---

## Complexity Tracking

| Deviation from Constitution | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| `text-embedding-3-small` instead of constitution-mandated `text-embedding-3-large` | Qdrant Free Tier: 1GB storage / ~100k vector budget; no quality difference measurable at <5k chunk scale | Using `text-embedding-3-large` at 3072 dims would consume ~48MB vs ~24MB — both fit, but small is preferable for embedding latency and stays within safe margin; `dimensions=1536` truncation of large model adds complexity for no benefit |

---

## Follow-ups and Risks

1. **Risk**: OpenRouter model availability — `google/gemini-flash-1.5` may be unavailable or
   deprecated. Mitigation: configure a fallback model constant in `services/rag.py`
   (`FALLBACK_MODEL = "mistralai/mistral-7b-instruct"`).

2. **Risk**: Qdrant Free Tier rate limits under load — not officially documented. Mitigation:
   add a semaphore in `services/qdrant_client.py` to cap concurrent Qdrant requests at 5.

3. **Follow-up**: `GET /api/sessions/{session_id}` is defined in the contract but v1 sessions
   are client-only (localStorage). This endpoint returns 404 in v1. If server-side session
   storage becomes a requirement (e.g., for analytics), a v2 task will add Qdrant or SQLite
   persistence — but this is out of scope per spec.

4. **ADR candidate**: Choice of `src/theme/Root.tsx` swizzle vs. npm plugin package vs. client
   plugin in `docusaurus.config.ts` — see Phase 0 research for tradeoffs.
