# Implementation Plan: Better-Auth + Personalize + Urdu Translation

**Branch**: `003-auth-personalize-urdu` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-auth-personalize-urdu/spec.md`

## Summary

Add authentication (Better-Auth + Neon Postgres), per-chapter AI personalization, and Urdu translation to the Docusaurus textbook. Better-Auth runs as a standalone Node.js auth server (port 3001). FastAPI backend (port 8000) handles personalization/translation via OpenRouter. Frontend gets auth context provider, signup/signin forms, and chapter action buttons.

## Technical Context

**Language/Version**: TypeScript 5 (auth server + frontend), Python 3.11 (FastAPI backend)
**Primary Dependencies**: better-auth, @better-auth/client, pg (Node.js); FastAPI, asyncpg, httpx (Python); React 18 (Docusaurus v3)
**Storage**: Neon Serverless Postgres (users, sessions, caches)
**Testing**: Manual E2E (signup → personalize → translate flow)
**Target Platform**: Web (Docusaurus SSG + API servers)
**Project Type**: Web application (3 services: frontend, auth server, API backend)
**Performance Goals**: Sign-in <2s, personalization <15s, translation <20s (per SC-002/003/004)
**Constraints**: Free-tier Neon Postgres, OpenRouter free/cheap models, no Next.js
**Scale/Scope**: Single course cohort, ~20 chapters

## Constitution Check

- [X] **I. Spec-Driven**: spec.md exists with 5 user stories, 13 FRs, 8 SCs
- [X] **II. Content Quality**: N/A (no chapter content changes)
- [X] **III. AI-Native**: Personalization + translation use OpenRouter Gemini Flash (not gpt-4o-mini as constitution says — updated to match actual stack)
- [X] **IV. Security**: Secrets in .env.local, session validation server-side, parameterized SQL
- [X] **V. Accessibility**: Urdu toggle without reload, technical terms preserved
- [X] **VI. Observability**: /health endpoint exists, auth errors logged

**Constitution deviation**: Constitution says "gpt-4o-mini" and "text-embedding-3-large" but actual stack uses OpenRouter Gemini Flash and Cohere embeddings. This is acceptable — constitution reflects initial plan, implementation uses cost-effective alternatives.

## Project Structure

### Documentation (this feature)

```text
specs/003-auth-personalize-urdu/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: technology research
├── data-model.md        # Phase 1: database schema
├── quickstart.md        # Phase 1: integration scenarios
├── contracts/
│   ├── auth-api.md      # Better-Auth endpoints
│   └── feature-api.md   # FastAPI personalize/translate/profile endpoints
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (repository root)

```text
auth-server/                    # NEW — Better-Auth Node.js server
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts               # Express server + Better-Auth handler
│   └── auth.ts                # betterAuth() config with additionalFields
└── .env.local                 # → .gitignore (symlink or copy)

backend/app/                    # EXISTING — extend FastAPI
├── main.py                    # Add auth routers
├── middleware/
│   └── auth.py                # NEW — session validation middleware
├── routers/
│   ├── chat.py                # Existing
│   ├── index.py               # Existing
│   ├── personalize.py         # NEW
│   ├── translate.py           # NEW
│   └── profile.py             # NEW
├── services/
│   ├── personalize.py         # NEW — OpenRouter personalization
│   ├── translate.py           # NEW — OpenRouter translation
│   └── cache.py               # NEW — Postgres cache read/write
├── models/
│   ├── schemas.py             # Existing + new models
│   └── db.py                  # NEW — asyncpg connection pool
└── rag/                       # Existing (unchanged)

src/theme/                      # EXISTING — extend Docusaurus
├── Root.tsx                   # Wrap with AuthProvider
├── AuthProvider/
│   ├── index.tsx              # NEW — React context + Better-Auth client
│   └── types.ts               # NEW — User, Session types
├── AuthForms/
│   ├── SignUpForm.tsx         # NEW
│   ├── SignInForm.tsx         # NEW
│   └── styles.module.css     # NEW
├── NavbarItems/
│   └── AuthNavbarItem.tsx    # NEW — user name / sign in links
├── ChapterActions/
│   ├── index.tsx              # NEW — Personalize + Translate buttons
│   ├── PersonalizeButton.tsx  # NEW
│   ├── TranslateButton.tsx    # NEW
│   └── styles.module.css     # NEW
├── ProfilePage/
│   ├── index.tsx              # NEW — edit background profile
│   └── styles.module.css     # NEW
├── ChatBot/                   # Existing (unchanged)
└── DocItem/
    └── Layout.tsx             # SWIZZLE — inject ChapterActions
```

**Structure Decision**: Three-service architecture (auth-server, backend, frontend) extending the existing two-service setup. The auth-server is a minimal Node.js process running Better-Auth with Neon Postgres.

## Architecture Decisions

### AD-1: Standalone Better-Auth Server
Better-Auth is Node.js only; our backend is Python FastAPI. Running Better-Auth as a separate Express server on port 3001 is the cleanest integration. FastAPI validates sessions by reading the shared `session` table in Postgres directly.

### AD-2: Server-Side Cache in Postgres
Personalization and translation results are cached in Neon Postgres (not localStorage or Redis). This enables:
- Translation cache sharing across all users
- Personalization cache persistence across devices
- Simple invalidation via content/profile hash comparison

### AD-3: Frontend Extracts Chapter Content
The Docusaurus frontend extracts the current chapter's markdown from the rendered DOM and sends it to the API. This avoids the backend needing access to the docs source files.

### AD-4: Session Token in Authorization Header
The frontend sends the Better-Auth session token as `Authorization: Bearer <token>` to FastAPI endpoints. FastAPI reads the token, looks up the `session` table, and extracts the `user_id`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 3rd service (auth-server) | Better-Auth is Node.js only, FastAPI is Python | No Python Better-Auth equivalent; spec mandates Better-Auth |

## Implementation Phases

### Phase A: Auth Server + Database (P1 — Stories 1 & 2)
1. Initialize `auth-server/` with Better-Auth + Express + Neon Postgres
2. Configure `additionalFields` for software/hardware background
3. Create `src/theme/AuthProvider/` with Better-Auth client
4. Build SignUp and SignIn forms
5. Add AuthNavbarItem (user name / sign in links)
6. Test: signup → signin → signout → navbar state

### Phase B: Personalization (P2 — Story 3)
1. Add FastAPI auth middleware (session validation via Postgres)
2. Create personalization service + Postgres cache
3. Create `POST /api/personalize` endpoint
4. Build ChapterActions with "Personalize for Me" button
5. Swizzle DocItem/Layout to inject ChapterActions
6. Test: login → open chapter → personalize → show original toggle

### Phase C: Urdu Translation (P2 — Story 4)
1. Create translation service + Postgres cache
2. Create `POST /api/translate` endpoint
3. Add "Translate to Urdu" button to ChapterActions
4. Implement localStorage language preference per chapter
5. Test: login → translate → back to English → revisit (auto-Urdu)

### Phase D: Profile Editing (P3 — Story 5)
1. Create `GET/PUT /api/profile` endpoints
2. Build ProfilePage component
3. Add profile link in navbar for logged-in users
4. Test: edit profile → personalize chapter → verify new content

## Risks

1. **Better-Auth version breaking changes**: Pin exact version in package.json. Low risk — v1.x is stable.
2. **OpenRouter rate limits on free models**: Add retry with backoff; show user-friendly error on failure.
3. **Long chapter translation timeout**: Gemini Flash is fast but large chapters (>5000 words) may take >20s. Mitigation: stream response or show progress.

## Follow-ups

- Update constitution tech stack table to reflect actual stack (Cohere, OpenRouter Gemini Flash vs gpt-4o-mini)
- Consider SSR for auth pages if SEO matters
- Add email verification flow (Better-Auth supports it, but not in P1 scope)
