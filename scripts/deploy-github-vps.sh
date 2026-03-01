#!/usr/bin/env bash
# Deploy chatbot backend to VPS via SSH + Docker
set -euo pipefail

VPS_HOST="${VPS_HOST:?Set VPS_HOST env var (e.g. user@1.2.3.4)}"
REMOTE_DIR="${REMOTE_DIR:-/opt/chatbot}"
IMAGE_TAG="${IMAGE_TAG:-chatbot-api:latest}"

echo "==> Syncing backend to ${VPS_HOST}:${REMOTE_DIR}"
rsync -az --delete \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.env' \
  ./backend/ "${VPS_HOST}:${REMOTE_DIR}/backend/"

rsync -az docker-compose.prod.yml "${VPS_HOST}:${REMOTE_DIR}/"

echo "==> Building image on remote"
ssh "${VPS_HOST}" "docker build -t ${IMAGE_TAG} ${REMOTE_DIR}/backend"

echo "==> Restarting service on remote"
ssh "${VPS_HOST}" "cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml up -d --force-recreate"

echo "==> Deployment complete"
ssh "${VPS_HOST}" "docker compose -f ${REMOTE_DIR}/docker-compose.prod.yml ps"
