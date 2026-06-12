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

     Runtime:     Docker（推薦）
       → Build command / Start command **必須全部留空**（用 Dockerfile CMD）
       → 若 Start command 有字，會覆蓋 Dockerfile，healthcheck 會失敗
       → Health check: /api/health（平台固定查 localhost:3000，app 必須聽 3000）

     或 Python 3.12：
     Build command:
       pip install -r backend/requirements-deploy.txt
     Start command（唔好用 cd，HostingGuru 會拆爛變 d: command not found）:
       uvicorn main:app --host 0.0.0.0 --port 3000 --app-dir backend

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

Step 5 — 自訂網域 juben.ange1a.com
  HostingGuru → 你的 service → Domains → Add juben.ange1a.com
  複製佢俾你嘅 CNAME target，然後：

  ./scripts/godaddy-dns-instructions.sh <cname-target>

Step 6 — 驗證
  ./scripts/verify-deployment.sh https://juben.ange1a.com

若 /api/health 回 503「Service starting up」
------------------------------------------
1. Settings → **Build command** 同 **Start command** 必須完全留空（Docker）
2. **Ports exposes** = 3000；Health check = /api/health
3. Build 分頁：最新 deploy 要 Success（Failed 會 rollback，對外永遠 503）
4. Logs 分頁：應見 `Uvicorn running on http://0.0.0.0:3000`
5. 若 healthcheck 一直 ExitCode 1（app 其實有跑）：Dockerfile 需裝 curl（Coolify 用 curl 探測）
6. 仍 fail：Configuration → Healthchecks → **Disable** → Redeploy → 成功後再 Enable

備註
----
- 免費 tier：1 個 service、唔 sleep（官方說明）
- 上傳檔案 / 插畫快取在免費 tier 可能唔持久；長期可改 Firebase（見 .env.example）
- 若自訂網域要付費 plan，可先用 *.apps.hostingguru.io 測試全功能

EOF
