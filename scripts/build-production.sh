#!/usr/bin/env bash
# Build frontend + install Python deps for production.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v npm >/dev/null 2>&1; then
  echo "→ Building frontend (npm)…"
  (cd frontend && npm ci && npm run build)
elif [[ -d frontend/dist && -f frontend/dist/index.html ]]; then
  echo "→ Skipping npm (using committed frontend/dist)"
else
  echo "ERROR: Node/npm not found and frontend/dist missing."
  echo "Run locally: cd frontend && npm ci && npm run build"
  echo "Or deploy with Docker (uses Dockerfile)."
  exit 1
fi

echo "→ Installing Python dependencies…"
pip install -r backend/requirements-deploy.txt

echo "✓ Production build ready"
