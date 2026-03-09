---
id: 0005
title: Fix Page Not Found baseUrl
stage: green
date: 2026-03-08
surface: agent
model: claude-sonnet-4-6
feature: 003-auth-personalize-urdu
branch: 003-auth-personalize-urdu
user: sohail-345
command: fix
labels: ["routing", "baseUrl", "docusaurus"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - docusaurus.config.ts
tests:
  - none
---

## Prompt

Fix Page Not Found issues in this Docusaurus project.

1. Read docusaurus.config.ts, src/pages/profile.tsx (if exists), src/pages/index.tsx, sidebars.ts or sidebars.js
2. Make sure baseUrl is set to '/' in docusaurus.config.ts
3. If src/pages/profile.tsx exists, check it's valid. If not, create a simple profile page.
4. Check src/theme/Root.tsx and any swizzled DocItem components for issues.
5. Make sure routing works for all doc pages.
6. DO write code fixes directly to files.

## Response snapshot

Changed baseUrl from '/physical-ai-humanoid-robotics-textbook/' to '/' in docusaurus.config.ts. Verified all swizzled components (Root.tsx, DocItem/Layout.tsx, NavbarItem/ComponentTypes.tsx), pages (index.tsx, profile.tsx), sidebar config, and theme components (AuthProvider, AuthForms, ChapterActions, ChatBot, ProfilePage) exist and have valid imports. No other issues found.

## Outcome

- Impact: Fixed local dev routing by correcting baseUrl
- Tests: none
- Files: docusaurus.config.ts
- Next prompts: Test build with npm run build, verify GitHub Pages deployment config
- Reflection: The baseUrl was set for GitHub Pages subdirectory deployment, causing 404s in local dev

## Evaluation notes (flywheel)

- Failure modes observed: baseUrl mismatch between local dev and GitHub Pages
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Use environment variable for baseUrl to support both local and GH Pages
