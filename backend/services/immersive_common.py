"""Shared helpers for immersive period story graphs."""

from __future__ import annotations

from typing import Any

SCENE_ERA_BY_INDEX: dict[str, list[str]] = {
    "qin_han": ["qin", "chu_han", "han_west", "han_west", "han_west", "han_west", "han_east", "han_east"],
}


def scene_era_for_period(period_id: str, chapter_index: int) -> str | None:
    eras = SCENE_ERA_BY_INDEX.get(period_id)
    if not eras or chapter_index < 1 or chapter_index > len(eras):
        return None
    return eras[chapter_index - 1]


def attach_perspective_fields(
    scene: dict[str, Any],
    *,
    perspective_era: str | None,
    narrative_as_reader: str | None = None,
    decision_prompt_as_reader: str | None = None,
) -> dict[str, Any]:
    if perspective_era:
        scene["perspectiveEra"] = perspective_era
    if narrative_as_reader:
        scene["narrativeAsReader"] = narrative_as_reader
    if decision_prompt_as_reader:
        scene["decisionPromptAsReader"] = decision_prompt_as_reader
    return scene


def build_immersive_period_graph(
    meta: dict[str, Any],
    chapter_specs: dict[str, dict[str, Any]],
    *,
    default_required_clues: int = 1,
) -> dict[str, Any]:
    """Build immersive graph from per-chapter specs keyed by chapter title."""
    chapters = meta.get("chapters") or []
    period_title = meta.get("title", "中國歷史")
    period_id = meta.get("id", "")
    scenes: dict[str, Any] = {}
    scene_ids: list[str] = []

    for i, chapter in enumerate(chapters):
        idx = i + 1
        scene_id = f"scene_{idx}"
        deviation_id = f"deviation_{idx}"
        scene_ids.append(scene_id)
        is_last = i == len(chapters) - 1
        next_id = f"scene_{idx + 1}" if not is_last else f"{scene_id}_end"

        title = chapter.get("title", f"第 {idx} 章")
        summary = chapter.get("summary") or title
        spec = chapter_specs.get(title) or _fallback_spec(title, summary)
        era = spec.get("perspectiveEra") or scene_era_for_period(period_id, idx)
        scene_hotspots = spec.get("hotspots")
        if not scene_hotspots:
            hotspot = spec["hotspot"]
            scene_hotspots = [hotspot]

        main_scene = {
            "id": scene_id,
            "route": "mainline",
            "narrative": summary,
            "narrativeFirstPerson": spec["narrativeFirstPerson"],
            "decisionPrompt": spec["decisionPrompt"],
            "requiredClueCount": spec.get("requiredClueCount", default_required_clues),
            "hotspots": [
                {
                    "id": f"{scene_id}_{hotspot['id']}",
                    "label": hotspot["label"],
                    "x": hotspot.get("x", 0),
                    "y": hotspot.get("y", 0),
                    "clue": hotspot["clue"],
                }
                for hotspot in scene_hotspots
            ],
            "choices": [
                _historical_choice(scene_id, spec, next_id),
                _divergent_choice(scene_id, "a", spec, deviation_id),
                _divergent_choice(scene_id, "b", spec, deviation_id),
            ],
        }
        attach_perspective_fields(
            main_scene,
            perspective_era=era,
            narrative_as_reader=spec.get("narrativeAsReader"),
            decision_prompt_as_reader=spec.get("decisionPromptAsReader"),
        )
        if spec.get("explorationTask"):
            main_scene["explorationTask"] = spec["explorationTask"]
        scenes[scene_id] = main_scene

        hist = spec["historical"]
        dev_scene = {
            "id": deviation_id,
            "route": "deviation",
            "narrative": _deviation_summary(title),
            "narrativeFirstPerson": spec["deviation_narrative"],
            "decisionPrompt": "你還來得及修正——",
            "requiredClueCount": 0,
            "resumeMainlineSceneId": next_id,
            "choices": [
                {
                    "id": f"{deviation_id}_return",
                    "label": "我重新翻閱課本，修正理解",
                    "type": "return_to_history",
                    "nextSceneId": next_id,
                    "reveal": {
                        "verdict": "return",
                        "historyNote": hist["historyNote"],
                        "consequence": "你重返正史主線。",
                    },
                },
                {
                    "id": f"{deviation_id}_persist",
                    "label": "我堅持錯誤理解，繼續偏離",
                    "type": "continue_divergence",
                    "nextSceneId": "failed",
                    "reveal": {
                        "verdict": "persist",
                        "historyNote": f"若長期偏離「{title}」的史實，敘事將無從延續。",
                        "consequence": "偏離太遠，已無法返回原故事。",
                    },
                },
            ],
        }
        attach_perspective_fields(
            dev_scene,
            perspective_era=era,
            narrative_as_reader=spec.get("deviationNarrativeAsReader") or spec.get("narrativeAsReader"),
            decision_prompt_as_reader="翻閱課本後，你還來得及修正理解——",
        )
        scenes[deviation_id] = dev_scene

    end_id = f"{scene_ids[-1]}_end"
    scenes[end_id] = {
        "id": end_id,
        "route": "mainline",
        "narrative": f"你已完成「{period_title}」沉浸式歷史之旅，沿正史主線走完了各個章節。",
        "narrativeAsReader": (
            "你合上課本，回望這段歷史旅程。"
            "從史料到抉擇，史書上的名字此刻有了溫度。"
        ),
        "narrativeFirstPerson": (
            "以{playerName}的視角，你完成了這段歷史之旅。"
            "每一章都是不同年代的故事——你透過課本把它們串連起來。"
        ),
        "choices": [],
    }

    return {
        "title": f"中一中國歷史：{period_title}",
        "startSceneId": scene_ids[0],
        "scenes": scenes,
        "periodId": period_id,
        "sourceUrl": meta.get("sourceUrl"),
    }


def _historical_choice(scene_id: str, spec: dict[str, Any], next_id: str) -> dict[str, Any]:
    h = spec["historical"]
    return {
        "id": f"{scene_id}_historical",
        "label": h["label"],
        "type": "historical",
        "nextSceneId": next_id,
        "reveal": {
            "verdict": "historical",
            "historyNote": h["historyNote"],
            "consequence": h.get("consequence", "正史繼續向前。"),
        },
    }


def _divergent_choice(
    scene_id: str, suffix: str, spec: dict[str, Any], deviation_id: str
) -> dict[str, Any]:
    d = spec[f"divergent_{suffix}"]
    return {
        "id": f"{scene_id}_divergent_{suffix}",
        "label": d["label"],
        "type": "divergent",
        "nextSceneId": deviation_id,
        "reveal": {
            "verdict": "divergent",
            "historyNote": d["historyNote"],
            "consequence": "你選擇了史書未載之路——歷史在此拐彎。",
        },
    }


def _deviation_summary(chapter_title: str) -> str:
    return (
        f"你對「{chapter_title}」的理解偏離了課程記載的史實。"
        "歷史在此拐了彎——仍可選擇重返正史主線。"
    )


def _fallback_spec(title: str, summary: str) -> dict[str, Any]:
    return {
        "narrativeFirstPerson": f"以{{playerName}}的視角，{summary}",
        "narrativeAsReader": f"你翻開課本，研讀【{title}】。{summary}",
        "decisionPrompt": "此刻，你會如何抉擇？",
        "decisionPromptAsReader": "研讀史料後，你會如何理解這段歷史？",
        "hotspot": {
            "id": "clue_textbook",
            "label": "翻閱課本摘錄",
            "clue": {"title": "課本摘錄", "content": summary},
        },
        "historical": {
            "label": f"我依課程理解：{title}",
            "historyNote": f"這符合「{title}」的課程記載。",
            "consequence": "正史繼續向前。",
        },
        "divergent_a": {
            "label": "我忽略課本，自行臆測",
            "historyNote": "此舉並無史實依據。",
        },
        "divergent_b": {
            "label": "我提出與課本相反的說法",
            "historyNote": "與課程記載不符。",
        },
        "deviation_narrative": f"以{{playerName}}的視角，你對「{title}」的理解偏離了史實。",
        "deviationNarrativeAsReader": f"你翻開課本，發現自己對「{title}」的理解與史實不符。",
    }


def reader_spec(
    title: str,
    reader_body: str,
    *,
    first_person_body: str,
    decision: str,
    decision_reader: str,
    hotspot: dict[str, Any],
    historical: dict[str, Any],
    divergent_a: dict[str, Any],
    divergent_b: dict[str, Any],
    deviation_fp: str,
    deviation_reader: str,
    perspective_era: str | None = None,
) -> dict[str, Any]:
    """Helper to build a chapter spec with paired reader / first-person copy."""
    return {
        "perspectiveEra": perspective_era,
        "narrativeFirstPerson": f"以{{playerName}}的視角，{first_person_body}",
        "narrativeAsReader": f"你翻開課本，來到【{title}】。{reader_body}",
        "decisionPrompt": decision,
        "decisionPromptAsReader": decision_reader,
        "hotspot": hotspot,
        "historical": historical,
        "divergent_a": divergent_a,
        "divergent_b": divergent_b,
        "deviation_narrative": f"以{{playerName}}的視角，{deviation_fp}",
        "deviationNarrativeAsReader": f"你翻開課本，{deviation_reader}",
    }
