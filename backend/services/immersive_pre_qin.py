"""Immersive story graph for 中一先秦."""

from __future__ import annotations

from typing import Any

from services.f1_chapter_content import build_chapter_spec
from services.immersive_common import build_immersive_period_graph

PERIOD_ID = "pre_qin"


def build_immersive_pre_qin_graph(meta: dict[str, Any]) -> dict[str, Any]:
    specs: dict[str, dict[str, Any]] = {}
    for chapter in meta.get("chapters") or []:
        title = chapter.get("title", "")
        specs[title] = build_chapter_spec(PERIOD_ID, chapter)
    return build_immersive_period_graph(meta, specs)
