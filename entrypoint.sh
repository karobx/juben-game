#!/bin/bash
set -euo pipefail
# HostingGuru healthcheck is always http://localhost:3000 — do not use $PORT
ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "[entrypoint] starting uvicorn on 0.0.0.0:3000"
exec python -m uvicorn main:app --host 0.0.0.0 --port 3000 --app-dir "$ROOT/backend"
