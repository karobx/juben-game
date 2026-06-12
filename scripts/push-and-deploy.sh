#!/usr/bin/env bash
# Push repo to GitHub and print deploy + GoDaddy next steps.
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

HostingGuru（方案 B，唔使信用卡）— 詳細步驟：
  ./scripts/hostingguru-deploy.sh

Verify:
  ./scripts/verify-deployment.sh https://juben.ange1a.com

EOF
