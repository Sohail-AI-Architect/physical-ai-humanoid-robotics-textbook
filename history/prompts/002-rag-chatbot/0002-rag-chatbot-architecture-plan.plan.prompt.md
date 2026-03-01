---
id: "0002"
title: "RAG Chatbot Architecture Plan"
stage: plan
date: "2026-02-27"
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-rag-chatbot
branch: 002-rag-chatbot
user: sohail-345
command: /sp.plan
labels: ["rag", "chatbot", "architecture", "fastapi", "docusaurus", "qdrant", "openrouter"]
links:
  spec: specs/002-rag-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-rag-chatbot/plan.md
  - specs/002-rag-chatbot/research.md
  - specs/002-rag-chatbot/data-model.md
  - specs/002-rag-chatbot/quickstart.md
  - specs/002-rag-chatbot/contracts/POST-api-chat.yaml
  - specs/002-rag-chatbot/contracts/GET-api-health.yaml
  - specs/002-rag-chatbot/contracts/POST-api-index-rebuild.yaml
  - specs/002-rag-chatbot/contracts/GET-api-sessions-id.yaml
tests:
  - manual E2E: open chat panel, submit question, verify cited answer < 10s
  - manual E2E: highlight text, click contextual button, verify scoped answer
  - manual E2E: close/reopen browser, verify session history persists
---

## Prompt

002-rag-chatbot

## Response snapshot

Generated full /sp.plan output for feature 002-rag-chatbot: RAG chatbot embedded in Physical AI
Docusaurus textbook. Artifacts produced:

- plan.md: complete implementation plan with technical context (Python 3.11 / TypeScript 5),
  Constitution Check (all 6 gates PASS with one justified deviation on embedding model),
  full project directory structure (backend/ + src/theme/ChatBot/), RAG pipeline flow,
  error handling strategy, NFRs, and complexity tracking.

- research.md: Phase 0 findings covering OpenRouter API (text-embedding-3-small for embeddings,
  google/gemini-flash-1.5 for generation), Qdrant Cloud Free Tier limits and Python client usage,
  512-token markdown-aware chunking strategy, src/theme/Root.tsx swizzle pattern, Docker
  multi-stage Dockerfile, citation payload schema (top-3 chunks deduplicated by section),
  and window.getSelection() selected text flow.

- data-model.md: All 6 entities defined — ChatSession, ChatTurn, Citation, QueryScope,
  BookChunk (Qdrant), SelectedTextContext. localStorage schema with LRU-10 eviction.
  TypeScript interfaces and Qdrant collection config (1536-dim cosine).

- quickstart.md: Step-by-step dev setup (Python venv, uvicorn --reload), index build
  (index_docs.py), frontend (npm run start), Docker prod, Context7 VPS deploy, GitHub VPS
  deploy, and E2E verification steps.

- contracts/: 4 OpenAPI 3.1 YAML files for POST /api/chat, GET /api/health,
  POST /api/index/rebuild, GET /api/sessions/{session_id} with full request/response schemas,
  examples, and error taxonomy.

## Outcome

- Impact: Complete architecture plan for RAG chatbot feature; all Phase 1 artifacts created; ready for /sp.tasks
- Tests: Manual E2E test scenarios defined in spec; pytest suite to be created in /sp.tasks
- Files: 8 new files across specs/002-rag-chatbot/ and its subdirectories
- Next prompts: /sp.tasks to generate dependency-ordered testable tasks; then /sp.implement for backend, then frontend
- Reflection: Constitution Check passed all 6 gates; one justified deviation (embedding model size) documented in Complexity Tracking

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): Constitution Check — all gates PASS
- Prompt variant (if applicable): v1
- Next experiment: run /sp.tasks and verify task ordering matches RAG pipeline dependencies (backend before frontend)
