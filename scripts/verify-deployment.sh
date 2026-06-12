#!/usr/bin/env bash
# Verify live deployment at BASE_URL (default: https://game.ange1a.com)
set -euo pipefail

BASE_URL="${1:-https://game.ange1a.com}"
BASE_URL="${BASE_URL%/}"

echo "==> DNS CNAME for game.ange1a.com"
dig +short game.ange1a.com CNAME || true

echo ""
echo "==> GET ${BASE_URL}/api/health"
health=$(curl -fsS "${BASE_URL}/api/health")
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
