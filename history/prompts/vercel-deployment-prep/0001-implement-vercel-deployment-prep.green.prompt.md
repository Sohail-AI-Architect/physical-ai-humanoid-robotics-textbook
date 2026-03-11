---
id: 0001
title: Implement Vercel Deployment Prep
stage: green
date: 2026-03-11
surface: agent
model: claude-sonnet-4-6
feature: vercel-deployment-prep
branch: main
user: sohail-345
command: implement
labels: ["vercel", "deployment", "docusaurus", "dual-deploy", "github-pages"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - docusaurus.config.ts
  - src/config/api.ts
  - src/theme/AuthProvider/index.tsx
  - vercel.json
tests:
  - Verified Vercel build succeeds (VERCEL=1, baseUrl /)
  - Verified GitHub Pages build succeeds (default, baseUrl /physical-ai-humanoid-robotics-textbook/)
---

## Prompt

Implement the following plan:

# Plan: Prepare for Vercel Deployment

## Context
The Docusaurus frontend is currently deployed to GitHub Pages at `/physical-ai-humanoid-robotics-textbook/`. We need to prepare it for Vercel deployment at root `/` while keeping GitHub Pages working (dual support). The backend (FastAPI + auth-server) stays on HuggingFace Spaces. CORS updates for the Vercel domain will be done after the first deploy once the auto-assigned domain is known.

## Changes (4 files)

### 1. `docusaurus.config.ts` - Environment-aware config
- Detect Vercel via `process.env.VERCEL` (set automatically by Vercel)
- Set `url` and `baseUrl` dynamically
- Add `apiBaseUrl` and `authBaseUrl` to `customFields` so components can read them

### 2. `src/config/api.ts` - Read API base from config
- Import `useDocusaurusContext` pattern or read from `siteConfig.customFields`
- Fall back to current HF Spaces URL

### 3. `src/theme/AuthProvider/index.tsx` - Read auth base from config
- Read `authBaseUrl` from `siteConfig.customFields`
- Fall back to current HF Spaces URL

### 4. `vercel.json` - SPA rewrites
- Replace legacy `routes` with modern `rewrites` for Docusaurus SPA fallback

## Response snapshot

Implemented all 4 file changes as specified in the plan:

1. **docusaurus.config.ts** -- Added environment detection logic at the top of the file: `isVercel` flag from `process.env.VERCEL`, dynamic `siteUrl` (Vercel placeholder vs GitHub Pages URL), dynamic `baseUrl` (`/` vs `/physical-ai-humanoid-robotics-textbook/`), and `apiBaseUrl`/`authBaseUrl` custom fields pointing to HuggingFace Spaces backends. Replaced all hardcoded `url`, `baseUrl`, and `customFields` values with the new variables.

2. **src/config/api.ts** -- Updated to read `apiBaseUrl` from `siteConfig.customFields` via `useDocusaurusContext()`, with HF Spaces fallback for safety.

3. **src/theme/AuthProvider/index.tsx** -- Updated to read `authBaseUrl` from `siteConfig.customFields` via `useDocusaurusContext()`, with HF Spaces fallback for safety.

4. **vercel.json** -- Replaced the legacy `routes` array with a modern `rewrites` array containing a single SPA fallback rule (`source: "/(.*)"` to `destination: "/index.html"`).

5. **Verification** -- Both `VERCEL=1 npm run build` (baseUrl `/`) and default `npm run build` (baseUrl `/physical-ai-humanoid-robotics-textbook/`) completed successfully with no errors.

## Outcome

- Impact: Docusaurus frontend now supports dual deployment to both Vercel (root /) and GitHub Pages (/physical-ai-humanoid-robotics-textbook/) via environment detection
- Tests: Both VERCEL=1 and default builds verified successfully; no runtime test suite exists yet
- Files: 4 files modified (docusaurus.config.ts, src/config/api.ts, src/theme/AuthProvider/index.tsx, vercel.json)
- Next prompts: Connect Vercel project and deploy; update CORS on HF Spaces backends with the assigned Vercel domain; add Vercel-specific environment variables if needed
- Reflection: Clean separation of environment detection at config level means components read from customFields without needing to know about deployment target

## Evaluation notes (flywheel)

- Failure modes observed: None; both build targets succeeded on first attempt
- Graders run and results (PASS/FAIL): Manual build verification PASS (Vercel), PASS (GitHub Pages)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Deploy to Vercel and verify runtime behavior with actual domain assignment
