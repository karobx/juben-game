# 歷史劇本遊戲好玩化 — 實作計劃

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Phase A 令秦漢探索變成「點繪卷光點搜證 + 第一章對照任務」；Phase B 將同一框架擴到其他三個時期。

**Architecture:** 前端新增熱點層／線索卡／任務面板，`StoryEngine` 擴充任務完成條件；後端 `hotspot_layout.py` 為生成器與 fixture 填座標。內容擴展沿用 `immersive_qin_han.py` 模式複製到其他 period。

**Tech Stack:** React + TypeScript (Vitest)、Python FastAPI fixtures、`qin_han.json`

**Spec:** `docs/superpowers/specs/2026-06-07-exploration-gamification-design.md`

---

## Phase A — 秦漢探索 Gamification（先行）

### Task A1: 資料模型與座標解析

**Files:**
- Modify: `frontend/src/models/story.ts`
- Create: `frontend/src/utils/hotspotLayout.ts`
- Test: `frontend/src/utils/hotspotLayout.test.ts`
- Modify: `backend/fixtures/f1/qin_han.json`（scene_1 手動座標 + explorationTask）

### Task A2: 熱點 UI

**Files:**
- Create: `frontend/src/components/IllustrationHotspotLayer.tsx`
- Create: `frontend/src/components/ClueSheet.tsx`
- Modify: `frontend/src/components/SceneIllustrationCard.tsx`
- Modify: `frontend/src/index.css`

### Task A3: 第一章 categorize 任務

**Files:**
- Create: `frontend/src/components/CategorizeTaskPanel.tsx`
- Modify: `frontend/src/engine/storyEngine.ts`
- Test: `frontend/src/engine/storyEngine.test.ts`
- Modify: `frontend/src/views/GamePlayView.tsx`

### Task A4: 生成器座標

**Files:**
- Create: `backend/services/hotspot_layout.py`
- Modify: `backend/services/story_generator.py`
- Modify: `backend/scripts/expand_qin_han_chapters.py`（若存在座標合併邏輯）

---

## Phase B — 其他時期擴展（A 完成後）

### Task B1: 先秦沉浸式劇本骨架

**Files:** `backend/services/immersive_pre_qin.py`、`backend/fixtures/f1/pre_qin.json`

### Task B2: 三國、隋唐沉浸式

**Files:** `immersive_three_kingdoms.py`、`immersive_sui_tang.py`、對應 fixture

### Task B3: chistory_service 註冊 immersive period

**Files:** `backend/services/chistory_service.py` — 擴展 `IMMERSIVE_PERIOD_IDS`

---

## 驗收

1. 第一章繪卷可點脈動光點，底部滑出線索卡
2. chip 清單收合為備援
3. 完成三項對照後才可抉擇
4. `npm test` 與既有引擎測試通過
5. Phase B 每時期至少 4 章主線 + 熱點座標非零
