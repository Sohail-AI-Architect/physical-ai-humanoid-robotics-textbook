# Quickstart: Better-Auth + Personalize + Urdu Translation

**Feature**: 003-auth-personalize-urdu

## Prerequisites

- Node.js 20+ (for Better-Auth server)
- Python 3.11+ (for FastAPI backend)
- Neon Postgres database (free tier)
- OpenRouter API key
- `.env.local` with all keys configured

## Environment Variables

```bash
# .env.local (add to existing)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=http://localhost:3001
```

## Integration Scenarios

### Scenario 1: New User Signup (P1)
1. User clicks "Sign Up" in navbar → SignUp form renders.
2. Fills name, email, password, software multi-select, hardware selects.
3. Frontend calls `POST /api/auth/sign-up/email` on Better-Auth server (port 3001).
4. Better-Auth creates user + session in Neon Postgres, sets cookie.
5. AuthProvider context updates → navbar shows user name.

### Scenario 2: Sign In / Sign Out (P1)
1. User clicks "Sign In" → SignIn form renders.
2. Frontend calls `POST /api/auth/sign-in/email`.
3. Cookie set → session active → navbar updates.
4. Sign Out: `POST /api/auth/sign-out` → cookie cleared → guest state.

### Scenario 3: Personalize Chapter (P2)
1. Authenticated user opens a chapter → sees "Personalize for Me" button.
2. Click → frontend extracts chapter markdown from DOM.
3. Calls `POST /api/personalize` on FastAPI (port 8000) with session token + chapter content.
4. FastAPI validates session, reads user profile from Postgres, checks cache.
5. Cache miss → calls OpenRouter with personalization prompt → stores result → returns.
6. Frontend replaces article content with personalized markdown.
7. "Show Original" button restores original content (kept in React state).

### Scenario 4: Translate to Urdu (P2)
1. Authenticated user clicks "Translate to Urdu" button on chapter.
2. Frontend calls `POST /api/translate` with session token + chapter content.
3. FastAPI checks translation cache (shared, keyed by chapter_slug + content_hash).
4. Cache miss → calls OpenRouter with translation prompt → stores → returns.
5. Frontend replaces content with Urdu markdown.
6. Sets `localStorage['urdu_pref_<slug>'] = 'true'`.
7. On next visit, auto-fetches Urdu version.

### Scenario 5: Edit Profile (P3)
1. User navigates to `/profile` page.
2. Current profile fetched via `GET /api/profile`.
3. User edits fields → `PUT /api/profile`.
4. Next personalization request uses updated profile (new profile_hash → cache miss → fresh personalization).

## Local Development Setup

```bash
# 1. Start Better-Auth server
cd auth-server && npm install && npm run dev  # port 3001

# 2. Start FastAPI backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload  # port 8000

# 3. Start Docusaurus frontend
npm start  # port 3000
```
