"""NLP pipeline: structure cleaning → rule-based Chinese extraction → SpaCy assist."""

from __future__ import annotations

from typing import Any

from services.chinese_rules import extract_characters as rule_extract_characters
from services.chinese_rules import extract_locations as rule_extract_locations
from services.nltk_service import build_image_prompt, preprocess_text

_SPACY_NLP = None
_SPACY_MODEL: str | None = None

_PERSON_BLOCKLIST = frozenset(
    {
        "中國",
        "中国",
        "秦漢",
        "秦汉",
        "漢室",
        "汉室",
        "西漢",
        "西汉",
        "東漢",
        "东汉",
        "與宦官",
        "与宦官",
        "秦二世而亡",
        "以及漢武帝",
        "及漢武帝",
        "東漢光武帝",
    }
)


def analyze_text(text: str, title: str = "未命名故事") -> dict[str, Any]:
    cleaned = text.strip()
    if not cleaned:
        return _empty_analysis(title)

    preprocessed = preprocess_text(cleaned)
    narration = preprocessed.narration or preprocessed.raw
    rule_characters = rule_extract_characters(preprocessed.raw)
    rule_settings = rule_extract_locations(preprocessed.raw)

    nlp = _load_spacy()
    if nlp is not None:
        return _analyze_with_spacy(
            nlp,
            preprocessed,
            narration,
            title,
            rule_characters,
            rule_settings,
        )

    return _analyze_fallback(preprocessed, title, rule_characters, rule_settings)


def _load_spacy():
    global _SPACY_NLP, _SPACY_MODEL
    if _SPACY_NLP is not None:
        return _SPACY_NLP

    try:
        import spacy
    except ImportError:
        return None

    for model in ("zh_core_web_sm", "en_core_web_sm"):
        try:
            _SPACY_NLP = spacy.load(model)
            _SPACY_MODEL = model
            return _SPACY_NLP
        except OSError:
            continue
    return None


def _analyze_with_spacy(
    nlp,
    preprocessed,
    narration: str,
    title: str,
    rule_characters: list[dict[str, Any]],
    rule_settings: list[str],
) -> dict[str, Any]:
    doc = nlp(narration[:50000])
    characters = _merge_characters(
        rule_characters,
        _extract_characters(doc),
        preprocessed.speakers,
    )
    settings = _merge_settings(rule_settings, _extract_settings(doc))
    plot_beats = _extract_plot_beats(preprocessed.paragraphs)
    svo_patterns = _extract_svo_patterns(doc)
    image_prompts = [
        build_image_prompt(beat.get("summary", ""), settings)
        for beat in plot_beats[:3]
    ]

    engine = "rules+spacy" if _SPACY_MODEL and _SPACY_MODEL.startswith("zh_") else "rules+nltk+spacy"

    return {
        "title": title,
        "characters": characters,
        "plotBeats": plot_beats,
        "settings": settings,
        "rawTextLength": len(preprocessed.raw),
        "engine": engine,
        "structure": {
            "dialogueCount": len(preprocessed.dialogues),
            "narrationLength": len(narration),
            "paragraphCount": len(preprocessed.paragraphs),
        },
        "svoPatterns": svo_patterns,
        "imagePrompts": image_prompts,
    }


def _merge_characters(
    rule_chars: list[dict[str, Any]],
    spacy_chars: list[dict[str, Any]],
    speakers: list[str],
) -> list[dict[str, Any]]:
    counts: dict[str, int] = {}

    for item in rule_chars:
        counts[item["name"]] = counts.get(item["name"], 0) + item["mentions"] * 2

    for item in spacy_chars:
        name = item["name"]
        counts[name] = counts.get(name, 0) + item["mentions"]

    for speaker in speakers:
        counts[speaker] = counts.get(speaker, 0) + 2

    ranked = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    return [{"name": name, "mentions": count} for name, count in ranked[:8]]


def _merge_settings(rule_settings: list[str], spacy_settings: list[str]) -> list[str]:
    merged: list[str] = []
    seen: set[str] = set()
    for place in [*rule_settings, *spacy_settings]:
        if place not in seen:
            seen.add(place)
            merged.append(place)
        if len(merged) >= 6:
            break
    return merged


def _extract_characters(doc) -> list[dict[str, Any]]:
    counts: dict[str, int] = {}
    for ent in doc.ents:
        if ent.label_ not in ("PERSON", "ORG"):
            continue
        name = ent.text.strip()
        if len(name) < 2 or name in _PERSON_BLOCKLIST:
            continue
        counts[name] = counts.get(name, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    return [{"name": name, "mentions": count} for name, count in ranked[:8]]


def _extract_settings(doc) -> list[str]:
    found: set[str] = set()
    for ent in doc.ents:
        if ent.label_ in ("LOC", "GPE", "FAC"):
            found.add(ent.text.strip())
    return list(found)[:6]


def _extract_svo_patterns(doc, limit: int = 6) -> list[dict[str, str]]:
    # zh_core_web_sm dependency parsing is unreliable for Classical Chinese prose.
    if _SPACY_MODEL and _SPACY_MODEL.startswith("zh_"):
        return []

    patterns: list[dict[str, str]] = []
    seen: set[tuple[str, str, str]] = set()

    for sent in doc.sents:
        subject = ""
        verb = ""
        obj = ""

        for token in sent:
            if token.dep_ in ("nsubj", "nsubjpass") and not subject:
                subject = token.text
            elif token.dep_ == "ROOT" and token.pos_ in ("VERB", "AUX"):
                verb = token.text
            elif token.dep_ in ("dobj", "attr", "pobj", "obj") and not obj:
                obj = token.text

        if not verb:
            continue

        triple = (subject, verb, obj)
        if triple in seen:
            continue
        seen.add(triple)

        patterns.append(
            {
                "subject": subject or "—",
                "verb": verb,
                "object": obj or "—",
            }
        )
        if len(patterns) >= limit:
            break

    return patterns


def _extract_plot_beats(paragraphs: list[str]) -> list[dict[str, Any]]:
    if not paragraphs:
        return []
    beats: list[dict[str, Any]] = []
    for i, para in enumerate(paragraphs[:8], start=1):
        summary = para[:120] + ("…" if len(para) > 120 else "")
        beats.append({"order": i, "summary": summary})
    return beats


def _analyze_fallback(
    preprocessed,
    title: str,
    rule_characters: list[dict[str, Any]],
    rule_settings: list[str],
) -> dict[str, Any]:
    plot_beats = _extract_plot_beats(preprocessed.paragraphs)
    characters = _merge_characters(rule_characters, [], preprocessed.speakers)
    image_prompts = [
        build_image_prompt(beat.get("summary", ""), rule_settings)
        for beat in plot_beats[:3]
    ]

    return {
        "title": title,
        "characters": characters,
        "plotBeats": plot_beats,
        "settings": rule_settings,
        "rawTextLength": len(preprocessed.raw),
        "engine": "rules+nltk",
        "structure": {
            "dialogueCount": len(preprocessed.dialogues),
            "narrationLength": len(preprocessed.narration),
            "paragraphCount": len(preprocessed.paragraphs),
        },
        "svoPatterns": [],
        "imagePrompts": image_prompts,
    }


def _empty_analysis(title: str) -> dict[str, Any]:
    return {
        "title": title,
        "characters": [],
        "plotBeats": [],
        "settings": [],
        "rawTextLength": 0,
        "engine": "empty",
        "structure": {"dialogueCount": 0, "narrationLength": 0, "paragraphCount": 0},
        "svoPatterns": [],
        "imagePrompts": [],
    }
