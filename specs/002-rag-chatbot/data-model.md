# Data Model: RAG Chatbot

**Feature**: 002-rag-chatbot
**Branch**: `002-rag-chatbot`
**Date**: 2026-02-27
**Phase**: 1 — Design

---

## Overview

The chatbot system spans two storage layers:

| Layer | Technology | Entities |
|---|---|---|
| Browser (client-side) | `localStorage` / `IndexedDB` | `ChatSession`, `ChatTurn`, `Citation` |
| Qdrant Cloud | Vector store | `BookChunk` (vectors + payload) |

No server-side session storage is required. The FastAPI backend is stateless between requests.

---

## Entities

### ChatSession

Stored in browser `localStorage` under key `chatbot_sessions`.

```typescript
interface ChatSession {
  id: string;               // UUID v4, generated client-side
  title: string;            // Auto-generated from first query (first 60 chars) or "New Chat"
  created_at: string;       // ISO 8601 timestamp
  updated_at: string;       // ISO 8601 timestamp, updated on each new turn
  turns: ChatTurn[];        // Ordered array, oldest first
}
```

**Storage format**: JSON array of `ChatSession[]` serialized to `localStorage`.
**Retention**: Last 10 sessions (LRU eviction when limit exceeded).
**Degradation**: If `localStorage` is unavailable (blocked by browser), session stored only
in React state (in-memory for current page visit); a visible notice informs the user.

---

### ChatTurn

Embedded within `ChatSession.turns[]`.

```typescript
interface ChatTurn {
  id: string;               // UUID v4
  session_id: string;       // Parent session ID (denormalized for convenience)
  query: string;            // User's question text
  answer: string;           // Assistant's Markdown-formatted answer
  citations: Citation[];    // Top-3 source citations, deduplicated by section
  scope: QueryScope;        // "global" | "selected_text"
  selected_text?: string;   // Present only when scope === "selected_text"
  timestamp: string;        // ISO 8601, when query was submitted
  latency_ms?: number;      // Round-trip time in ms (for display/diagnostics)
}
```

---

### Citation

```typescript
interface Citation {
  chunk_id: string;         // Qdrant point ID (e.g. "chapter-04-kinematics-chunk-003")
  chapter_title: string;    // e.g. "Chapter 4: Kinematics"
  section_title: string;    // e.g. "4.3 Inverse Kinematics"
  url_fragment: string;     // Absolute path + anchor, e.g. "/docs/chapter-04-kinematics#43-inverse-kinematics"
  relevance_score: number;  // Cosine similarity score [0.0, 1.0]
}
```

**Display rule**: Render as `[section_title](url_fragment)` with `chapter_title` as hover tooltip
or prefix label.

---

### QueryScope

```typescript
type QueryScope = "global" | "selected_text";
```

- `"global"`: Query is matched against the full Qdrant index.
- `"selected_text"`: The `selected_text` field is used as primary context in the LLM prompt;
  Qdrant search is also performed to find related book sections for citations.

---

### BookChunk

Stored in Qdrant Cloud. Represents a single text chunk from the textbook.

```typescript
// Qdrant Point structure
interface BookChunk {
  id: string;               // Deterministic ID: "{doc_id}-chunk-{zero_padded_index}"
                            // e.g. "chapter-04-kinematics-chunk-003"
  vector: number[];         // Embedding vector, length 1536 (text-embedding-3-small)
  payload: {
    doc_id: string;         // Slug of source file, e.g. "chapter-04-kinematics"
    chunk_id: string;       // Same as point ID (denormalized)
    chapter_title: string;  // Full chapter title from frontmatter or heading
    section_title: string;  // Nearest ## or ### heading above this chunk
    url_fragment: string;   // Docusaurus URL path + anchor fragment
    content: string;        // Raw chunk text (for LLM context window)
    token_count: number;    // Token count of this chunk
    source_file: string;    // Relative path to source .md file
    indexed_at: string;     // ISO 8601 timestamp of last index run
  };
}
```

**Collection name**: `book_chunks`
**Distance metric**: Cosine
**Vector size**: 1536

---

### SelectedTextContext

Transient; exists in React state only (not persisted separately — preserved as `ChatTurn.selected_text`).

```typescript
interface SelectedTextContext {
  text: string;             // The highlighted passage
  source_page_url: string;  // Current page URL (window.location.href)
  selection_range?: {       // Browser selection range metadata (optional)
    start_offset: number;
    end_offset: number;
  };
}
```

---

## Storage Schema: localStorage

```
localStorage key: "chatbot_sessions"
value: JSON.stringify(ChatSession[])

localStorage key: "chatbot_version"
value: "1"  // schema version for future migrations
```

**Max sessions retained**: 10 (configurable constant `MAX_SESSIONS = 10`).
**Total estimated storage**: ~500 KB for 10 sessions of 20 turns each (well within 5 MB localStorage limit).

---

## Qdrant Collection Schema

```
Collection: book_chunks
Vector config:
  size: 1536
  distance: Cosine
  on_disk: false  (fits in free tier RAM)

Payload indexes (for filtering):
  doc_id: keyword
  chapter_title: keyword
```

**Payload index on `doc_id`**: enables future per-chapter scoped queries if needed.

---

## Data Flow Diagram

```
User types query
      │
      ▼
ChatInput.tsx
  → POST /api/chat { query, scope, selected_text?, session_id? }
      │
      ▼ (FastAPI)
services/rag.py
  1. Embed query → openrouter /embeddings
  2. Search Qdrant → top-5 chunks by cosine similarity
  3. Build LLM prompt with top-3 chunks as context
  4. Call OpenRouter LLM → answer text
  5. Return { answer, citations[], session_id, turn_id }
      │
      ▼
ChatMessages.tsx
  → Render Markdown answer + Citation links
  → Persist new ChatTurn to localStorage (ChatSession)
```

---

## API ↔ Frontend Contract (TypeScript types matching OpenAPI)

```typescript
// POST /api/chat request body
interface ChatRequest {
  query: string;
  scope: QueryScope;
  selected_text?: string;
  session_id?: string;
}

// POST /api/chat response
interface ChatResponse {
  answer: string;
  citations: Citation[];
  session_id: string;
  turn_id: string;
}

// GET /api/health response
interface HealthResponse {
  status: "ok" | "degraded";
  index_stats: {
    total_chunks: number;
    collection_name: string;
  };
}
```
