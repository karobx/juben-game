#!/usr/bin/env bash
# HostingGuru / PaaS build hook — Python runtime（frontend/dist 已 commit）
set -euo pipefail
pip install -r backend/requirements-deploy.txt
