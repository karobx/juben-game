"""Build dual-route story graph from analysis or fixtures."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from services.nltk_service import build_image_prompt
from services.scene_image_prompts import build_scene_image_prompt, scene_narrative_for_illustration

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def load_fixture(name: str = "qin_han_unification") -> dict[str, Any]:
    path = FIXTURES_DIR / f"{name}.json"
    return json.loads(path.read_text(encoding="utf-8"))


def generate_story_graph(analysis: dict[str, Any]) -> dict[str, Any]:
    """Generate a playable graph; use Yue Fei fixture when beats are sparse."""
    beats = analysis.get("plotBeats") or []
    settings = analysis.get("settings") or []
    image_prompts = analysis.get("imagePrompts") or []

    if len(beats) < 2:
        graph = load_fixture()
        graph["title"] = analysis.get("title") or graph["title"]
        enrich_story_graph(graph, analysis)
        return graph

    title = analysis.get("title") or "互動故事"
    scenes: dict[str, Any] = {}
    beat_ids: list[str] = []

    for i, beat in enumerate(beats[:5]):
        scene_id = f"scene_{i + 1}"
        beat_ids.append(scene_id)
        next_id = f"scene_{i + 2}" if i + 1 < min(len(beats), 5) else f"scene_{i + 1}_end"
        deviation_id = f"deviation_{i + 1}"

        scene_prompt = image_prompts[i] if i < len(image_prompts) else build_image_prompt(
            beat.get("summary", f"第 {i + 1} 幕"),
            settings,
        )

        scenes[scene_id] = {
            "id": scene_id,
            "route": "mainline",
            "narrative": beat.get("summary", f"第 {i + 1} 幕"),
            "imagePrompt": scene_prompt,
            "choices": [
                {
                    "id": f"{scene_id}_historical",
                    "label": "符合史實的選擇",
                    "type": "historical",
                    "nextSceneId": next_id,
                },
                {
                    "id": f"{scene_id}_divergent",
                    "label": "偏離史實的選擇",
                    "type": "divergent",
                    "nextSceneId": deviation_id,
                },
            ],
        }

        scenes[deviation_id] = {
            "id": deviation_id,
            "route": "deviation",
            "narrative": "你走上咗另一條路——歷史在此拐了彎。",
            "imagePrompt": build_image_prompt(
                "歷史在此拐彎，偏離主線的關鍵時刻",
                settings,
                mood_keywords=["暗色調", "戲劇性", "不確定感"],
            ),
            "resumeMainlineSceneId": next_id,
            "choices": [
                {
                    "id": f"{deviation_id}_return",
                    "label": "聽從史實，重返主線",
                    "type": "return_to_history",
                    "nextSceneId": next_id,
                },
                {
                    "id": f"{deviation_id}_persist",
                    "label": "繼續偏離",
                    "type": "continue_divergence",
                    "nextSceneId": "failed",
                },
            ],
        }

    end_id = beat_ids[-1] + "_end"
    scenes[end_id] = {
        "id": end_id,
        "route": "mainline",
        "narrative": "故事沿著歷史的主線走向結局。",
        "imagePrompt": build_image_prompt(
            "故事沿著歷史主線走向結局",
            settings,
            mood_keywords=["金色餘韻", "史詩感", "莊嚴結局"],
        ),
        "choices": [],
    }

    return {
        "title": title,
        "startSceneId": beat_ids[0],
        "scenes": scenes,
    }


def enrich_story_graph(graph: dict[str, Any], analysis: dict[str, Any]) -> dict[str, Any]:
    """Attach Chinese scene image prompts to scenes missing them."""
    from services.hotspot_layout import apply_hotspot_layout

    _attach_image_prompts(
        graph["scenes"],
        analysis.get("imagePrompts") or [],
        analysis.get("settings") or [],
    )
    _refresh_scene_image_prompts_from_narrative(graph["scenes"])
    apply_hotspot_layout(graph)
    return graph


def _refresh_scene_image_prompts_from_narrative(scenes: dict[str, Any]) -> None:
    """Rebuild prompts from scene narrative so illustrations match player-visible text."""
    for scene in scenes.values():
        if not scene_narrative_for_illustration(scene):
            continue
        scene["imagePrompt"] = build_scene_image_prompt(scene)


def _attach_image_prompts(
    scenes: dict[str, Any],
    image_prompts: list[dict[str, Any]],
    settings: list[str],
) -> None:
    """Fill missing scene image prompts for fixture graphs."""
    mainline_scene_ids = [
        scene_id
        for scene_id, scene in scenes.items()
        if scene.get("route") == "mainline" and scene.get("choices")
    ]

    prompt_index = 0
    for scene_id in mainline_scene_ids:
        scene = scenes[scene_id]
        if scene.get("imagePrompt"):
            continue
        if prompt_index < len(image_prompts):
            scene["imagePrompt"] = image_prompts[prompt_index]
            prompt_index += 1
            continue

        mood = ["暗色調", "戲劇性"] if scene.get("route") == "deviation" else ["古風", "歷史繪卷"]
        scene["imagePrompt"] = build_image_prompt(scene.get("narrative", ""), settings, mood_keywords=mood)

    for scene_id, scene in scenes.items():
        if scene.get("imagePrompt"):
            continue
        mood = ["暗色調", "戲劇性"] if scene.get("route") == "deviation" else ["古風", "歷史繪卷"]
        scene["imagePrompt"] = build_image_prompt(scene.get("narrative", ""), settings, mood_keywords=mood)

