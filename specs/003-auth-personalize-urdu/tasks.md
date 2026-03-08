# Tasks: Better-Auth + Personalize + Urdu Translation

**Input**: Design documents from `/specs/003-auth-personalize-urdu/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted. Manual E2E testing per user story checkpoint.

**Organization**: Tasks grouped by user story (5 stories from spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize auth server, database connection, and shared config

- [X] T001 Create auth-server/ directory with package.json (better-auth, express, pg, dotenv, typescript, tsx) in auth-server/package.json
- [X] T002 Create auth-server/tsconfig.json with Node.js TypeScript config
- [X] T003 Add DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL to .env.example (do NOT commit real values)
- [X] T004 Install asyncpg in backend/requirements.txt for Postgres access from FastAPI
- [X] T005 Create database connection pool module in backend/app/models/db.py using asyncpg with DATABASE_URL from env

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth server core + FastAPI auth middleware — MUST complete before user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create Better-Auth config with additionalFields (softwareBackground, gpuTier, ramTier, hasJetson, robotPlatform) and PostgreSQL Pool adapter in auth-server/src/auth.ts
- [X] T007 Create Express server mounting Better-Auth handler on /api/auth/* in auth-server/src/index.ts (port 3001, CORS for localhost:3000)
- [X] T008 Run auth-server locally and verify Better-Auth auto-creates user/session/account tables in Neon Postgres
- [X] T009 Create FastAPI auth middleware that reads Authorization Bearer token, queries session table via asyncpg, extracts user_id in backend/app/middleware/auth.py
- [X] T010 Register auth middleware and new routers (personalize, translate, profile) in backend/app/main.py
- [X] T011 Add Pydantic models for PersonalizeRequest, PersonalizeResponse, TranslateRequest, TranslateResponse, UserProfile, ProfileUpdateRequest in backend/app/models/schemas.py

**Checkpoint**: Auth server running on 3001, FastAPI can validate session tokens, Postgres tables exist

---

## Phase 3: User Story 1 — Signup with Background Profile (Priority: P1) MVP

**Goal**: New user signs up with email/password + software/hardware background questionnaire

**Independent Test**: Sign up → verify user in DB with correct background fields → confirmed logged in

### Implementation for User Story 1

- [X] T012 [US1] Create AuthProvider React context with Better-Auth client (createAuthClient pointing to localhost:3001) in src/theme/AuthProvider/index.tsx
- [X] T013 [P] [US1] Create TypeScript types for User (with background fields) and Session in src/theme/AuthProvider/types.ts
- [X] T014 [US1] Wrap Root.tsx with AuthProvider context in src/theme/Root.tsx
- [X] T015 [US1] Create SignUpForm component with fields: name, email, password, software background (multi-select: Python, ROS 2, CUDA, PyTorch, Isaac Sim, Unity, Gazebo, C++, Docker, Linux), hardware background (GPU tier, RAM tier, Jetson yes/no, robot platform) in src/theme/AuthForms/SignUpForm.tsx
- [X] T016 [P] [US1] Create SignUpForm CSS module with glassmorphism styling matching ChatBot in src/theme/AuthForms/styles.module.css
- [X] T017 [US1] Wire SignUpForm to call Better-Auth signUp.email() with all fields including additionalFields, handle success (redirect + set session) and errors (duplicate email, missing fields) in src/theme/AuthForms/SignUpForm.tsx
- [X] T018 [US1] Create AuthNavbarItem component showing user name when logged in, "Sign Up / Sign In" links when logged out in src/theme/NavbarItems/AuthNavbarItem.tsx
- [X] T019 [US1] Register AuthNavbarItem in docusaurus.config.ts navbar items (position: right, before GitHub link)

**Checkpoint**: User can sign up with full background profile, navbar shows their name

---

## Phase 4: User Story 2 — Sign In / Sign Out (Priority: P1)

**Goal**: Returning user signs in with email/password, can sign out, navbar reflects auth state

**Independent Test**: Sign in with valid credentials → navbar shows name. Sign out → navbar shows guest links.

### Implementation for User Story 2

- [X] T020 [US2] Create SignInForm component with email/password fields, error handling ("Invalid email or password") in src/theme/AuthForms/SignInForm.tsx
- [X] T021 [US2] Wire SignInForm to call Better-Auth signIn.email(), handle success (redirect + session cookie) and error (401) in src/theme/AuthForms/SignInForm.tsx
- [X] T022 [US2] Add sign-out functionality to AuthNavbarItem — call Better-Auth signOut(), clear session context in src/theme/NavbarItems/AuthNavbarItem.tsx
- [X] T023 [US2] Create modal or page routing for SignUp/SignIn forms — clicking navbar links opens the appropriate form in src/theme/AuthForms/AuthModal.tsx

**Checkpoint**: Full auth flow works — sign up, sign out, sign in, sign out. Navbar updates correctly.

---

## Phase 5: User Story 3 — Personalize Chapter Content (Priority: P2)

**Goal**: Logged-in user clicks "Personalize for Me" on any chapter, content rewrites based on their background

**Independent Test**: Log in as "Python only, no GPU" user → open NVIDIA Isaac chapter → click Personalize → verify beginner-level rewrite

### Implementation for User Story 3

- [X] T024 [US3] Create SQL for personalization_cache table (user_id, chapter_slug, profile_hash, content) — run via asyncpg on startup or manual migration in backend/app/models/db.py
- [X] T025 [US3] Create cache service with get_personalization/set_personalization (keyed by user_id + chapter_slug + profile_hash) in backend/app/services/cache.py
- [X] T026 [US3] Create personalization service: build prompt with user profile + chapter content, call OpenRouter Gemini Flash via httpx, return rewritten markdown in backend/app/services/personalize.py
- [X] T027 [US3] Create POST /api/personalize endpoint with auth dependency — check cache, call personalization service on miss, store result in backend/app/routers/personalize.py
- [X] T028 [US3] Create ChapterActions component container that renders at top of chapter pages (only for authenticated users) in src/theme/ChapterActions/index.tsx
- [X] T029 [P] [US3] Create ChapterActions CSS module with button styling matching glassmorphism theme in src/theme/ChapterActions/styles.module.css
- [X] T030 [US3] Create PersonalizeButton component — extracts chapter markdown from DOM, calls POST /api/personalize with session token, replaces article content, adds "Show Original" toggle in src/theme/ChapterActions/PersonalizeButton.tsx
- [X] T031 [US3] Swizzle DocItem/Layout to inject ChapterActions component at top of every doc page in src/theme/DocItem/Layout.tsx

**Checkpoint**: Logged-in user can personalize any chapter. "Show Original" toggles back. Button hidden for guests.

---

## Phase 6: User Story 4 — Translate Chapter to Urdu (Priority: P2)

**Goal**: Logged-in user clicks "Translate to Urdu" on any chapter, content translated with technical terms preserved

**Independent Test**: Log in → open any chapter → click Translate to Urdu → verify Urdu text with English technical terms → click Back to English → verify English returns

### Implementation for User Story 4

- [X] T032 [US4] Create SQL for translation_cache table (chapter_slug, content_hash, urdu_content) — run via asyncpg on startup in backend/app/models/db.py
- [X] T033 [US4] Add get_translation/set_translation to cache service (keyed by chapter_slug + content_hash, shared across users) in backend/app/services/cache.py
- [X] T034 [US4] Create translation service: build Urdu translation prompt preserving technical terms, call OpenRouter Gemini Flash via httpx in backend/app/services/translate.py
- [X] T035 [US4] Create POST /api/translate endpoint with auth dependency — check cache, call translation service on miss, store result in backend/app/routers/translate.py
- [X] T036 [US4] Create TranslateButton component — calls POST /api/translate, replaces content with Urdu markdown, shows "Back to English" toggle, sets localStorage preference per chapter in src/theme/ChapterActions/TranslateButton.tsx
- [X] T037 [US4] Add auto-load Urdu logic to ChapterActions: on mount, check localStorage for urdu_pref_<slug>, if true auto-fetch Urdu version in src/theme/ChapterActions/index.tsx
- [X] T038 [US4] Add mutual exclusion: disable Translate while Personalize is processing and vice versa in src/theme/ChapterActions/index.tsx

**Checkpoint**: Logged-in user can translate any chapter to Urdu. Language preference persists. Technical terms stay English.

---

## Phase 7: User Story 5 — Edit Background Profile (Priority: P3)

**Goal**: Logged-in user can update their software/hardware background from a profile page

**Independent Test**: Log in → go to profile → change GPU → save → personalize a chapter → verify new content reflects updated GPU

### Implementation for User Story 5

- [X] T039 [US5] Create GET /api/profile endpoint returning authenticated user's background fields from user table in backend/app/routers/profile.py
- [X] T040 [US5] Create PUT /api/profile endpoint updating user's additionalFields in user table via asyncpg in backend/app/routers/profile.py
- [X] T041 [US5] Create ProfilePage component with pre-filled form (software multi-select, hardware selects), save button calling PUT /api/profile in src/theme/ProfilePage/index.tsx
- [X] T042 [P] [US5] Create ProfilePage CSS module with consistent styling in src/theme/ProfilePage/styles.module.css
- [X] T043 [US5] Add "Profile" link to AuthNavbarItem (visible only when logged in) and route /profile to ProfilePage in src/theme/NavbarItems/AuthNavbarItem.tsx

**Checkpoint**: User can view and edit their background. Changes reflect in next personalization.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, final integration

- [X] T044 [P] Add user-friendly error messages for AI model unavailability ("Service temporarily unavailable. Please try again in a moment.") in PersonalizeButton and TranslateButton
- [X] T045 [P] Add loading indicators: "Personalizing for your background..." and "Translating to Urdu..." with disabled buttons during processing in src/theme/ChapterActions/
- [X] T046 Handle session expiry edge case: personalized content stays visible (cached in state), but buttons hide until re-login in src/theme/ChapterActions/index.tsx
- [X] T047 Handle localStorage disabled/full: translation preference falls back to English, no crash in src/theme/ChapterActions/TranslateButton.tsx
- [X] T048 Add timeout handling for long chapters (>30s): show partial result with "Retry" option in backend/app/services/personalize.py and backend/app/services/translate.py
- [X] T049 Update backend/README.md with auth-server setup instructions and new API endpoints
- [X] T050 Final E2E manual test: signup with background → signin → personalize chapter → translate chapter → edit profile → re-personalize

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 Signup (Phase 3)**: Depends on Phase 2
- **US2 Sign In/Out (Phase 4)**: Depends on Phase 3 (needs signup to exist)
- **US3 Personalize (Phase 5)**: Depends on Phase 2 (needs auth middleware) + Phase 3 (needs users)
- **US4 Translate (Phase 6)**: Depends on Phase 5 (shares ChapterActions + cache infrastructure)
- **US5 Edit Profile (Phase 7)**: Depends on Phase 3 (needs users)
- **Polish (Phase 8)**: Depends on Phases 3–7

### User Story Dependencies

- **US1 (Signup)**: Foundational only — MVP story
- **US2 (Sign In/Out)**: US1 (needs registered users)
- **US3 (Personalize)**: US1 + Foundational (needs auth + users)
- **US4 (Translate)**: US3 (shares ChapterActions component + cache service)
- **US5 (Edit Profile)**: US1 (needs users)

### Parallel Opportunities

- T001/T002/T003 can run in parallel (setup files)
- T013/T016 can run in parallel (types + CSS, different files)
- T029/T042 can run in parallel (CSS modules, different files)
- T044/T045 can run in parallel (different components)
- US3 and US5 could theoretically parallel after US1 completes

---

## Parallel Example: Phase 1

```bash
# Launch setup tasks together:
Task T001: "Create auth-server/package.json"
Task T002: "Create auth-server/tsconfig.json"
Task T003: "Add env vars to .env.example"
Task T004: "Install asyncpg in requirements.txt"
Task T005: "Create db.py connection pool"
```

## Parallel Example: User Story 3

```bash
# After T027 (endpoint), launch in parallel:
Task T028: "Create ChapterActions container"
Task T029: "Create ChapterActions CSS"
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (auth server + middleware)
3. Complete Phase 3: US1 Signup
4. Complete Phase 4: US2 Sign In/Out
5. **STOP and VALIDATE**: Full auth flow works
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Auth infrastructure ready
2. US1 Signup → Users can register with background profile (MVP!)
3. US2 Sign In/Out → Full auth flow
4. US3 Personalize → Per-chapter AI personalization
5. US4 Translate → Per-chapter Urdu translation
6. US5 Edit Profile → Profile management
7. Polish → Error handling, edge cases

### Final Commit

```bash
git commit -m "feat: Step 3 - Better-Auth + Personalize Content + Urdu Translation (150 bonus)"
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable at its checkpoint
- Auth-server is a NEW Node.js service (port 3001) alongside FastAPI (port 8000)
- All AI calls use OpenRouter Gemini Flash via httpx (same pattern as existing RAG chatbot)
- Caches in Postgres avoid redundant AI calls
- 50 total tasks across 8 phases
