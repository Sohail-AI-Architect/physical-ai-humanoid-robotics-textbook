# BuildAndDeploySkill

## Purpose
Automates the full build, test, and deployment pipeline for the Physical AI textbook site including frontend (Docusaurus), backend (FastAPI), and auth server (Better-Auth).

## Trigger
Invoked via `/deploy` or when user requests a production build and deployment.

## Steps

### 1. Pre-flight Checks
```bash
# Verify all services can start
node --version  # >= 20
python3 --version  # >= 3.11

# Check required env vars
[ -f .env.local ] && echo "ENV OK" || echo "MISSING .env.local"
```

### 2. Frontend Build
```bash
npm run build
# Validates: exit code 0, build/ directory exists
# Output: Static site in build/
```

### 3. Backend Validation
```bash
cd backend
source venv/bin/activate
python -c "from backend.app.main import app; print('Backend imports OK')"
# Validates: all imports resolve, no ModuleNotFoundError
```

### 4. Auth Server Validation
```bash
cd auth-server
npm run build 2>/dev/null || npx tsc --noEmit
# Validates: TypeScript compiles without errors
```

### 5. Deploy
```bash
# GitHub Pages (frontend only)
npm run deploy

# Or full-stack deploy via Docker
docker compose up --build -d
```

### 6. Post-deploy Health Checks
```bash
curl -s http://localhost:8000/api/health  # Backend
curl -s http://localhost:3001/health       # Auth server
curl -s http://localhost:3000              # Frontend
```

## Outputs
- Build artifacts in `build/`
- Health check results for all 3 services
- Deployment status summary

## Error Handling
- If frontend build fails: check for TypeScript errors, show first error
- If backend import fails: run `pip install -r requirements.txt` and retry
- If auth-server fails: run `npm install` and retry
