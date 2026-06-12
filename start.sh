#!/usr/bin/env bash
# HostingGuru / PaaS start hook
set -euo pipefail
cd backend
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
