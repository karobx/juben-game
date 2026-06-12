#!/usr/bin/env python3
"""Patch qin_han.json with perspective fields without wiping hotspots/tasks."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from services.chistory_service import FIXTURES_DIR, get_period_meta  # noqa: E402
from services.immersive_qin_han import build_immersive_qin_han_graph  # noqa: E402

PERSPECTIVE_KEYS = (
    "perspectiveEra",
    "narrativeAsReader",
    "narrativeFirstPerson",
    "decisionPrompt",
    "decisionPromptAsReader",
)


def main() -> None:
    fixture_path = FIXTURES_DIR / "qin_han.json"
    payload = json.loads(fixture_path.read_text(encoding="utf-8"))
    existing = payload.get("storyGraph") or {}
    existing_scenes = existing.get("scenes") or {}

    meta = get_period_meta("qin_han")
    fresh = build_immersive_qin_han_graph(meta)
    fresh_scenes = fresh.get("scenes") or {}

    for scene_id, scene in existing_scenes.items():
        source = fresh_scenes.get(scene_id)
        if not source:
            continue
        for key in PERSPECTIVE_KEYS:
            if key in source:
                scene[key] = source[key]

    payload["storyGraph"]["scenes"] = existing_scenes
    fixture_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"已更新視角欄位：{fixture_path}")


if __name__ == "__main__":
    main()
