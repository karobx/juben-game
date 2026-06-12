#!/usr/bin/env bash
# Push repo to GitHub and print Render + GoDaddy next steps.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPO="${GITHUB_REPO:-karobx/juben-game}"

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI not logged in. Run:"
  echo "  gh auth login --hostname github.com --git-protocol https --web"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$REPO" --public --source=. --remote=origin --description "互動歷史劇本遊戲" || \
    git remote add origin "https://github.com/${REPO}.git"
fi

git push -u origin main

cat <<EOF

GitHub push complete: https://github.com/${REPO}

Render (free tier) — one-click Blueprint:
  https://dashboard.render.com/blueprint/new?repo=https://github.com/${REPO}

Then:
1. Connect GitHub if prompted → Deploy Blueprint
2. Environment → add OPENAI_API_KEY or POLLINATIONS_API_KEY
3. After deploy, copy service URL (e.g. juben-game-xxxx.onrender.com)
4. Settings → Custom Domains → add game.ange1a.com

GoDaddy DNS:
  ./scripts/godaddy-dns-instructions.sh juben-game-xxxx.onrender.com

Verify:
  ./scripts/verify-deployment.sh https://game.ange1a.com

EOF
