"""Immersive story graph for 中一隋唐."""

from __future__ import annotations

from typing import Any

from services.f1_chapter_content import build_chapter_spec
from services.immersive_common import build_immersive_period_graph

PERIOD_ID = "sui_tang"


def _chapter_overrides(title: str) -> dict[str, Any] | None:
    if "隋朝的統一" in title:
        return {
            "hotspot": {
                "id": "clue_sui_unify",
                "label": "查看隋朝統一形勢",
                "clue": {
                    "title": "隋朝統一",
                    "content": "楊堅代周建隋，先後滅陳，結束長期分裂。",
                },
            },
        }
    if "開皇之治" in title:
        return {
            "hotspot": {
                "id": "clue_kaihuang",
                "label": "展閱開皇政令",
                "clue": {
                    "title": "開皇之治",
                    "content": "減賦輕徭、整頓吏治，史稱開皇之治。",
                },
            },
        }
    if "大運河" in title:
        return {
            "hotspot": {
                "id": "clue_grand_canal",
                "label": "查看運河路線圖",
                "clue": {
                    "title": "隋唐大運河",
                    "content": "以洛陽為中心貫通南北，促進糧運與商貿。",
                },
            },
        }
    if "貞觀" in title:
        return {
            "hotspot": {
                "id": "clue_zhenguan",
                "label": "閱讀貞觀政要摘錄",
                "clue": {
                    "title": "貞觀之治",
                    "content": "唐太宗任賢納諫，國泰民安，史稱貞觀之治。",
                },
            },
        }
    if "安史" in title:
        return {
            "hotspot": {
                "id": "clue_anshi",
                "label": "查閱安史之亂戰報",
                "clue": {
                    "title": "安史之亂",
                    "content": "安祿山、史思明起兵，盛唐由盛轉衰的轉折。",
                },
            },
        }
    if "玄奘" in title:
        return {
            "hotspot": {
                "id": "clue_xuanzang",
                "label": "閱讀玄奘西行記",
                "clue": {
                    "title": "玄奘西行",
                    "content": "西行天竺取經，促進中印文化交流。",
                },
            },
        }
    return None


def build_immersive_sui_tang_graph(meta: dict[str, Any]) -> dict[str, Any]:
    specs: dict[str, dict[str, Any]] = {}
    for chapter in meta.get("chapters") or []:
        title = chapter.get("title", "")
        specs[title] = build_chapter_spec(
            PERIOD_ID, chapter, overrides=_chapter_overrides(title)
        )
    return build_immersive_period_graph(meta, specs)
