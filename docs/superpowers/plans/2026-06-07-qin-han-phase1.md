# 秦漢示範 · 沉浸式玩法第一期 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 秦漢示範劇本改為「探索開場 → 三選一抉擇 → 揭曉史實」，隱藏 meta 標籤，支援第一人稱代入。

**Architecture:** 擴充 `StoryEngine` 的 `scenePhase` 狀態機（explore/decide/reveal）；fixture 為每 choice 附 `reveal` 文案；`GamePlayView` 分階段渲染，`RevealOverlay` 負責揭曉。

**Tech Stack:** React + TypeScript（frontend）、JSON fixtures（backend/frontend 同步）

**Status:** ✅ 已完成（2026-06-07）

---

## 已交付檔案

| 檔案 | 變更 |
|------|------|
| `frontend/src/models/story.ts` | ChoiceReveal、ScenePhase、Hotspot 型別 |
| `frontend/src/engine/storyEngine.ts` | phase 狀態機 + confirmReveal |
| `frontend/src/views/GamePlayView.tsx` | 三幕 UI |
| `frontend/src/components/RevealOverlay.tsx` | 揭曉 overlay |
| `frontend/src/utils/playerNarrative.ts` | `{playerName}` 替換 |
| `frontend/src/fixtures/qin_han_unification.json` | 6 幕 × 三選一 + reveal |
| `backend/fixtures/qin_han_unification.json` | 同步 |
| `frontend/src/index.css` | 中性按鈕 + reveal 樣式 |
| `frontend/src/engine/storyEngine.test.ts` | 路徑 A/B/C + reveal 流程 |

## 驗證

```bash
cd frontend && npm test && npm run build
```

## 第二期（未做）

- 插畫熱點 + 線索 sheet + 筆記本（`hotspots` / `requiredClueCount > 0`）
