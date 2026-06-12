#!/usr/bin/env bash
# Deploy juben-game to Render (requires billing card on file for free tier).
set -euo pipefail

if ! render whoami >/dev/null 2>&1; then
  echo "Run: render login"
  exit 1
fi

render workspace set tea-d8lqc5t7vvec73f2f030 --confirm 2>/dev/null || true

echo "==> Validating render.yaml"
if ! render blueprints validate ./render.yaml 2>&1 | grep -q '"valid": true'; then
  echo "Blueprint validation failed. If you see need_payment_info, add a card at:"
  echo "  https://dashboard.render.com/billing"
  echo ""
  echo "Or use Dashboard Blueprint:"
  echo "  https://dashboard.render.com/blueprint/new?repo=https://github.com/karobx/juben-game"
  exit 1
fi

echo "==> Creating web service"
render services create \
  --name juben-game \
  --type web_service \
  --repo https://github.com/karobx/juben-game \
  --runtime python \
  --branch main \
  --build-command "cd frontend && npm ci && npm run build && cd ../backend && pip install -r requirements.txt" \
  --start-command "cd backend && uvicorn main:app --host 0.0.0.0 --port \$PORT" \
  --health-check-path /api/health \
  --plan free \
  --env-var STORAGE_MODE=local \
  --env-var IMAGE_PROVIDER=auto \
  --env-var PYTHON_VERSION=3.12 \
  --confirm \
  --output json

echo ""
echo "After deploy, add custom domain game.ange1a.com in Render → Settings → Custom Domains"
echo "Then: ./scripts/godaddy-dns-instructions.sh <your-service>.onrender.com"
