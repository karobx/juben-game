#!/usr/bin/env python3
"""Refresh scene imagePrompts from narrative and force-regenerate all scene PNGs."""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT.parent / ".env")
load_dotenv(ROOT / ".env")

from services.image_service import generate_illustration  # noqa: E402
from services.story_generator import enrich_story_graph  # noqa: E402

FIXTURE_PATH = ROOT / "fixtures" / "f1" / "qin_han.json"


def _scene_narrative(scene: dict) -> str:
    return (scene.get("narrativeFirstPerson") or scene.get("narrative") or "").strip()


def main() -> int:
    if not FIXTURE_PATH.exists():
        print(f"找不到劇本：{FIXTURE_PATH}", file=sys.stderr)
        return 1

    payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    graph = payload.get("storyGraph")
    if not graph:
        print("storyGraph 缺失", file=sys.stderr)
        return 1

    analysis = payload.get("analysis") or {"settings": ["咸陽", "長安"]}
    enrich_story_graph(graph, analysis)
    payload["storyGraph"] = graph
    FIXTURE_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"已更新 imagePrompt：{FIXTURE_PATH}")

    scenes = graph.get("scenes") or {}
    scene_ids = sorted(scenes.keys(), key=lambda sid: (sid != "scene_8_end", sid))
    ok = 0
    failed: list[str] = []

    for scene_id in scene_ids:
        scene = scenes[scene_id]
        narrative = _scene_narrative(scene)
        if not narrative:
            print(f"  跳過 {scene_id}（無敘事）")
            continue
        try:
            meta = generate_illustration(
                narrative,
                scene.get("imagePrompt"),
                scene_id,
                force=True,
            )
            print(f"  ✓ {scene_id} → {meta.get('url')} (cached={meta.get('cached')})")
            ok += 1
            time.sleep(1.5)
        except Exception as exc:  # noqa: BLE001
            print(f"  ✗ {scene_id}：{exc}", file=sys.stderr)
            failed.append(scene_id)

    print(f"\n完成：{ok}/{len(scene_ids)} 張插畫")
    if failed:
        print("失敗場景：" + ", ".join(failed), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
