---
id: 0006
title: Fix chatbot 503 error with retry logic
stage: green
date: 2026-03-08
surface: agent
model: claude-sonnet-4-6
feature: 003-auth-personalize-urdu
branch: 003-auth-personalize-urdu
user: sohail-345
command: fix
labels: ["bugfix", "retry", "error-handling", "openrouter", "cohere"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/rag/service.py
  - backend/app/routers/chat.py
  - backend/app/rag/embeddings.py
tests:
  - none
---

## Prompt

Read and fix the chatbot 503 error in this project. The issue is likely that after the first "hello" message works, subsequent questions that trigger RAG/OpenRouter calls fail with 503. Add retry logic and better error handling for OpenRouter API calls. Make sure the chat endpoint returns a graceful error message instead of 503.

## Response snapshot

Added exponential backoff retry logic (up to 3 attempts) to both `_call_llm` in `RAGService` and `embed_text`/`embed_batch` in `EmbeddingService`. Changed the chat endpoint to return a 200 with a user-friendly fallback message instead of raising HTTPException 503. Added logging throughout for observability.

## Outcome

- Impact: Chatbot no longer returns 503 on transient OpenRouter/Cohere failures; retries automatically with exponential backoff
- Tests: none
- Files: 3 modified (service.py, chat.py, embeddings.py)
- Next prompts: Test end-to-end with actual API keys, consider adding circuit breaker pattern
- Reflection: The root cause is transient API failures from OpenRouter (429/502/503/504) and Cohere; retry with backoff is the standard fix

## Evaluation notes (flywheel)

- Failure modes observed: OpenRouter returning 503 on subsequent calls, possibly rate limiting or cold-start
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add structured logging with request IDs for better debugging
