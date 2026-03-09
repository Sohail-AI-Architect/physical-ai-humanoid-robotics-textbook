---
id: "0002"
title: "Auth Personalize Urdu Plan"
stage: plan
date: "2026-03-01"
surface: agent
model: claude-sonnet-4-6
feature: 003-auth-personalize-urdu
branch: 003-auth-personalize-urdu
user: sohail-345
command: /sp.plan
labels: ["plan", "auth", "better-auth", "personalize", "urdu", "architecture"]
links:
  spec: specs/003-auth-personalize-urdu/spec.md
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - specs/003-auth-personalize-urdu/plan.md
  - specs/003-auth-personalize-urdu/research.md
  - specs/003-auth-personalize-urdu/data-model.md
  - specs/003-auth-personalize-urdu/quickstart.md
  - specs/003-auth-personalize-urdu/contracts/auth-api.md
  - specs/003-auth-personalize-urdu/contracts/feature-api.md
tests: []
---

## Prompt

/sp.plan Step 3: Better-Auth + Personalize + Urdu Translation — signup/signin with background profiling, per-chapter Personalize and Urdu Translate buttons for logged-in users. Better-Auth, Neon Postgres, OpenRouter models.

## Response snapshot

Generated complete architecture plan with 6 artifacts: research.md (Better-Auth in Docusaurus findings, standalone Node.js auth server decision), data-model.md (5 tables: user, session, account, personalization_cache, translation_cache), contracts/ (auth-api.md with 4 Better-Auth endpoints, feature-api.md with 4 FastAPI endpoints), quickstart.md (5 integration scenarios), plan.md (3-service architecture, 4 implementation phases, 3 risks). Key decision: Better-Auth runs as standalone Node.js server on port 3001 alongside FastAPI on port 8000.

## Outcome

- ✅ Impact: Complete architecture plan for Step 3 auth + personalize + urdu
- 🧪 Tests: N/A (plan phase)
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/auth-api.md, contracts/feature-api.md
- 🔁 Next prompts: /sp.tasks to generate dependency-ordered tasks
- 🧠 Reflection: Better-Auth being Node.js-only forced a 3rd service; cleanest approach is standalone auth server sharing Neon Postgres with FastAPI

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (plan phase)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
