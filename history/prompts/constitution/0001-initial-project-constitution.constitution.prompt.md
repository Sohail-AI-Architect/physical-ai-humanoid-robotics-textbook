---
id: "0001"
title: Initial Project Constitution – Physical AI Textbook
stage: constitution
date: 2026-02-26
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: sohail-345
command: /sp.constitution
labels: ["constitution","physical-ai","humanoid-robotics","docusaurus","rag","better-auth"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - history/prompts/constitution/0001-initial-project-constitution.constitution.prompt.md
tests:
  - none
---

## Prompt

# Master Specification: Physical AI & Humanoid Robotics Textbook

## Project Name
Physical AI & Humanoid Robotics – AI-Native Textbook & Learning Platform

## Project Goal
Ek complete university-level AI-native textbook banana hai "Physical AI & Humanoid Robotics"
course ke liye. Yeh Docusaurus pe based hoga, GitHub Pages / Vercel pe deploy hoga, aur har
requirement (base + 4 bonuses) fully implement hoga using Claude Code + Spec-Kit Plus.

## Total Requirements (7)
1. AI/Spec-Driven Book Creation (Base)
2. Integrated RAG Chatbot (Base)
3. Base Functionality (100 points)
4. Claude Code Subagents & Agent Skills (+50 bonus)
5. Signup + Signin with Better-Auth (+50 bonus)
6. Personalize Content Button per Chapter (+50 bonus)
7. Translate to Urdu Button per Chapter (+50 bonus)

## Tech Stack (Exact)
- Frontend/Book: Docusaurus v3 (TypeScript) + Tailwind
- Chatbot: Custom ChatKit component + OpenAI Agents SDK
- Backend: FastAPI + Uvicorn
- Vector DB: Qdrant Cloud (Free Tier)
- Database: Neon Serverless Postgres
- Auth: better-auth.com
- LLM: gpt-4o-mini
- Embedding: text-embedding-3-large
- Deployment: Vercel + Render/Railway
- Subagents: Claude Code Subagents

[Full master spec provided — see constitution for complete derivation]

## Response snapshot

Constitution v1.0.0 ratified at `.specify/memory/constitution.md`.

Six core principles defined:
1. I. Spec-Driven Development – spec-first mandate, PHR/ADR obligations
2. II. Content Quality & Accuracy – 13-week outline, version-pinned code examples
3. III. AI-Native Architecture – RAG chatbot, subagents, personalization, Urdu translation
4. IV. Security & Secrets Management – .env, parameterized SQL, session validation
5. V. Accessibility & Internationalization – WCAG 2.1 AA, mobile 320px+, Urdu toggle
6. VI. Observability & Deployment Readiness – /health endpoint, Vercel/Render CI/CD, demo video

Tech Stack & Constraints table and Development Workflow sections added.
Sync Impact Report embedded as HTML comment at top of constitution.

## Outcome

- ✅ Impact: Project constitution ratified from blank template; all 7 requirements encoded as
  testable, declarative principles.
- 🧪 Tests: No automated tests applicable to constitution document.
- 📁 Files: .specify/memory/constitution.md created/overwritten at v1.0.0
- 🔁 Next prompts: /sp.specify to create first feature spec; /sp.plan for architecture;
  /sp.adr if significant decisions surface during planning.
- 🧠 Reflection: Master spec was comprehensive; all placeholders resolved without ambiguity.
  RATIFICATION_DATE set to today (2026-02-26) as original date is unknown.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Run /sp.clarify on first feature spec to validate
  principle coverage before planning begins.
