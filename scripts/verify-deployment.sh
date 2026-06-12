#!/usr/bin/env bash
# Verify live deployment at BASE_URL (default: https://juben.ange1a.com)
set -euo pipefail

BASE_URL="${1:-https://juben.ange1a.com}"
BASE_URL="${BASE_URL%/}"

echo "==> DNS CNAME for juben.ange1a.com"
dig +short juben.ange1a.com CNAME || true

echo ""
echo "==> GET ${BASE_URL}/api/health"
if ! health=$(curl -fsS "${BASE_URL}/api/health" 2>&1); then
  if echo "$health" | grep -qi "Service starting up"; then
    echo ""
    echo "503 — HostingGuru placeholder（冇 healthy container 喺後面）"
    echo "請檢查 Dashboard："
    echo "  1. Settings → Build / Start command 必須全部留空（Docker 用 Dockerfile CMD）"
    echo "  2. Health check = /api/health；Ports exposes = 3000"
    echo "  3. Build 分頁：最新 deploy 要 Success（唔係 Failed / rollback）"
    echo "  4. Logs 分頁：搵 Uvicorn running on http://0.0.0.0:3000"
    echo "  5. 仍 fail：Configuration → Healthchecks → 暫時 Disable → Redeploy → 再 Enable"
    exit 1
  fi
  echo "$health"
  exit 1
fi
echo "$health"
echo "$health" | grep -q '"status":"ok"'

echo ""
echo "==> GET ${BASE_URL}/ (SPA)"
code=$(curl -fsS -o /dev/null -w "%{http_code}" "${BASE_URL}/")
test "$code" = "200"

echo ""
echo "==> GET ${BASE_URL}/api/story/demo (first 80 chars)"
curl -fsS "${BASE_URL}/api/story/demo" | head -c 80
echo ""

echo ""
echo "==> GET ${BASE_URL}/api/chistory/periods"
periods=$(curl -fsS "${BASE_URL}/api/chistory/periods")
echo "$periods" | grep -q '"pre_qin"'
echo "$periods" | grep -q '"qin_han"'

echo ""
echo "All checks passed for ${BASE_URL}"
