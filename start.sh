#!/usr/bin/env bash
# HostingGuru / PaaS start hook (no "cd" — avoids platform mangling "cd" → "d")
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
# HostingGuru healthcheck 固定 localhost:3000 — 唔跟 $PORT（可能空或 8080）
exec uvicorn main:app --host 0.0.0.0 --port 3000 --app-dir "$ROOT/backend"
