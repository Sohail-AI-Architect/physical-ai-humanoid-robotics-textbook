#!/usr/bin/env bash
# Deploy chatbot backend using Context7 / docker context
set -euo pipefail

CONTEXT="${DOCKER_CONTEXT:-default}"
IMAGE_TAG="${IMAGE_TAG:-chatbot-api:latest}"

echo "==> Building image: ${IMAGE_TAG}"
docker --context "${CONTEXT}" build -t "${IMAGE_TAG}" ./backend

echo "==> Starting service via docker compose"
docker --context "${CONTEXT}" compose -f docker-compose.prod.yml up -d --force-recreate

echo "==> Deployment complete"
docker --context "${CONTEXT}" compose -f docker-compose.prod.yml ps
