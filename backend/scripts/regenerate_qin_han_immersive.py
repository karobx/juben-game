#!/usr/bin/env python3
"""Regenerate qin_han.json fixture with immersive story graph."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from services.chistory_service import FIXTURES_DIR, get_period_meta  # noqa: E402
from services.immersive_qin_han import build_immersive_qin_han_graph  # noqa: E402
from services.story_generator import enrich_story_graph  # noqa: E402


def main() -> None:
    fixture_path = FIXTURES_DIR / "qin_han.json"
    if fixture_path.exists():
        payload = json.loads(fixture_path.read_text(encoding="utf-8"))
    else:
        payload = {}

    meta = get_period_meta("qin_han")
    graph = build_immersive_qin_han_graph(meta)
    analysis = payload.get("analysis")
    if analysis:
        enrich_story_graph(graph, analysis)
    payload["storyGraph"] = graph

    fixture_path.parent.mkdir(parents=True, exist_ok=True)
    fixture_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"已更新沉浸式劇本：{fixture_path}")
    print(f"場景數：{len(graph['scenes'])}")


if __name__ == "__main__":
    main()
