# Tasks: Integrated RAG Chatbot (002-rag-chatbot)

**Feature**: 002-rag-chatbot | **Branch**: 002-rag-chatbot
**Input**: specs/002-rag-chatbot/plan.md, spec.md, data-model.md, contracts/

---

## Phase 1: Setup

- [X] T001 Create backend/ directory structure: backend/routers/, backend/services/, backend/models/, backend/scripts/
- [X] T002 Create backend/requirements.txt with: fastapi==0.111.0, uvicorn[standard]==0.29.0, qdrant-client==1.9.1, openai==1.30.0, tiktoken==0.7.0, langchain-text-splitters==0.2.0, python-dotenv==1.0.1, pydantic==2.7.0, httpx==0.27.0
- [X] T003 Create backend/.env.example with keys: OPENROUTER_API_KEY, QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION=book_chunks, EMBEDDING_MODEL=openai/text-embedding-3-small, LLM_MODEL=google/gemini-flash-1.5
- [X] T004 Create backend/Dockerfile: python:3.11-slim base, WORKDIR /app, COPY requirements.txt, RUN pip install, COPY . ., CMD uvicorn main:app --host 0.0.0.0 --port 8000
- [X] T005 Create docker-compose.prod.yml: service "chatbot-api" built from ./backend, ports 8000:8000, env_file .env, restart always, healthcheck GET /api/health
- [X] T006 Create .env with placeholder values (gitignored): OPENROUTER_API_KEY=sk-or-v1-REPLACE, QDRANT_URL=https://REPLACE.qdrant.io:6333, QDRANT_API_KEY=REPLACE

**Checkpoint**: `docker-compose -f docker-compose.prod.yml build` succeeds.

---

## Phase 2: Foundation (Blocking Prerequisites)

- [X] T007 Create backend/models/schemas.py with Pydantic models: Citation(chunk_id, chapter_title, section_title, url_fragment, relevance_score), ChatTurn(id, query, answer, citations, scope, timestamp), ChatSession(id, title, created_at, turns), ChatRequest(query, scope, selected_text, session_id), ChatResponse(answer, citations, session_id, turn_id), HealthResponse(status, total_chunks, collection_name), IndexRebuildResponse(status, chunks_indexed, duration_ms)
- [X] T008 Create backend/services/qdrant_client.py: QdrantService class wrapping qdrant_client.QdrantClient, methods: get_client(), ensure_collection(name, vector_size=1536), upsert_chunks(chunks), search(query_vector, limit=5, filter=None), count_chunks(); reads QDRANT_URL + QDRANT_API_KEY from env
- [X] T009 Create backend/services/embeddings.py: EmbeddingService class using openai.OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY), method embed_text(text: str) -> list[float] calling model openai/text-embedding-3-small, method embed_batch(texts: list[str]) -> list[list[float]]
- [X] T010 Create backend/scripts/index_docs.py: CLI script that (1) reads all .md files from docs/ directory recursively using pathlib, (2) splits into 512-token chunks with 50-token overlap using langchain_text_splitters.RecursiveCharacterTextSplitter, (3) extracts metadata from frontmatter (title, sidebar_position) + file path as url_fragment, (4) embeds each chunk via EmbeddingService, (5) upserts to Qdrant with payload {doc_id, content, chapter_title, section_title, url_fragment, chunk_index}; accepts --docs-dir and --collection args
- [X] T011 [P] Create backend/main.py: FastAPI app with title "Physical AI RAG Chatbot API", CORS middleware allowing all origins (restrict in prod), include routers from routers/chat.py and routers/index.py, @app.get("/") returns {"status": "ok"}
- [X] T012 [P] Create src/theme/Root.tsx: Docusaurus swizzle wrapper that imports and renders {children} plus <ChatBotProvider><ChatBot /></ChatBotProvider>; use React.Suspense with null fallback for lazy loading

**Checkpoint**: `cd backend && pip install -r requirements.txt && python -c "from services.qdrant_client import QdrantService; print('OK')"` succeeds.

---

## Phase 3: User Story 1 — Ask a Question (P1) + User Story 2 — Selected Text (P1)

**Goal US1**: Student asks any question → cited answer ≤10s
**Goal US2**: Student highlights text → "Ask about this" button → scoped answer

- [X] T013 [US1] Create backend/services/rag.py: RAGService class with method answer(query: str, scope: str, selected_text: str | None) -> tuple[str, list[Citation]]; if scope=="selected_text" and selected_text, embed and search against selected_text directly without Qdrant; if scope=="global", embed query and search Qdrant top-5; build prompt with retrieved chunks; call OpenRouter LLM (google/gemini-flash-1.5) via openai client with system prompt instructing to cite sources; parse response to extract answer + citations; return (answer_text, citations)
- [X] T014 [US1] Create backend/routers/chat.py: POST /api/chat endpoint accepting ChatRequest, instantiates RAGService, calls answer(), wraps result in ChatResponse with new session_id (uuid4) if none provided and new turn_id; handles exceptions with 503 if OpenRouter/Qdrant unavailable
- [X] T015 [US1] Create backend/routers/index.py: GET /api/health endpoint returning HealthResponse with status="ok", total_chunks from QdrantService.count_chunks(), collection_name from env
- [X] T016 [P] [US1] Create src/theme/ChatBot/index.tsx: Main ChatBot component; manages state: isOpen(bool), sessions(ChatSession[]), currentSessionId(string|null), scope("global"|"selected_text"), selectedText(string); renders <ChatOrb onClick={toggle} /> and when isOpen renders <ChatModal>; exports ChatBotProvider context with these state values + setScope + setSelectedText
- [X] T017 [P] [US1] Create src/theme/ChatBot/ChatOrb.tsx: Floating button fixed bottom-right (right:24px, bottom:24px), 56px circle, uses CSS animation "orbPulse" (scale 1→1.08→1, 2s infinite), onClick opens modal; renders robot emoji or SVG icon; z-index 9999
- [X] T018 [P] [US1] Create src/theme/ChatBot/ChatModal.tsx: Modal overlay with glassmorphism panel (backdrop-filter: blur(20px), semi-transparent background), layout: flex row with <ChatHistory /> on left (240px, hidden on mobile) and main area with <ChatMessages /> + <ChatInput /> on right; close button top-right; renders only when isOpen=true
- [X] T019 [US1] Create src/theme/ChatBot/ChatInput.tsx: Textarea input (max 4 rows), send button, displays current scope as a label ("🌐 Global Book" or "📌 Selected Text"); onSubmit calls POST {apiUrl}/api/chat with {query, scope, selected_text, session_id}; shows loading spinner during fetch; on error shows inline error message with retry; clears input on successful send
- [X] T020 [US2] Add selected text detection to src/theme/ChatBot/index.tsx: useEffect listening to document "mouseup" and "touchend" events; when window.getSelection().toString().trim().length > 0, sets selectedText state and shows floating "Ask about this ✨" button near selection using Range.getBoundingClientRect(); button click sets scope to "selected_text", opens modal, focuses input
- [X] T021 [US2] Create "Ask about this" floating button in src/theme/ChatBot/index.tsx: position absolute/fixed near selection coordinates from getBoundingClientRect(); button styled with neon border, small pill shape; disappears when selection cleared or modal opens; z-index 10000

**Checkpoint**: Run backend (`uvicorn main:app`), index docs (`python scripts/index_docs.py`), open any book page, ask "What is ROS 2?" → answer with citation appears within 10s.

---

## Phase 4: User Story 3 — Session History (P2)

**Goal**: Previous sessions persist in localStorage, visible in history panel, resumable.

- [X] T022 [US3] Create src/theme/ChatBot/useSessionStorage.ts: Custom hook managing ChatSession[] in localStorage key "chatbot_sessions"; functions: loadSessions() -> ChatSession[], saveSession(session), deleteAllSessions(), pruneToLimit(max=10) using LRU eviction (remove oldest by created_at); handles localStorage unavailable gracefully (try/catch, returns [] and shows warning)
- [X] T023 [US3] Create src/theme/ChatBot/ChatHistory.tsx: Left sidebar panel (240px wide, full height); renders list of ChatSession cards sorted by updated_at desc; each card shows session title (first 40 chars of first question), formatted timestamp (e.g. "2h ago"), click selects session; "New Chat" button at top; "Clear history" button at bottom with confirmation (window.confirm or inline confirm state); on mobile hidden by default, toggled by hamburger icon in ChatModal header
- [X] T024 [US3] Wire session persistence into src/theme/ChatBot/index.tsx: on component mount call loadSessions(); when ChatInput sends a message and response arrives, update currentSession with new ChatTurn and call saveSession(); when "New Chat" clicked create new ChatSession with id=uuid, title="New Chat", turns=[]; when history card clicked set currentSessionId and load that session's turns into ChatMessages

**Checkpoint**: Complete a chat, close browser tab, reopen book page, open ChatBot → previous session visible in history sidebar.

---

## Phase 5: User Story 4 — Rich Formatting (P2) + User Story 5 — Scope Toggle (P2)

**Goal US4**: Answers render markdown + syntax-highlighted code + clickable citations.
**Goal US5**: Explicit scope toggle control always visible.

- [X] T025 [P] [US4] Install frontend deps: add "react-markdown": "^9.0.0" and "react-syntax-highlighter": "^15.5.0" and "@types/react-syntax-highlighter": "^15.5.13" to package.json and run npm install
- [X] T026 [P] [US4] Create src/theme/ChatBot/ChatMessages.tsx: Renders list of ChatTurn items; user messages in right-aligned bubble (electric blue gradient); assistant messages in left-aligned bubble (dark glassmorphism); uses ReactMarkdown with remarkGfm plugin; code blocks rendered with SyntaxHighlighter (theme: atomDark for dark mode); citations rendered as clickable <a> tags below answer bubble linking to url_fragment; typing indicator (3 animated dots) shown when isLoading=true
- [X] T027 [US5] Enhance src/theme/ChatBot/ChatInput.tsx scope toggle: add gradient pill toggle button below textarea; "🌐 Global Book" (blue) ↔ "📌 Selected Text" (purple); when toggling TO "Selected Text" with no selectedText in context, show inline hint "Highlight text on the page first"; toggle persists in ChatBotProvider context so all components can read current scope
- [X] T028 [P] [US4] Add citation rendering to src/theme/ChatBot/ChatMessages.tsx: after each assistant message render Citations section with header "📚 Sources:"; each citation is a pill-shaped link `[Chapter Title > Section Title]` that navigates to the url_fragment anchor; open in same tab (internal navigation); style with subtle border and hover highlight

**Checkpoint**: Ask "Show me a ROS 2 publisher example" → response shows syntax-highlighted Python code block + clickable citation links. Toggle scope → UI label updates instantly.

---

## Phase 6: User Story 6 — Futuristic UI (P3)

**Goal**: Immersive glassmorphism UI with animations, mobile-first, premium feel.

- [X] T029 [US6] Create src/theme/ChatBot/styles.module.css: Define all animations: orbPulse (scale pulse), orbGlow (box-shadow neon glow on hover), typingDot (bounce animation for 3 dots staggered 0/0.15/0.3s delay), modalSlideIn (translateY 20px→0 + opacity 0→1, 0.25s ease-out); define glassmorphism class: background rgba(15,15,30,0.85), backdrop-filter blur(20px), border 1px solid rgba(100,200,255,0.15), border-radius 16px, box-shadow 0 8px 32px rgba(0,0,0,0.4)
- [X] T030 [P] [US6] Apply glassmorphism to src/theme/ChatBot/ChatModal.tsx: use styles.glass class on modal panel; electric blue/purple gradient header bar; scrollable ChatMessages area with custom scrollbar (thin, neon accent color); ensure modal is max 90vw × 85vh on desktop, 100vw × 100vh on mobile
- [X] T031 [P] [US6] Style user message bubbles in src/theme/ChatBot/ChatMessages.tsx: linear-gradient(135deg, #1a6cf6, #7c3aed) background, white text, border-radius 18px 18px 4px 18px, padding 12px 16px, max-width 75%; assistant bubbles: glassmorphism background, cyan text accent, border-radius 18px 18px 18px 4px
- [X] T032 [P] [US6] Apply neon glow to src/theme/ChatBot/ChatOrb.tsx: on hover box-shadow 0 0 20px #1a6cf6, 0 0 40px #7c3aed; pulse animation via orbPulse class; gradient background linear-gradient(135deg, #1a6cf6 0%, #7c3aed 100%); ensure orb does not overlap Docusaurus "scroll to top" button (use bottom: 72px if that button is visible)
- [X] T033 [US6] Add mobile responsive styles to styles.module.css: @media (max-width: 768px) — ChatModal full screen (position fixed inset 0, border-radius 0); ChatHistory hidden by default, shown as slide-in drawer when hamburger pressed; ChatOrb bottom:16px right:16px; ensure all touch targets ≥ 44px; test at 375px viewport
- [X] T034 [P] [US6] Add "Clear history" confirmation UX to src/theme/ChatBot/ChatHistory.tsx: replace window.confirm with inline two-step confirm (button → shows "Are you sure? [Yes] [No]" inline, auto-cancels after 5s); style with red accent color

**Checkpoint**: Open book on mobile (375px DevTools), tap orb → full-screen modal opens with slide animation; orb glows on hover on desktop; typing dots animate while waiting for response.

---

## Phase 7: Deployment & Admin

- [X] T035 Create backend/routers/index.py POST /api/index/rebuild endpoint: spawns background task (FastAPI BackgroundTasks) that runs index_docs.py logic inline; returns IndexRebuildResponse immediately with status="rebuilding"; actual rebuild happens async; logs progress to stdout
- [X] T036 [P] Create scripts/deploy-context7.sh: bash script that SSH's to Context7 VPS (reads CONTEXT7_HOST, CONTEXT7_USER from local env), rsync's backend/ and docker-compose.prod.yml, runs `docker-compose -f docker-compose.prod.yml pull && docker-compose up -d --build`; prints live URL when done
- [X] T037 [P] Create scripts/deploy-github-vps.sh: same as deploy-context7.sh but reads GITHUB_VPS_HOST, GITHUB_VPS_USER; idempotent (safe to run multiple times)
- [X] T038 Create .github/workflows/deploy-chatbot.yml: GitHub Actions workflow triggering on push to main when backend/** changes; SSH deploy job using appleboy/ssh-action to run deploy-github-vps.sh on remote; uses GitHub Secrets: VPS_HOST, VPS_USER, VPS_SSH_KEY
- [X] T039 Update docs/index.md to add a note about the AI chatbot: one-sentence callout "💬 Click the AI orb (bottom-right) to ask questions about this book" near the top of the home page
- [X] T040 Create backend/README.md: local dev quickstart (pip install, set .env, python scripts/index_docs.py, uvicorn main:app --reload), Docker run, environment variable table, API endpoint table

---

## Dependencies

```
T001→T002→T003→T004→T005→T006       (sequential setup)
T006→T007→T008→T009→T010            (sequential foundation)
T010→T011, T012 [parallel]          (app entry + swizzle)
T011→T013→T014→T015                 (RAG pipeline → router → health)
T012→T016→T017→T018→T019            (frontend component tree)
T019→T020→T021                      (selected text detection)
T021→T022→T023→T024                 (session persistence)
T024→T025→T026→T027→T028            (rich formatting + scope)
T028→T029→T030→T031→T032→T033→T034  (UI polish)
T034→T035→T036→T037→T038→T039→T040  (deployment)
```

## Parallel Opportunities

- T011 + T012 (backend main + frontend swizzle — different stacks)
- T017 + T018 + T019 (ChatOrb, ChatModal, ChatInput — different files)
- T025 + T026 + T028 (npm install + ChatMessages + citations — independent)
- T030 + T031 + T032 (UI styling on different components)
- T036 + T037 (two independent deploy scripts)

## Implementation Strategy

**MVP** (T001–T021): Backend RAG pipeline + minimal frontend = US1 + US2 fully working.
Deliver first: students can ask questions and highlight text for scoped answers.

**Increment 2** (T022–T024): Session history = US3.

**Increment 3** (T025–T028): Rich formatting + scope toggle = US4 + US5.

**Increment 4** (T029–T034): Full UI polish = US6.

**Increment 5** (T035–T040): Deployment scripts + CI/CD.

Total tasks: **40** | US1+US2: 9 | US3: 3 | US4+US5: 4 | US6: 6 | Setup+Foundation: 12 | Deployment: 6
