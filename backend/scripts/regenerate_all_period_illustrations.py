#!/usr/bin/env python3
"""Refresh imagePrompts and force-regenerate scene PNGs for all F1 period fixtures."""

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

from services.image_service import generate_illustration, illustration_scene_key  # noqa: E402
from services.scene_image_prompts import scene_narrative_for_illustration  # noqa: E402
from services.story_generator import enrich_story_graph  # noqa: E402

FIXTURES_DIR = ROOT / "fixtures" / "f1"
PERIOD_IDS = ("pre_qin", "qin_han", "three_kingdoms", "sui_tang")


def _sort_scene_ids(scene_ids: list[str]) -> list[str]:
    def key(sid: str) -> tuple:
        if sid.endswith("_end"):
            return (2, sid)
        if sid.startswith("deviation_"):
            return (1, int(sid.split("_", 1)[1]))
        if sid.startswith("scene_"):
            parts = sid.split("_")
            if len(parts) >= 2 and parts[1].isdigit():
                return (0, int(parts[1]))
        return (0, 99, sid)

    return sorted(scene_ids, key=key)


def regenerate_fixture(fixture_path: Path, *, sleep_s: float = 1.5) -> tuple[int, int, list[str]]:
    payload = json.loads(fixture_path.read_text(encoding="utf-8"))
    graph = payload.get("storyGraph")
    if not graph:
        print(f"  跳過 {fixture_path.name}（無 storyGraph）")
        return 0, 0, []

    period_id = graph.get("periodId") or payload.get("analysis", {}).get("periodId") or ""
    analysis = payload.get("analysis") or {"settings": []}
    enrich_story_graph(graph, analysis)
    payload["storyGraph"] = graph
    fixture_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"  已更新 imagePrompt：{fixture_path.name}")

    scenes = graph.get("scenes") or {}
    scene_ids = _sort_scene_ids(list(scenes.keys()))
    ok = 0
    failed: list[str] = []

    for scene_id in scene_ids:
        scene = scenes[scene_id]
        narrative = scene_narrative_for_illustration(scene)
        if not narrative:
            print(f"    跳過 {scene_id}（無敘事）")
            continue
        storage_id = illustration_scene_key(period_id or None, scene_id)
        try:
            meta = generate_illustration(
                narrative,
                scene.get("imagePrompt"),
                storage_id,
                force=True,
            )
            print(
                f"    ✓ {storage_id} ← {scene_id} → {meta.get('url')} "
                f"(cached={meta.get('cached')})"
            )
            ok += 1
            time.sleep(sleep_s)
        except Exception as exc:  # noqa: BLE001
            print(f"    ✗ {storage_id}：{exc}", file=sys.stderr)
            failed.append(storage_id)

    return ok, len(scene_ids), failed


def main() -> int:
    total_ok = 0
    total_scenes = 0
    all_failed: list[str] = []

    for period_id in PERIOD_IDS:
        fixture_path = FIXTURES_DIR / f"{period_id}.json"
        if not fixture_path.exists():
            print(f"找不到：{fixture_path}", file=sys.stderr)
            continue
        print(f"\n=== {period_id} ===")
        ok, count, failed = regenerate_fixture(fixture_path)
        total_ok += ok
        total_scenes += count
        all_failed.extend(failed)

    print(f"\n完成：{total_ok} 張插畫（共 {total_scenes} 個場景節點）")
    if all_failed:
        print("失敗：" + ", ".join(all_failed), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
