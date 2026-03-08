# Research: Better-Auth + Personalize + Urdu Translation

**Feature**: 003-auth-personalize-urdu
**Date**: 2026-03-01
**Status**: Complete

## 1. Better-Auth in Docusaurus (Non-Next.js)

### Finding
Better-Auth is framework-agnostic. It provides a core server (`betterAuth()`) and a client (`createAuthClient()`). For Docusaurus (React SPA), we use:
- **Server**: Better-Auth runs inside the FastAPI backend via its Node.js SDK, OR we use the **REST API approach** — Better-Auth exposes REST endpoints that any client can call.
- **Client**: `@better-auth/client` works in any React app. No Next.js dependency.

### Decision: REST API via FastAPI proxy
Better-Auth's Node.js server is not compatible with our Python FastAPI backend. Instead:
1. Run a **lightweight Node.js Better-Auth server** as a separate process (port 3001).
2. FastAPI proxies `/api/auth/*` to the Better-Auth server OR the frontend calls Better-Auth directly.
3. **Simpler alternative chosen**: Use Better-Auth's **Node.js server as a standalone auth microservice** alongside FastAPI. The Docusaurus frontend calls it directly for auth, and calls FastAPI for RAG/personalize/translate.

### Better-Auth Custom Fields (additionalFields)
```typescript
// auth-server config
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      softwareBackground: { type: "string[]", required: true },
      gpuTier: { type: "string", required: true },
      ramTier: { type: "string", required: true },
      hasJetson: { type: "boolean", required: true },
      robotPlatform: { type: "string", required: true },
    },
  },
});
```

### Session Management
Better-Auth uses cookie-based sessions stored in the database. The client SDK provides `useSession()` hook. Sessions are validated server-side on every request.

## 2. Neon Serverless Postgres

### Connection
- Use `@neondatabase/serverless` for the Better-Auth server (Node.js).
- Use `psycopg2` or `asyncpg` in FastAPI for direct DB queries (read user profile for personalization).
- Connection string from `DATABASE_URL` env var.

### Schema (auto-managed by Better-Auth + custom)
Better-Auth auto-creates `user`, `session`, `account` tables. Custom fields are added to the `user` table via `additionalFields`.

## 3. OpenRouter for Personalization & Translation

### Model
- `google/gemini-2.0-flash-001` via OpenRouter (same as RAG chatbot).
- Already have the httpx pattern in `backend/app/rag/service.py`.

### Personalization Prompt Strategy
- System prompt: "Rewrite this chapter content for a student with the following background: {profile}. Simplify concepts they haven't learned, add depth for concepts they know."
- Input: chapter markdown + user profile JSON.
- Output: rewritten markdown.

### Translation Prompt Strategy
- System prompt: "Translate to Urdu. Keep all technical terms in English: ROS 2, CUDA, PyTorch, URDF, SLAM, etc. Preserve all markdown formatting."
- Input: chapter markdown.
- Output: Urdu markdown.

### Caching
- **PersonalizationCache**: Key = `(user_id, chapter_slug, profile_hash)`. Stored in Postgres.
- **TranslationCache**: Key = `(chapter_slug, content_hash)`. Stored in Postgres. Shared across all users.

## 4. Architecture Decision: Separate Auth Server

### Options Considered
1. **Better-Auth inside FastAPI** — Not possible; Better-Auth is Node.js only.
2. **Replace Better-Auth with Python auth** (e.g., FastAPI-Users) — Violates spec requirement for Better-Auth.
3. **Standalone Better-Auth Node.js server** — Clean separation; frontend calls auth server directly, FastAPI validates sessions by querying the shared Postgres DB.

### Chosen: Option 3
- Better-Auth runs on port 3001 as a small Express/Node server.
- FastAPI reads the `session` and `user` tables directly from Neon Postgres to validate auth tokens.
- Single DATABASE_URL shared by both services.

## 5. Frontend Integration in Docusaurus

### Auth UI
- Custom React components (not Docusaurus MDX pages) for Sign Up / Sign In forms.
- Swizzle `NavbarItem` to add auth state (user name / sign in links).
- Use `src/theme/AuthProvider/` React context wrapping Root.tsx.

### Chapter Buttons
- Swizzle `DocItem` (or use a Docusaurus plugin) to inject "Personalize for Me" and "Translate to Urdu" buttons at the top of every doc page.
- Buttons only visible when `useSession()` returns authenticated.
- Content replacement is client-side: fetch from FastAPI, replace innerHTML of the article body.

### Language Preference
- `localStorage.setItem('urdu_pref_<chapter_slug>', 'true')` per chapter.
- On page load, check preference and auto-fetch Urdu if set.
