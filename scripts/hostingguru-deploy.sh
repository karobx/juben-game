#!/usr/bin/env bash
# HostingGuru 方案 B — 單一 service 部署指引（唔使信用卡）
set -euo pipefail

REPO_URL="${GITHUB_REPO_URL:-https://github.com/karobx/juben-game}"
DASHBOARD="${HOSTINGGURU_DASHBOARD:-https://dashboard.hostingguru.io}"

cat <<EOF
劇本遊戲 → HostingGuru 部署（方案 B）
=====================================

Repo: ${REPO_URL}
Dashboard: ${DASHBOARD}

Step 1 — 註冊（唔使信用卡）
  ${DASHBOARD}
  → Sign up（可用 GitHub 登入）

Step 2 — 連接 GitHub 並建立 Web Service
  → Connect GitHub → 選 repo: karobx/juben-game
  → 若自動偵測唔到，手動設定：

     Runtime:     Docker（推薦，用 repo 根目錄 Dockerfile）
     或 Python 3.12 + 以下 commands：

     Build command（Python runtime 冇 npm，用 repo 內已 build 好嘅 frontend/dist）:
       pip install -r backend/requirements-deploy.txt

     Start command:
       cd backend && uvicorn main:app --host 0.0.0.0 --port \$PORT

     若 build 失敗見 npm not found → 唔好用 npm build command，改用上面一行 pip。
     或改 Runtime 為 Docker（用根目錄 Dockerfile，唔使改 build command）。

     Health check: /api/health

Step 3 — 環境變數（Dashboard → Environment）
  STORAGE_MODE=local
  IMAGE_PROVIDER=auto
  （可選，AI 插畫）OPENAI_API_KEY 或 POLLINATIONS_API_KEY

Step 4 — Deploy
  等 build 完成，會有類似：
    https://juben-game.apps.hostingguru.io

Step 5 — 自訂網域 game.ange1a.com
  HostingGuru → 你的 service → Domains → Add game.ange1a.com
  複製佢俾你嘅 CNAME target，然後：

  ./scripts/godaddy-dns-instructions.sh <cname-target>

Step 6 — 驗證
  ./scripts/verify-deployment.sh https://game.ange1a.com

備註
----
- 免費 tier：1 個 service、唔 sleep（官方說明）
- 上傳檔案 / 插畫快取在免費 tier 可能唔持久；長期可改 Firebase（見 .env.example）
- 若自訂網域要付費 plan，可先用 *.apps.hostingguru.io 測試全功能

EOF
