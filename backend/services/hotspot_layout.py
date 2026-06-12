"""Assign illustration hotspot x/y when missing (zone fallback)."""

from __future__ import annotations

from typing import Any

ZONE_PRESETS: list[tuple[int, int]] = [
    (52, 42),
    (28, 48),
    (68, 55),
    (38, 72),
    (78, 38),
    (12, 62),
    (85, 68),
    (50, 28),
    (22, 58),
]


def resolve_hotspot_xy(hotspot: dict[str, Any], index: int) -> tuple[int, int]:
    x = int(hotspot.get("x") or 0)
    y = int(hotspot.get("y") or 0)
    if x > 0 and y > 0:
        return x, y
    preset = ZONE_PRESETS[index % len(ZONE_PRESETS)]
    return preset


def apply_hotspot_layout(graph: dict[str, Any]) -> dict[str, Any]:
    """Fill zero coordinates on exploration hotspots (idempotent for manual coords)."""
    scenes = graph.get("scenes") or {}
    for scene in scenes.values():
        hotspots = scene.get("hotspots") or []
        for index, hotspot in enumerate(hotspots):
            x, y = resolve_hotspot_xy(hotspot, index)
            if int(hotspot.get("x") or 0) == 0 and int(hotspot.get("y") or 0) == 0:
                hotspot["x"] = x
                hotspot["y"] = y
    return graph
