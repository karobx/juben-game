#!/usr/bin/env python3
"""Apply chapter supplements for 404 PDFs and refresh metadata summaries."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from services.f1_chapter_content import (  # noqa: E402
    DATA_DIR,
    is_placeholder_text,
    load_chapter_text,
    summarize_from_text,
)

SUPPLEMENTS_PATH = DATA_DIR / "chapter_supplements.json"


def main() -> int:
    supplements = json.loads(SUPPLEMENTS_PATH.read_text(encoding="utf-8"))["chapters"]
    for period_dir in sorted(DATA_DIR.iterdir()):
        if not period_dir.is_dir() or period_dir.name.startswith("."):
            continue
        meta_path = period_dir / "metadata.json"
        if not meta_path.exists():
            continue
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        period_id = meta["id"]
        changed = False
        full_parts: list[str] = []

        for chapter in meta.get("chapters") or []:
            filename = chapter.get("filename", "")
            title = chapter.get("title", "")
            txt_path = period_dir / f"{Path(filename).stem}.txt"
            text = txt_path.read_text(encoding="utf-8") if txt_path.exists() else ""

            if filename in supplements and is_placeholder_text(text):
                entry = supplements[filename]
                bullets = entry.get("bullets") or []
                new_text = f"【{entry.get('title', title)}】\n" + "\n".join(
                    f"- {b}" for b in bullets
                )
                txt_path.write_text(new_text, encoding="utf-8")
                text = new_text
                chapter["summary"] = summarize_from_text(text, title)
                chapter["textLength"] = len(text)
                changed = True
                print(f"  已補齊 {period_id}: {title}")

            full_parts.append(f"\n\n=== {title} ===\n\n{text}")

        if changed:
            meta["fullTextLength"] = sum(len(p) for p in full_parts)
            meta_path.write_text(
                json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            (period_dir / "full_story.txt").write_text(
                "".join(full_parts).strip(), encoding="utf-8"
            )
            print(f"已更新 {meta_path}")

    index_path = DATA_DIR / "index.json"
    if index_path.exists():
        index = json.loads(index_path.read_text(encoding="utf-8"))
        index["periods"] = [
            json.loads((DATA_DIR / p["id"] / "metadata.json").read_text(encoding="utf-8"))
            for p in index.get("periods", [])
            if (DATA_DIR / p["id"] / "metadata.json").exists()
        ]
        index_path.write_text(
            json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
