---
id: 0007
title: Fix Urdu translate button code block preservation
stage: green
date: 2026-03-08
surface: agent
model: claude-sonnet-4-6
feature: 003-auth-personalize-urdu
branch: 003-auth-personalize-urdu
user: sohail-345
command: fix
labels: ["bugfix", "translate", "urdu", "code-blocks", "html"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - src/theme/ChapterActions/TranslateButton.tsx
  - src/theme/ChapterActions/index.tsx
  - backend/app/services/translate.py
tests:
  - none
---

## Prompt

Fix the Urdu Translate button in this Docusaurus + FastAPI project.

1. Read src/theme/ChapterActions/ directory contents
2. Read backend/app/routers/translate.py
3. Read src/theme/AuthProvider/ to understand how auth state is accessed
4. Make sure the translate button:
   - Only appears for logged-in users
   - Calls the backend /api/translate endpoint correctly
   - The backend endpoint works and preserves code blocks
5. Read src/theme/DocItem/ to see how ChapterActions is integrated
6. DO write code fixes directly to files.

## Response snapshot

Fixed three issues with the Urdu translate flow:

1. **Frontend sent `textContent` instead of `innerHTML`** — `articleEl.textContent` strips all HTML tags, so code blocks, headings, and formatting were lost before reaching the backend. Changed to `innerHTML` in both `TranslateButton.tsx` and the auto-translate effect in `index.tsx`.

2. **Backend prompt expected markdown but received plain text** — Updated the translation prompt in `translate.py` to expect HTML input, preserve `<pre>`/`<code>` elements, keep all HTML structure, and add `dir="rtl"` for Urdu text direction.

3. **`replaceContent` wrapped output in `white-space: pre-wrap`** — Since translated content is now HTML (not plain text), removed the wrapping div that forced pre-wrap formatting.

4. Increased `max_tokens` from 4096 to 8192 since HTML content is more verbose than plain text.

Auth gating was already correct: `ChapterActions/index.tsx` returns `null` when `!user`, and the button sends `session.token` in the Authorization header.
