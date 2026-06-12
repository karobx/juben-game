"""Extract plain text from PDF and text files."""

from __future__ import annotations

from pathlib import Path


def extract_text_from_file(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="replace")
    if suffix == ".pdf":
        return _extract_pdf(path)
    raise ValueError(f"不支援的檔案格式：{suffix}")


def _extract_pdf(path: Path) -> str:
    import fitz

    doc = fitz.open(path)
    parts: list[str] = []
    for page in doc:
        parts.append(page.get_text())
    doc.close()
    return "\n".join(parts).strip()
