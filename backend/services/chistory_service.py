"""Load 中一中國歷史 content and build playable story graphs."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from services.nlp_service import analyze_text
from services.nltk_service import build_image_prompt
from services.story_generator import enrich_story_graph

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "f1_reading_cards"
FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures" / "f1"

PERIOD_IDS = ("pre_qin", "qin_han", "three_kingdoms", "sui_tang")
IMMERSIVE_PERIOD_IDS = frozenset({"pre_qin", "qin_han", "three_kingdoms", "sui_tang"})


def list_periods() -> list[dict[str, Any]]:
    index = _load_index()
    return [
        {
            "id": p["id"],
            "title": p["title"],
            "subtitle": p["subtitle"],
            "chapterCount": p["chapterCount"],
            "sourceUrl": p.get("sourceUrl", index.get("source")),
            "immersive": p["id"] in IMMERSIVE_PERIOD_IDS,
        }
        for p in index["periods"]
    ]


def get_period_meta(period_id: str) -> dict[str, Any]:
    path = DATA_DIR / period_id / "metadata.json"
    if not path.exists():
        raise FileNotFoundError(f"找不到時期：{period_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def get_full_story_text(period_id: str) -> str:
    path = DATA_DIR / period_id / "full_story.txt"
    if not path.exists():
        raise FileNotFoundError(f"找不到完整故事文字：{period_id}")
    return path.read_text(encoding="utf-8")


def _build_period_payload(period_id: str) -> dict[str, Any]:
    meta = get_period_meta(period_id)
    full_text = get_full_story_text(period_id)
    analysis = analyze_text(full_text, title=f"中一中國歷史：{meta['title']}")
    analysis["engine"] = "chistory"
    analysis["sourceUrl"] = meta.get("sourceUrl")
    analysis["periodId"] = period_id

    graph = build_story_from_chapters(meta)
    enrich_story_graph(graph, analysis)
    return {"analysis": analysis, "storyGraph": graph}


def get_period_playable(period_id: str) -> dict[str, Any]:
    """Return analysis + storyGraph for a historical period."""
    fixture_path = FIXTURES_DIR / f"{period_id}.json"
    if fixture_path.exists():
        payload = json.loads(fixture_path.read_text(encoding="utf-8"))
        analysis = payload.get("analysis") or {}
        graph = payload.get("storyGraph")
        if graph and analysis:
            from services.story_generator import enrich_story_graph

            enrich_story_graph(graph, analysis)
            payload["storyGraph"] = graph
        return payload
    return _build_period_payload(period_id)


def build_story_from_chapters(meta: dict[str, Any]) -> dict[str, Any]:
    """Build dual-route graph: one scene per chapter from reading cards."""
    period_id = meta.get("id", "")
    if period_id in IMMERSIVE_PERIOD_IDS:
        from services.immersive_pre_qin import build_immersive_pre_qin_graph
        from services.immersive_qin_han import build_immersive_qin_han_graph
        from services.immersive_sui_tang import build_immersive_sui_tang_graph
        from services.immersive_three_kingdoms import build_immersive_three_kingdoms_graph

        builders = {
            "pre_qin": build_immersive_pre_qin_graph,
            "qin_han": build_immersive_qin_han_graph,
            "three_kingdoms": build_immersive_three_kingdoms_graph,
            "sui_tang": build_immersive_sui_tang_graph,
        }
        return builders[period_id](meta)

    chapters = meta.get("chapters") or []
    if not chapters:
        raise ValueError("此時期沒有章節資料")

    period_title = meta.get("title", "中國歷史")
    scenes: dict[str, Any] = {}
    scene_ids: list[str] = []

    for i, chapter in enumerate(chapters):
        scene_id = f"scene_{i + 1}"
        scene_ids.append(scene_id)
        is_last = i == len(chapters) - 1
        next_id = f"scene_{i + 2}" if not is_last else f"{scene_id}_end"
        deviation_id = f"deviation_{i + 1}"

        narrative = chapter.get("summary") or chapter.get("title", f"第 {i + 1} 章")
        historical_label, divergent_label = _choice_labels(chapter.get("title", ""), i)

        scenes[scene_id] = {
            "id": scene_id,
            "route": "mainline",
            "narrative": narrative,
            "choices": [
                {
                    "id": f"{scene_id}_historical",
                    "label": historical_label,
                    "type": "historical",
                    "nextSceneId": next_id,
                },
                {
                    "id": f"{scene_id}_divergent",
                    "label": divergent_label,
                    "type": "divergent",
                    "nextSceneId": deviation_id,
                },
            ],
        }

        scenes[deviation_id] = {
            "id": deviation_id,
            "route": "deviation",
            "narrative": _deviation_narrative(chapter.get("title", "")),
            "resumeMainlineSceneId": next_id,
            "choices": [
                {
                    "id": f"{deviation_id}_return",
                    "label": "翻閱課本，重返史實主線",
                    "type": "return_to_history",
                    "nextSceneId": next_id,
                },
                {
                    "id": f"{deviation_id}_persist",
                    "label": "堅持錯誤理解，繼續偏離",
                    "type": "continue_divergence",
                    "nextSceneId": "failed",
                },
            ],
        }

    end_id = f"{scene_ids[-1]}_end"
    scenes[end_id] = {
        "id": end_id,
        "route": "mainline",
        "narrative": f"你已完成「{period_title}」中國歷史之旅，沿著史實主線走完了這段歷史。",
        "choices": [],
    }

    return {
        "title": f"中一中國歷史：{period_title}",
        "startSceneId": scene_ids[0],
        "scenes": scenes,
        "periodId": meta.get("id"),
        "sourceUrl": meta.get("sourceUrl"),
    }


def _choice_labels(chapter_title: str, index: int) -> tuple[str, str]:
    title = chapter_title or f"第 {index + 1} 章"
    historical = f"依課程理解：{title}"
    divergent = "忽略史實，自行臆測"
    return historical, divergent


def _deviation_narrative(chapter_title: str) -> str:
    title = chapter_title or "本章"
    return (
        f"你對「{title}」的理解偏離了課程記載的史實。"
        "歷史在此拐了彎——仍可選擇重返正史主線。"
    )


def build_and_save_all_fixtures() -> None:
    """Pre-build fixture JSON for all periods (run after scrape)."""
    FIXTURES_DIR.mkdir(parents=True, exist_ok=True)
    for period_id in PERIOD_IDS:
        payload = _build_period_payload(period_id)
        out = FIXTURES_DIR / f"{period_id}.json"
        out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"已儲存 {out}")


def _load_index() -> dict[str, Any]:
    path = DATA_DIR / "index.json"
    if not path.exists():
        raise FileNotFoundError("請先執行 scripts/scrape_f1_cards.py 下載中一課程資料")
    return json.loads(path.read_text(encoding="utf-8"))
