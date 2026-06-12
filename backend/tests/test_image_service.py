from pathlib import Path

import pytest

from services import image_service
from services.image_service import build_generation_prompt, _cache_key, lookup_scene_illustration


def test_build_generation_prompt_uses_expanded_prompt():
    prompt = build_generation_prompt(
        narrative="【秦 · 統一後】長城、馳道、阿房宮動員數十萬民夫",
        image_prompt={
            "prompt": "場景：咸陽，長城修筑",
            "expandedPrompt": "場景：咸陽，長城修筑。風格：古風、歷史繪卷",
            "moodKeywords": ["古風", "歷史繪卷"],
        },
    )
    assert "長城修筑" in prompt
    assert "traditional Chinese historical scroll painting" in prompt


def test_cache_key_is_stable_for_same_prompt():
    text = "場景：咸陽，長城修筑"
    assert _cache_key(text, "pollinations") == _cache_key(text, "pollinations")
    assert _cache_key(text, "openai") != _cache_key(text, "pollinations")


def test_lookup_scene_illustration_returns_saved_file(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(image_service, "ILLUSTRATIONS_DIR", tmp_path)
    monkeypatch.setattr(image_service, "SCENES_DIR", tmp_path / "scenes")

    scene_file = tmp_path / "scenes" / "scene_1_qin_unify.png"
    scene_file.parent.mkdir(parents=True)
    scene_file.write_bytes(b"fake-png")

    meta = lookup_scene_illustration("scene_1_qin_unify")
    assert meta is not None
    assert meta["cached"] is True
    assert meta["url"] == "/api/illustrations/scene/scene_1_qin_unify"


def test_lookup_scene_illustration_missing_returns_none(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(image_service, "ILLUSTRATIONS_DIR", tmp_path)
    monkeypatch.setattr(image_service, "SCENES_DIR", tmp_path / "scenes")
    assert lookup_scene_illustration("scene_missing") is None
