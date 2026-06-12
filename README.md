# 互動故事遊戲

將書籍 / PDF 轉化為**雙路線互動歷史故事**的 Web App（iPad Safari 友善）。核心玩法：主線（綠）符合史實繼續、偏離（黃）可重返或失敗。

完整規格見 [docs/PLAN.md](docs/PLAN.md)，設計 token 見 [docs/FIGMA.md](docs/FIGMA.md)。

## 快速開始

### 後端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# 可選：SpaCy 中文模型（未安裝時會用 fallback 分析）
python -m spacy download zh_core_web_sm
uvicorn main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install   # 若遇憑證錯誤，專案已含 .npmrc（strict-ssl=false）
npm run dev
```

瀏覽器開啟 http://localhost:5173

### 環境變數

複製 `.env.example` 為 `.env`。預設 `STORAGE_MODE=local`，檔案存於 `backend/uploads/`。

若要改用 Firebase Storage：

```env
STORAGE_MODE=firebase
FIREBASE_CREDENTIALS_PATH=/path/to/service-account.json
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
```

前端 API 位址（`frontend/.env`）：

```env
VITE_API_BASE_URL=http://localhost:8000
```

## API

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/health` | 健康檢查 |
| POST | `/api/upload` | 上傳 PDF/TXT |
| POST | `/api/analyze` | 分析並生成劇本 graph |
| GET | `/api/story/demo` | 秦漢大一統示範劇本 |
| POST | `/api/illustrations/generate` | AI 生成歷史場景插畫（需 API 金鑰） |
| GET | `/api/illustrations/{id}.png` | 取得已快取的插畫 PNG |

### AI 場景插畫

遊戲中每個場景會優先請求 AI 歷史繪卷；生成中或失敗時自動退回語意化 SVG。

在 `.env` 設定 **至少一個**繪圖金鑰：

```env
# 方案 A：OpenAI DALL-E（建議，畫質較穩定）
OPENAI_API_KEY=sk-...

# 方案 B：Pollinations（https://enter.pollinations.ai 取得金鑰）
POLLINATIONS_API_KEY=sk_...
POLLINATIONS_MODEL=zimage
```

`IMAGE_PROVIDER=auto` 時會依序嘗試 OpenAI → Pollinations。插畫會快取於 `backend/illustrations/`。

## 測試

```bash
# 故事引擎（秦漢示範路徑）
cd frontend && npm test

# 前端建置
npm run build

# 後端（含插畫 prompt 組裝）
cd backend && source .venv/bin/activate && python -m pytest tests/test_image_service.py -q
```

## 示範

點「試玩秦漢示範」無需上傳即可體驗六幕互動（秦統一 → 秦亡 → 漢興 → 武帝盛世 → 絲路 → 東漢）：

- **路徑 A**：全程選正史 → 通關
- **路徑 B**：任一幕偏離 → 重返正史 → 繼續主線
- **路徑 C**：偏離後堅持錯誤 → Game Over

## 部署（HostingGuru，方案 B）

單一 Web Service 同時 serve API 同 `frontend/dist`（唔使信用卡）。

1. Push 到 GitHub：`./scripts/push-and-deploy.sh`
2. 跟指引：`./scripts/hostingguru-deploy.sh`
3. **Build command**（Python runtime）：
   ```bash
   pip install -r backend/requirements-deploy.txt
   ```
   或留空，用 repo 根目錄 `build.sh`。
4. **Start command**（Docker 請留空；Python 請勿用 `cd`）：
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 3000 --app-dir backend
   ```
   或留空，用 `entrypoint.sh` / `Procfile`。
5. 環境變數：`STORAGE_MODE=local`、`IMAGE_PROVIDER=auto`
6. 自訂網域：`./scripts/godaddy-dns-instructions.sh <HostingGuru-CNAME>`
7. 驗證：`./scripts/verify-deployment.sh https://juben.ange1a.com`

亦可改用 **Docker**（根目錄 `Dockerfile`，Build/Start command 可留空）。

## Figma

設計檔：[Figma — 劇本遊戲 UI](https://www.figma.com/design/Hv3LRFc4OhrUspopNUbFhq)
