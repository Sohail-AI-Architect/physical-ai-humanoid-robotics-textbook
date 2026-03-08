# Quickstart: RAG Chatbot

**Feature**: 002-rag-chatbot
**Date**: 2026-02-27

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11+ | FastAPI backend |
| Docker | 24+ | Production deployment |
| Docker Compose | v2+ | `docker compose` (without hyphen) |
| Node.js | 20+ | Docusaurus frontend |
| npm | 10+ | Package management |

**API Keys required** (exactly 3):

| Variable | Where to get it |
|---|---|
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys |
| `QDRANT_URL` | Qdrant Cloud dashboard (cluster endpoint) |
| `QDRANT_API_KEY` | Qdrant Cloud dashboard (API key for your cluster) |

---

## 1. Clone and configure

```bash
git clone <repo-url>
cd physical-ai-humanoid-robotics-textbook

# Copy environment template and fill in your keys
cp backend/.env.example backend/.env
# Edit backend/.env:
#   OPENROUTER_API_KEY=sk-or-...
#   QDRANT_URL=https://xyz.qdrant.tech
#   QDRANT_API_KEY=...
```

---

## 2. Backend — local development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Start the FastAPI server (hot-reload)
uvicorn main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`.
Verify: `curl http://localhost:8000/api/health`

---

## 3. Build the search index

Run this once after setting up the backend (or after updating book content):

```bash
# From repo root (with backend venv active)
cd backend
python scripts/index_docs.py

# Or trigger via API (while server is running):
curl -X POST http://localhost:8000/api/index/rebuild
```

The script walks `../docs/` (Docusaurus docs directory), chunks all `.md` files,
embeds them via OpenRouter, and upserts into Qdrant Cloud.

Expected output:
```
Indexing docs/...
Found 78 markdown files across 13 chapters
Chunked into 3142 chunks (512 tokens, 50 overlap)
Embedding batch 1/32...
...
Upserted 3142 vectors to Qdrant collection 'book_chunks'
Done in 47.2s
```

---

## 4. Frontend — local development

```bash
# From repo root
npm install

# Set the backend URL (or add to .env.local)
export CHATBOT_API_URL=http://localhost:8000

npm run start
```

The Docusaurus dev server starts at `http://localhost:3000`.
The chat orb appears on every page and connects to the local backend.

**Environment variable**: `CHATBOT_API_URL` is read at build time via `docusaurus.config.ts`
`customFields`. For production builds, set this to your VPS backend URL.

---

## 5. Production deployment — Docker

```bash
# From repo root
# Ensure backend/.env has production API keys

docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:8000/api/health

# Tail logs
docker compose -f docker-compose.prod.yml logs -f backend
```

Then rebuild the index on the production server:
```bash
docker compose -f docker-compose.prod.yml exec backend python scripts/index_docs.py
```

---

## 6. Deploy to Context7 VPS

```bash
# Requires: VPS_HOST and VPS_USER set in environment
export VPS_HOST=your-vps-ip-or-hostname
export VPS_USER=ubuntu

bash scripts/deploy-context7.sh
```

The script:
1. SSH into the VPS
2. `git pull origin 002-rag-chatbot` (or main after merge)
3. `docker compose -f docker-compose.prod.yml pull`
4. `docker compose -f docker-compose.prod.yml up -d --build`
5. Health checks and reports status

**First-time setup on VPS**: Ensure `backend/.env` exists on the VPS with production keys.
Copy it manually: `scp backend/.env $VPS_USER@$VPS_HOST:~/app/backend/.env`

---

## 7. Deploy via GitHub Actions (GitHub VPS)

```bash
bash scripts/deploy-github-vps.sh
```

This script is also invoked by `.github/workflows/deploy.yml` on push to `main`.

**Required GitHub repository secrets**:
| Secret | Value |
|---|---|
| `VPS_SSH_KEY` | Private SSH key for VPS access |
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | SSH username (e.g. `ubuntu`) |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `QDRANT_URL` | Qdrant cluster URL |
| `QDRANT_API_KEY` | Qdrant API key |

---

## 8. Verify end-to-end

1. Open `http://your-docusaurus-url/docs/intro`
2. Click the animated orb in the bottom-right corner
3. Type: "What is inverse kinematics?"
4. Confirm answer arrives in < 10 seconds with at least one citation link
5. Click the citation link — should navigate to the correct chapter section

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `503 Service Unavailable` on `/api/chat` | Qdrant unreachable | Check `QDRANT_URL` and `QDRANT_API_KEY` in `.env` |
| Empty citations | Index not built | Run `python scripts/index_docs.py` |
| Chat orb not visible | Frontend not rebuilt after adding `src/theme/Root.tsx` | `npm run build && npm run serve` |
| `OPENROUTER_API_KEY invalid` | Wrong key format | Key must start with `sk-or-` |
| Indexing hangs | Rate limit on OpenRouter embeddings | Reduce batch size in `index_docs.py` (`EMBED_BATCH_SIZE=20`) |
