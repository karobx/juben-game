"""Text structure cleaning: dialogue/narration split and Chinese scene prompts."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

# 中文／英文引號
_QUOTE_RE = re.compile(
    r"「([^」]+)」|『([^』]+)』|“([^”]+)”|\"([^\"]+)\"|'([^']+)'"
)
_SPEAKER_RE = re.compile(
    r"([\u4e00-\u9fffA-Za-z·]{2,8})(?:说|說|道|問|问|答|喊|叫|嘆|叹|笑|怒|低(?:聲|声)道)"
)
_WHITESPACE_RE = re.compile(r"[ \t\r\f\v]+")
_MULTI_NEWLINE_RE = re.compile(r"\n{3,}")

_DEFAULT_MOOD_ZH = ("古風", "歷史繪卷", "細膩場景")


@dataclass
class DialogueLine:
    text: str
    speaker: str | None = None


@dataclass
class PreprocessedText:
    raw: str
    narration: str
    dialogues: list[DialogueLine] = field(default_factory=list)
    paragraphs: list[str] = field(default_factory=list)
    speakers: list[str] = field(default_factory=list)


def preprocess_text(text: str) -> PreprocessedText:
    """Clean raw novel text and separate dialogue from narration."""
    cleaned = _normalize_whitespace(text.strip())
    if not cleaned:
        return PreprocessedText(raw="", narration="", paragraphs=[])

    dialogues = _extract_dialogues(cleaned)
    speakers = _extract_speakers(cleaned, dialogues)
    narration = _strip_dialogues(cleaned, dialogues)
    paragraphs = _split_paragraphs(narration or cleaned)

    return PreprocessedText(
        raw=cleaned,
        narration=narration,
        dialogues=dialogues,
        paragraphs=paragraphs,
        speakers=speakers,
    )


def build_image_prompt(
    scene_summary: str,
    settings: list[str] | None = None,
    mood_keywords: list[str] | None = None,
) -> dict[str, Any]:
    """Build a Chinese image-generation prompt for historical fiction scenes."""
    parts: list[str] = []
    summary = scene_summary.strip().rstrip("。！？!?")
    if summary:
        parts.append(summary[:160])
    elif settings:
        # 僅在沒有場景敘事時才退回 period 設定，且略過易誤導的「西域」
        safe_settings = [s for s in settings[:3] if s != "西域"] or settings[:2]
        parts.append("場景：" + "、".join(safe_settings))

    mood = list(mood_keywords or _DEFAULT_MOOD_ZH)
    base_prompt = "，".join(part for part in parts if part)
    if base_prompt:
        expanded_prompt = f"{base_prompt}。風格：{'、'.join(mood)}"
    else:
        expanded_prompt = f"風格：{'、'.join(mood)}"

    return {
        "prompt": base_prompt,
        "expandedPrompt": expanded_prompt,
        "moodKeywords": mood,
    }


def _normalize_whitespace(text: str) -> str:
    lines = [_WHITESPACE_RE.sub(" ", line).strip() for line in text.splitlines()]
    normalized = "\n".join(line for line in lines if line)
    return _MULTI_NEWLINE_RE.sub("\n\n", normalized)


def _quote_content(match: re.Match[str]) -> str:
    return next(group for group in match.groups() if group).strip()


def _is_likely_dialogue(content: str, text: str, match_start: int) -> bool:
    """Distinguish spoken dialogue from emphasis quotes like 「大一統」."""
    if len(content) < 2:
        return False

    prefix = text[max(0, match_start - 15) : match_start]
    if _SPEAKER_RE.search(prefix):
        return True

    if any(mark in content for mark in ("？", "?", "！", "!", "…", "——")):
        return True

    if "，" in content or "," in content:
        return len(content) >= 4

    # Short emphasis quotes without a speaker cue are usually not dialogue.
    return len(content) >= 8


def _extract_dialogues(text: str) -> list[DialogueLine]:
    dialogues: list[DialogueLine] = []
    for match in _QUOTE_RE.finditer(text):
        content = _quote_content(match)
        if _is_likely_dialogue(content, text, match.start()):
            dialogues.append(DialogueLine(text=content))
    return dialogues


def _extract_speakers(text: str, dialogues: list[DialogueLine]) -> list[str]:
    speakers: list[str] = []
    seen: set[str] = set()

    for match in _SPEAKER_RE.finditer(text):
        name = match.group(1).strip()
        if len(name) >= 2 and name not in seen:
            seen.add(name)
            speakers.append(name)

    for dialogue in dialogues:
        idx = text.find(dialogue.text)
        if idx <= 0:
            continue
        prefix = text[max(0, idx - 12) : idx]
        speaker_match = _SPEAKER_RE.search(prefix)
        if speaker_match:
            dialogue.speaker = speaker_match.group(1)
            if dialogue.speaker not in seen:
                seen.add(dialogue.speaker)
                speakers.append(dialogue.speaker)

    return speakers


def _strip_dialogues(text: str, dialogues: list[DialogueLine]) -> str:
    if not dialogues:
        return _normalize_whitespace(text)

    dialogue_texts = {line.text for line in dialogues}
    without = text
    for match in _QUOTE_RE.finditer(text):
        content = _quote_content(match)
        if content in dialogue_texts:
            without = without.replace(match.group(0), " ", 1)

    without = _SPEAKER_RE.sub(" ", without)
    return _normalize_whitespace(without)


def _split_paragraphs(text: str) -> list[str]:
    blocks = [p.strip() for p in re.split(r"\n\s*\n|\n", text) if p.strip()]
    return blocks if blocks else ([text[:200]] if text else [])
