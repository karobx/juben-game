"""Load and parse 中一讀書卡 chapter text for immersive story specs."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from services.immersive_common import _fallback_spec, reader_spec

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "f1_reading_cards"
SUPPLEMENTS_PATH = DATA_DIR / "chapter_supplements.json"

PLACEHOLDER_MARKERS = ("找不到網頁", "移至主內容", "主導覽")

PERIOD_CONSEQUENCE: dict[str, str] = {
    "pre_qin": "你把握了史前至夏商周的變局脈絡。",
    "three_kingdoms": "你把握了三國兩晉南北朝的分裂與融合脈絡。",
    "sui_tang": "你把握了隋唐興衰與開放社會的脈絡。",
}

SKIP_LINE_KEYS = ("考前筆記", "中一級", "歷史時期", "課題", "延伸部分", "主導覽", "導航連結")


def _load_supplements() -> dict[str, Any]:
    if not SUPPLEMENTS_PATH.exists():
        return {}
    return json.loads(SUPPLEMENTS_PATH.read_text(encoding="utf-8")).get("chapters", {})


def is_placeholder_text(text: str) -> bool:
    if not text or len(text.strip()) < 120:
        return True
    return any(marker in text for marker in PLACEHOLDER_MARKERS)


def chapter_short_title(title: str) -> str:
    return title.split("：")[-1] if "：" in title else title


def clean_summary(summary: str) -> str:
    if is_placeholder_text(summary) or len(summary) < 20:
        return ""
    if summary.startswith("【") and "】" in summary:
        return summary.split("】", 1)[1].strip()
    return summary.strip()


def chapter_txt_path(period_id: str, filename: str) -> Path:
    return DATA_DIR / period_id / f"{Path(filename).stem}.txt"


def load_chapter_text(period_id: str, chapter: dict[str, Any]) -> str:
    filename = chapter.get("filename", "")
    path = chapter_txt_path(period_id, filename)
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    if is_placeholder_text(text):
        supplement = _load_supplements().get(filename)
        if supplement:
            bullets = supplement.get("bullets") or []
            header = f"【{supplement.get('title', chapter.get('title', ''))}】"
            return header + "\n" + "\n".join(f"- {b}" for b in bullets)
    return text


def extract_bullets(text: str, *, max_bullets: int = 6) -> list[str]:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    bullets: list[str] = []
    for ln in lines:
        if any(k in ln for k in SKIP_LINE_KEYS) and len(ln) < 40:
            continue
        if ln.startswith("一、") or ln.startswith("二、") or ln.startswith("三、"):
            continue
        if re.match(r"^\d+\.\d", ln):
            continue
        if ln.startswith("- ") or ln.startswith("•"):
            body = ln.lstrip("- •").strip()
            if len(body) >= 12:
                bullets.append(body)
        elif len(ln) >= 24 and not ln.endswith("：") and not ln.startswith("【"):
            bullets.append(ln)
        if len(bullets) >= max_bullets:
            break
    return bullets


def summarize_from_text(text: str, title: str, max_len: int = 280) -> str:
    bullets = extract_bullets(text, max_bullets=3)
    if bullets:
        summary = bullets[0]
        if len(summary) > max_len:
            summary = summary[: max_len - 1] + "…"
        return f"【{title}】{summary}"
    snippet = text[:max_len].replace("\n", " ")
    return f"【{title}】{snippet}…"


def _hotspot_from_bullet(scene_prefix: str, index: int, bullet: str) -> dict[str, Any]:
    short = bullet[:18] + "…" if len(bullet) > 20 else bullet
    return {
        "id": f"clue_{index}",
        "label": f"翻閱：{short}",
        "x": 0,
        "y": 0,
        "clue": {"title": short, "content": bullet},
    }


def build_chapter_spec(
    period_id: str,
    chapter: dict[str, Any],
    *,
    overrides: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build immersive chapter spec from 讀書卡 text."""
    title = chapter.get("title", "")
    short = chapter_short_title(title)
    summary = chapter.get("summary") or title
    text = load_chapter_text(period_id, chapter)
    body = clean_summary(summary)
    if not body and text:
        body = clean_summary(summarize_from_text(text, short))

    bullets = extract_bullets(text, max_bullets=5)
    if not body and bullets:
        body = bullets[0]
    if not body:
        body = f"翻閱課本摘錄，整理「{short}」的重點。"

    consequence = PERIOD_CONSEQUENCE.get(period_id, "正史繼續向前。")
    hotspots = [_hotspot_from_bullet("scene", i + 1, b) for i, b in enumerate(bullets)]
    if not hotspots:
        hotspots = [
            {
                "id": "clue_textbook",
                "label": "翻閱課本摘錄",
                "x": 0,
                "y": 0,
                "clue": {"title": short, "content": body},
            }
        ]

    spec = reader_spec(
        short,
        body,
        first_person_body=body,
        decision=f"研讀「{short}」後，你會如何理解這段歷史？",
        decision_reader=f"研讀「{short}」後，你會如何理解這段歷史？",
        hotspot=hotspots[0],
        historical={
            "label": f"我依課程理解：{short}",
            "historyNote": f"這符合課本對「{short}」的記載。",
            "consequence": consequence,
        },
        divergent_a={
            "label": "我忽略課本，自行臆測",
            "historyNote": "此舉並無史實依據。",
        },
        divergent_b={
            "label": "我提出與課本相反的說法",
            "historyNote": "與課程記載不符。",
        },
        deviation_fp=f"你對「{title}」的理解偏離了史實。",
        deviation_reader=f"你發現自己對「{short}」的理解與史實不符。",
    )
    spec["hotspots"] = hotspots
    spec["requiredClueCount"] = min(3, len(hotspots)) if len(hotspots) > 1 else 1
    spec["narrativeAsReader"] = f"你翻開課本，來到【{short}】。{body}"

    if overrides:
        spec.update({k: v for k, v in overrides.items() if v is not None})
        if overrides.get("hotspot") and "hotspots" not in overrides:
            spec["hotspots"] = [
                {**overrides["hotspot"], "x": 0, "y": 0},
                *hotspots[1:],
            ]

    return spec


def spec_for_chapter(
    period_id: str,
    title: str,
    summary: str,
    chapter: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Backward-compatible wrapper."""
    ch = chapter or {"title": title, "summary": summary}
    if "summary" not in ch:
        ch = {**ch, "summary": summary}
    return build_chapter_spec(period_id, ch)
