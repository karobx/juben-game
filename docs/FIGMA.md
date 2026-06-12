# 互動故事遊戲 — Figma 設計規格（國風）

Figma 檔案：[劇本遊戲 UI](https://www.figma.com/design/Hv3LRFc4OhrUspopNUbFhq)

## 視覺方向

以**宣紙、墨色、青綠、鎏金、朱砂**為主，標題用 **Noto Serif TC**（宋體感），內文用 **Noto Sans TC**。按鈕與卡片採**雙線框**（外墨內金），呼應卷軸與印信，仍保留兒童友善的大字與 ≥56px 觸控目標。

## 畫框（iPad 1024×768）

| 畫面 | Frame 名稱 | 說明 |
|------|------------|------|
| Upload | `Upload — 國風 iPad` | 宣紙底、卷軸卡片、三步驟、線描卷軸插圖（非 emoji） |
| Game - Mainline | `Game — 青綠主線` | 青綠雙框、宋體旁白 |
| Game - Deviation | `Game — 鎏金偏離` | 鎏金橫幅「已偏離歷史」 |
| Game - Game Over | `Game — 朱砂終局` | 朱砂邊框、重新開始 |

> 舊版簡約綠/黃畫框仍保留於 Figma Page 1；前端已切換至國風 token，待 MCP 額度恢復後可同步更新 Figma 畫框。

## Design Tokens

| Token | 值 | 用途 |
|-------|-----|------|
| `color/paper` | `#F7F0E3` | 宣紙背景 |
| `color/ink` | `#2C1810` | 墨色正文 |
| `color/cinnabar` | `#B33C3C` | 朱砂裝飾、失敗 |
| `color/mainline-jade` | `#1F5C45` | 主線（青綠） |
| `color/deviation-gold` | `#C8960C` | 偏離（鎏金） |
| `color/accent-gold` | `#D4AF37` | 金線、outline |
| `font/heading` | Noto Serif TC | 標題、旁白 |
| `font/body` | Noto Sans TC | 按鈕、說明 |
| `radius/scroll` | `4px` | 卷軸感圓角 |
| `touch-target` | `≥56px` | iPad 觸控 |

前端實作見 [`frontend/src/index.css`](../frontend/src/index.css)。
