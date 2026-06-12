"""Tests for NLTK + SpaCy NLP pipeline."""

from services.nltk_service import expand_english_prompt, preprocess_text
from services.nlp_service import analyze_text


def test_preprocess_splits_dialogue_and_narration():
    text = "長安街頭，張騫停下腳步。他說：「我要出使西域。」旁白繼續描述。"
    pre = preprocess_text(text)

    assert len(pre.dialogues) == 1
    assert pre.dialogues[0].text == "我要出使西域。"
    assert "長安" in pre.narration or "張騫" in pre.narration


def test_analyze_text_returns_structure_metadata():
    text = "漢武帝在長安推行推恩令。\n\n張騫出使西域，開闢絲綢之路。"
    result = analyze_text(text, title="漢武")

    assert result["title"] == "漢武"
    assert result["engine"] in ("nltk+spacy", "nltk", "empty")
    assert "structure" in result
    assert len(result["plotBeats"]) >= 1
    assert "imagePrompts" in result


def test_wordnet_expansion_includes_original():
    words = expand_english_prompt("dark", max_synonyms=2)
    assert words[0] == "dark"
    assert len(words) >= 1
