# 探索現場 Gamification 改版 — 設計規格

**日期**：2026-06-07  
**狀態**：待實作  
**方向**：D（混合式）+ 方案 3（第一章做滿，其餘章先熱點）  
**視覺示意**：`docs/design-previews/scene1-hotspot-mockup.html`

---

## 1. 問題

探索現場目前為 chip 按鈕清單，插畫不可互動。`hotspots` 的 `x/y` 全為 0，生成器未輸出座標。玩家體驗為「撳一下睇文字」，缺乏搜證感。

### 1.1 插畫與敘事錯配（第一章）

敘事寫「站在咸陽宮中」「殿上議論紛紛」，但現有插畫為**宮殿外庭鳥瞰**，角標卻顯示「絲路出使」。

**根因鏈**：

1. `qin_han.json` 的 period `settings` 含「西域」，被寫入**每一幕**的 `imagePrompt`：`場景：西域、咸陽，…`
2. `sceneVisualClassifier` 見到 `西域` → 匹配 `silk_road`（priority 1），覆蓋敘事中的 `李斯`／`殿上`（`court` priority 2）
3. AI 生成 prompt 帶「西域」語意 → 易出外景／絲路聯想，而非**殿上內景**
4. 在外庭圖上放「李斯奏章」「驛站錄」熱點，語意上說不通

**結論**：熱點 gamification 必須與**場景級插畫 prompt** 一併修正；否則光點再靚都係「貼錯地方」。

---

## 2. 目標體驗

```
進入場景 → 在繪卷上點脈動光點 → 底部線索卡滑出 → [第一章] 完成對照任務 → 抉擇
```

**視覺示意**：開啟 `docs/design-previews/scene1-hotspot-mockup.html`（用瀏覽器打開本地檔案），可點繪卷光點預覽互動。

---

## 3. 插畫熱點層（P0 · 全探索章）

### 3.1 UI 行為

| 狀態 | 外觀 |
|------|------|
| 未探索 | 琥珀色脈動圓環 + 圖示，≥ 44×44pt |
| 已探索 | 綠色勾、停止脈動 |
| 隱藏 | 滿足 `requiresClueIds` 後淡入 |
| 重玩 | 紫色邊框（`replayOnly`） |

點熱點 → `ClueSheet` 自底部滑出（標題、說話者、內容、「收入圖鑑」）。

chip 清單改為收合的「探索清單」備援（無障礙／座標缺失時）。

### 3.2 第一章插畫（殿上內景）

`scene_1` 專用 `imagePrompt`（取代「西域、咸陽」通用字串）：

```
秦代咸陽宮正殿內景，殿上廷議。秦王政坐北朝南，李斯捧奏章，
群臣分列，案几上展開六國輿圖與竹簡。室內透視，非鳥瞰外庭。
```

`sceneVisualClassifier` 新增規則：`咸陽宮|殿上|宮中|正殿` → `court`（priority 1）；分類時**優先讀** `narrativeFirstPerson`，`imagePrompt` 中的 period 級「西域」不得覆蓋場景敘事。

### 3.3 第一章熱點座標（殿上內景版）

| 線索 | x | y | 語意位置 |
|------|---|---|----------|
| 展閱李斯奏章 | 52 | 42 | 殿中案几，李斯手中奏章 |
| 查看六國輿圖 | 68 | 55 | 案几右側展開輿圖 |
| 調閱驛站傳令錄 | 28 | 48 | 左側官吏手中簡牘 |
| 聽取民夫口述 | 38 | 72 | 殿門處民夫代表稟報 |
| 密奏補遺 | 78 | 38 | 李斯袖中／案角密奏 |
| 重訪 · 老吏 | 12 | 62 | 殿柱旁老吏 |
| 重訪 · 車軌 | 85 | 68 | 殿門外可見馳道標記 |

### 3.3 其餘章座標

`x/y` 為 0 時，前端用 `HOTSPOT_ZONE_PRESETS` 依索引分配到語意區（殿中、左、右、前景、背景），避免重疊。後續可逐章手調或依插畫 LLM 輔助標定。

---

## 4. 第一章小任務（P1）

**類型**：`categorize` — 「三項統一對照」

收集 ≥3 線索後展開。玩家 tap 線索 → tap 欄位（書同文／車同軌／度量衡）。每欄至少 1 條即完成。錯放顯示溫和提示。

完成後：`canAdvanceToDecide()` 為 true；密奏熱點可見。

---

## 5. 劇本生成器改版（納入範圍）

現有生成路徑：

| 模組 | 用途 |
|------|------|
| `backend/services/story_generator.py` | 通用上傳文本 → 圖 |
| `backend/services/immersive_qin_han.py` | 秦漢 8 章沉浸式 |
| `backend/scripts/expand_qin_han_chapters.py` | 擴充 qin_han.json 熱點內容 |

### 5.1 新增 `hotspot_layout.py`

```python
def assign_hotspot_coordinates(hotspots: list, scene_theme: str) -> list:
    """依線索語意標籤或索引，填入 x/y 百分比。"""

ZONE_PRESETS = {
    "court": [(48, 34), (50, 40)],
    "scroll_right": [(72, 30), (78, 35)],
    "wing_left": [(24, 32), (18, 38)],
    "foreground": [(50, 72), (45, 78)],
    "secret_corner": [(86, 20)],
    "pillar": [(14, 48)],
    "gate": [(84, 78)],
}
```

- 第一章用手動座標表（上表）
- 其他章依 `hotspot.label` 關鍵字或 `zone` 欄位映射

### 5.2 擴充 `Hotspot` JSON schema

```json
{
  "id": "...",
  "label": "...",
  "x": 48,
  "y": 34,
  "zone": "court",
  "icon": "scroll",
  "clue": { ... }
}
```

### 5.3 `immersive_qin_han.py` 改版

- 每章輸出 **3～5 個**熱點（非現時 1 個）
- 每章輸出 **場景級 `imagePrompt`**（`interior` / `exterior` / `battlefield` 等），**不得**把 period `settings`（如「西域」）原樣貼到每一幕
- 呼叫 `assign_hotspot_coordinates`（依 `sceneType` 選內景／外景座標表）
- 第一章附加 `explorationTask`（categorize）
- `requiredClueCount` 與熱點數對齊

### 5.4 `story_generator.py` 改版（通用路徑）

上傳文本生成時：

- 每幕自動生成 2～4 個 `hotspots`（從 narrative 抽關鍵物件／人物）
- 自動填 `x/y`（zone 輪換）
- `requiredClueCount`: `min(2, len(hotspots)-1)`
- 不強制 `explorationTask`（僅 curated 劇本如秦漢）

### 5.5 `expand_qin_han_chapters.py`

- 寫入時合併座標
-  idempotent 更新 `qin_han.json`

---

## 6. 前端元件

| 元件 | 職責 |
|------|------|
| `IllustrationHotspotLayer` | 疊加於 `SceneIllustrationCard`，渲染光點 |
| `ClueSheet` | 底部線索卡 |
| `CategorizeTaskPanel` | 第一章對照任務 |
| `hotspotLayout.ts` | zone fallback 與座標解析 |

`GamePlayView`：探索階段以熱點層為主，chip 改為可收合清單。

---

## 7. 引擎

`StoryEngine`：

- `explorationTaskComplete: boolean`
- `canAdvanceToDecide()`：線索數 +（有 task 時）任務完成

---

## 8. 交付階段

| 階段 | 內容 |
|------|------|
| P0 | 熱點層 + ClueSheet + 座標寫入 JSON + 生成器輸出 x/y |
| P1 | 第一章 categorize 任務 + explorationTask 資料 |
| P2 | 第 3、5、7 章各加一個輕量任務 |

---

## 9. 不做

- 計時／生命值
- 拖拽拼圖（改用 tap-to-assign）
- 一次改抉擇階段 UI

---

## 10. 驗收

1. 打開第一章，繪卷上可見脈動光點，點擊出線索卡
2. chip 清單非主要互動路徑
3. 完成三項對照後才能抉擇
4. 重新跑 `expand_qin_han_chapters.py` / `immersive_qin_han` 後 JSON 含非零 x/y
5. 上傳新文本分析後，生成圖帶熱點座標
