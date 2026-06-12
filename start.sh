#!/usr/bin/env bash
# HostingGuru / PaaS start hook (no "cd" — avoids platform mangling "cd" → "d")
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-3000}" --app-dir "$ROOT/backend"
