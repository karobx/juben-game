"""Rule-based extraction for Traditional Chinese historical narrative text."""

from __future__ import annotations

import re
from typing import Any

# 常見史實人名（可隨劇本擴充）
_KNOWN_FIGURES: tuple[str, ...] = (
    "秦始皇",
    "秦始皇帝",
    "漢武帝",
    "汉武帝",
    "光武帝",
    "劉邦",
    "刘邦",
    "張騫",
    "张骞",
    "項羽",
    "项羽",
    "李斯",
    "趙高",
    "赵高",
    "衛青",
    "霍去病",
    "諸葛亮",
    "诸葛亮",
    "曹操",
    "劉備",
    "刘备",
    "孫權",
    "孙权",
)

_FIGURE_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile("|".join(re.escape(name) for name in _KNOWN_FIGURES)),
    re.compile(r"[\u4e00-\u9fff]{2,4}帝(?!王|國|陵|都)"),
    re.compile(r"[\u4e00-\u9fff]{2,4}王(?!朝|國|陵|都|座)"),
)

_KNOWN_LOCATIONS: tuple[str, ...] = (
    "咸陽",
    "咸阳",
    "長安",
    "长安",
    "洛陽",
    "洛阳",
    "西域",
    "絲綢之路",
    "丝绸之路",
    "函谷關",
    "函谷关",
    "邯鄲",
    "邯郸",
    "建康",
    "臨淄",
    "临淄",
)

_LOCATION_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile("|".join(re.escape(name) for name in _KNOWN_LOCATIONS)),
    re.compile(r"[\u4e00-\u9fff]{1,4}(?:城|都|州|關|关|宮|宫|台|口)(?!縣|县)"),
)

_PERSON_BLOCKLIST: frozenset[str] = frozenset(
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
        "大一統",
        "大统一",
        "局面的",
        "以及漢武帝",
        "及漢武帝",
    }
)

_LOCATION_BLOCKLIST: frozenset[str] = frozenset(
    {"王朝", "皇城", "帝都", "國都", "国都", "立中央集權的郡"}
)

_FIGURE_PREFIX_RE = re.compile(r"^[以及與与及向由自從从]+")


def extract_characters(text: str) -> list[dict[str, Any]]:
    counts: dict[str, int] = {}

    for pattern in _FIGURE_PATTERNS:
        for match in pattern.finditer(text):
            name = _normalize_figure_name(match.group(0))
            if name and name not in _PERSON_BLOCKLIST:
                counts[name] = counts.get(name, 0) + 1

    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [{"name": name, "mentions": count} for name, count in ranked[:8]]


def extract_locations(text: str) -> list[str]:
    found: dict[str, int] = {}

    for pattern in _LOCATION_PATTERNS:
        for match in pattern.finditer(text):
            place = match.group(0).strip()
            if len(place) < 2 or place in _LOCATION_BLOCKLIST or "的" in place:
                continue
            found[place] = found.get(place, 0) + 1

    ranked = sorted(found.items(), key=lambda item: (-item[1], item[0]))
    return [name for name, _ in ranked[:6]]


def _normalize_figure_name(name: str) -> str:
    name = _FIGURE_PREFIX_RE.sub("", name)
    for prefix in ("東漢", "东汉", "西漢", "西汉"):
        if name.startswith(prefix) and len(name) > len(prefix):
            name = name[len(prefix) :]
            break

    aliases = {
        "秦始皇帝": "秦始皇",
        "刘邦": "劉邦",
        "张骞": "張騫",
        "项羽": "項羽",
        "赵高": "趙高",
        "汉武帝": "漢武帝",
        "光武": "光武帝",
    }
    return aliases.get(name, name)
