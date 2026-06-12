"""Immersive story graph for 中一三國兩晉南北朝."""

from __future__ import annotations

from typing import Any

from services.f1_chapter_content import build_chapter_spec, clean_summary
from services.immersive_common import build_immersive_period_graph

PERIOD_ID = "three_kingdoms"


def _chapter_overrides(title: str, summary: str) -> dict[str, Any] | None:
    short = title.split("：")[-1] if "：" in title else title
    extra = clean_summary(summary)
    if "三國鼎立" in title:
        return {
            "narrativeAsReader": (
                "你翻開課本，來到【三國鼎立】。"
                "黃巾之亂後天下分崩，曹操、劉備、孫權逐步形成鼎立局面。"
                + (f"{extra}" if extra else "")
            ),
            "hotspot": {
                "id": "clue_three_kingdoms_map",
                "label": "查看三國形勢圖",
                "clue": {
                    "title": "鼎立局勢",
                    "content": "魏據北方，蜀漢與東吳夾擊抗衡，分裂政局由此成形。",
                },
            },
        }
    if "孝文帝" in title:
        return {
            "hotspot": {
                "id": "clue_tuoba_reform",
                "label": "閱讀孝文帝漢化令",
                "clue": {
                    "title": "北魏漢化",
                    "content": "遷都洛陽、改穿漢服、改用漢語，促進胡漢融合。",
                },
            },
        }
    if "江南" in title:
        return {
            "hotspot": {
                "id": "clue_jiangnan",
                "label": "查看江南開發圖",
                "clue": {
                    "title": "江南開發",
                    "content": "北方士族南遷，帶來農具與水利技術，江南逐步成為經濟重鎮。",
                },
            },
        }
    if "武備" in title:
        return {
            "narrativeAsReader": (
                f"你翻開課本，研讀【{short}】。"
                "南方重水軍、北方重騎兵，赤壁之戰是南北武備差異的經典例證。"
                + (f"{extra}" if extra else "")
            ),
        }
    return None


def build_immersive_three_kingdoms_graph(meta: dict[str, Any]) -> dict[str, Any]:
    specs: dict[str, dict[str, Any]] = {}
    for chapter in meta.get("chapters") or []:
        title = chapter.get("title", "")
        summary = chapter.get("summary") or title
        overrides = _chapter_overrides(title, summary)
        specs[title] = build_chapter_spec(
            PERIOD_ID, chapter, overrides=overrides
        )
    return build_immersive_period_graph(meta, specs)
