---
id: "0001"
title: "rag-chatbot-spec"
stage: spec
date: 2026-02-26
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-rag-chatbot
branch: 002-rag-chatbot
user: sohail-345
command: /sp.specify
labels: [rag, chatbot, spec, docusaurus, openrouter, qdrant, selected-text, citations]
links:
  spec: specs/002-rag-chatbot/spec.md
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - specs/002-rag-chatbot/spec.md
  - specs/002-rag-chatbot/checklists/requirements.md
  - history/prompts/002-rag-chatbot/0001-rag-chatbot-spec.spec.prompt.md
tests:
  - checklists/requirements.md – manual validation checklist, all items PASS
---

## Prompt

Run the /sp.specify workflow for the RAG chatbot feature in the physical-ai-humanoid-robotics-textbook project.

Working directory: /home/sohail-345/physical-ai-humanoid-robotics-textbook

Steps:

1. Run `git fetch --all --prune` then check for existing branches/specs matching "rag-chatbot":
   - `git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-rag-chatbot'`
   - `git branch | grep -E '[0-9]+-rag-chatbot'`
   - `ls specs/ | grep -E '[0-9]+-rag-chatbot'`
   - Find highest number N, use N+1. If none found, use 2 (since 001 is taken).

2. Run the create-new-feature script:
   ```
   bash .specify/scripts/bash/create-new-feature.sh --json --number 2 --short-name "rag-chatbot" "SPEC Step 2: Integrated RAG Chatbot - OpenRouter + Qdrant Cloud + Futuristic ChatKit UI"
   ```
   Parse the JSON output for BRANCH_NAME and SPEC_FILE.

3. Read `.specify/templates/spec-template.md` to understand required sections.

4. Write a complete spec to the SPEC_FILE. The feature description is:

---
# SPEC Step 2: Integrated RAG Chatbot (Base Requirement 2) – ONLY OpenRouter + Context7 VPS & GitHub VPS

## Goal
Docusaurus book ke har page mein best-in-class, unique aur futuristic professional RAG chatbot embed karo. Global + Selected Text mode.

## STRICT CONSTRAINTS
- Sirf OpenRouter API (embedding + LLM)
- Vector DB = Qdrant Cloud FREE Tier
- Sirf 3 API keys allowed
- Backend fully Dockerized for Context7 VPS + GitHub VPS

## Required API Keys (.env.local mein exactly)
OPENROUTER_API_KEY=sk-or-v1-...
QDRANT_URL=https://xxx.us-east.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=...

## ChatKit UI – Best, Unique & Futuristic
- Glowing animated AI orb floating button (pulse + hover glow)
- Glassmorphism modal with heavy blur + neon accents
- Left sidebar chat history with beautiful cards
- Gradient toggle: Global Book ↔ Selected Text Only
- Electric blue / purple-cyan gradient bubbles
- Markdown + syntax highlight + clickable citations
- Auto "Ask about selected text" button
- Typing orb animation

## Deployment (Context7 VPS + GitHub VPS)
- Full docker-compose.prod.yml
- One-command deploy scripts for both servers
---

The spec must:
- Focus on WHAT users need and WHY (not HOW to implement)
- Be written for business stakeholders
- Have NO implementation details (no OpenRouter, Qdrant, Docker in requirements — those go in Assumptions)
- Have measurable, technology-agnostic success criteria
- Include user stories with priorities P1/P2/P3
- Max 3 [NEEDS CLARIFICATION] markers

Key actors: Students reading the textbook, Instructors.
Key user value: Ask questions about the book content, get cited answers, ask about selected text.

5. Create checklist at FEATURE_DIR/checklists/requirements.md

6. Validate spec against checklist items. Fix any failures.

7. Create PHR: run `bash .specify/scripts/bash/create-phr.sh --title "rag-chatbot-spec" --stage spec --feature "002-rag-chatbot" --json` then fill all placeholders.

8. Report: branch name, spec file path, checklist status, any NEEDS CLARIFICATION questions for the user.

## Response snapshot

Completed full /sp.specify workflow for feature 002-rag-chatbot:

1. Confirmed no existing rag-chatbot branches or specs; assigned number 002.
2. Ran create-new-feature.sh — created branch `002-rag-chatbot` and scaffolded spec file.
3. Read spec-template.md to understand all required sections.
4. Wrote complete spec to `specs/002-rag-chatbot/spec.md` with:
   - 6 user stories (2×P1, 3×P2, 1×P3) all with Given/When/Then acceptance scenarios
   - 5 edge cases including graceful degradation and re-indexing
   - 15 functional requirements (FR-001 to FR-015), technology-agnostic
   - 6 key entities defined
   - 7 measurable success criteria (SC-001 to SC-007)
   - Assumptions & Constraints section isolating OpenRouter/Qdrant/Docker details
   - Out of Scope section with 6 explicit exclusions
   - 2 NEEDS CLARIFICATION markers (within 3-max limit)
5. Created `specs/002-rag-chatbot/checklists/requirements.md` — all validation checks PASS.
6. Ran create-phr.sh and filled all PHR placeholders.

## Outcome

- Impact: Complete spec created for RAG chatbot feature; ready for /sp.plan
- Tests: Manual requirements checklist — all 10 structural and 8 content checks PASS
- Files: specs/002-rag-chatbot/spec.md, specs/002-rag-chatbot/checklists/requirements.md, history/prompts/002-rag-chatbot/0001-rag-chatbot-spec.spec.prompt.md
- Next prompts: Run /sp.plan for 002-rag-chatbot to produce architecture and ADR suggestions
- Reflection: Technology constraints cleanly separated from business requirements; 2 open clarification questions should be resolved before planning begins

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): requirements checklist — PASS (10/10 structural, 8/8 content)
- Prompt variant (if applicable): initial run
- Next experiment: resolve NEEDS CLARIFICATION items before /sp.plan to avoid rework in architecture phase
