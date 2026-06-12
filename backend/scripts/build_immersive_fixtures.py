#!/usr/bin/env python3
"""Build or refresh immersive fixtures for all F1 periods."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from services.chistory_service import (  # noqa: E402
    FIXTURES_DIR,
    IMMERSIVE_PERIOD_IDS,
    build_story_from_chapters,
    get_period_meta,
)
from services.story_generator import enrich_story_graph  # noqa: E402


def main() -> None:
    # qin_han 有手寫 explorationTask／熱點，請用 patch_qin_han_perspective.py 更新敘事
    skip = {"qin_han"}
    for period_id in sorted(IMMERSIVE_PERIOD_IDS):
        if period_id in skip:
            print(f"略過 {period_id}（請用 patch_qin_han_perspective.py）")
            continue
        fixture_path = FIXTURES_DIR / f"{period_id}.json"
        if fixture_path.exists():
            payload = json.loads(fixture_path.read_text(encoding="utf-8"))
        else:
            payload = {}

        meta = get_period_meta(period_id)
        graph = build_story_from_chapters(meta)
        analysis = payload.get("analysis")
        if not analysis:
            from services.chistory_service import _build_period_payload

            analysis = _build_period_payload(period_id)["analysis"]
        enrich_story_graph(graph, analysis)
        payload["analysis"] = analysis
        payload["storyGraph"] = graph

        fixture_path.parent.mkdir(parents=True, exist_ok=True)
        fixture_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"已更新 {fixture_path}（{len(graph['scenes'])} 場景）")


if __name__ == "__main__":
    main()
