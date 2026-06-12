#!/usr/bin/env python3
"""Download 中一讀書卡 PDFs from chistory.kanhan.com and extract text."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

import fitz

BASE = "https://chistory.kanhan.com/sites/default/files/course_pdf/f1"
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "f1_reading_cards"
ROOT = DATA_DIR.parent.parent
sys.path.insert(0, str(ROOT))

from services.f1_chapter_content import is_placeholder_text, summarize_from_text  # noqa: E402

PERIODS: dict[str, dict] = {
    "pre_qin": {
        "id": "pre_qin",
        "title": "史前至夏商周",
        "subtitle": "中華民族起源、西周封建與春秋戰國變局",
        "chapters": [
            ("F1P1T1CH1_中國多元一體文化的起源2.pdf", "第一章：中國多元一體文化的起源"),
            ("F1P1T1CH2中華民族的演進歷程2.pdf", "第二章：中華民族的演進歷程"),
            ("F1P1T1CH3夏、商、周三代的興替概況2.pdf", "第三章：夏、商、周三代的興替概況"),
            ("F1P1T2CH1西周的封建.pdf", "第一章：西周的封建"),
            ("F1P1T3CH1春秋戰國時期的兼併戰爭.pdf", "第一章：春秋戰國時期的兼併戰爭"),
            ("F1P1T3CH2戰國時期的厲行變法.pdf", "第二章：戰國時期的厲行變法"),
            ("F1P1T3CH3百家爭鳴.pdf", "第三章：百家爭鳴"),
            ("F1P1T3CH4_人物個案研習_延伸部分.pdf", "第四章：人物個案研習"),
        ],
        "path_prefix": "f1p1",
    },
    "qin_han": {
        "id": "qin_han",
        "title": "秦漢",
        "subtitle": "大一統帝國的建立、發展與中外文化交流",
        "chapters": [
            ("F1P2T1CH1秦朝的統一及其統治措施與影響.pdf", "秦朝的統一及其統治措施與影響"),
            ("F1P2T1CH2秦朝滅亡與楚漢相爭.pdf", "秦朝滅亡與楚漢相爭"),
            ("F1P2T2CH1西漢的建立.pdf", "西漢的建立"),
            ("F1P2T2CH2漢武帝的文治與武功.pdf", "漢武帝的文治與武功"),
            ("F1P2T2CH3昭宣以後戚宦政治與漢朝的衰亡.pdf", "昭宣以後戚宦政治與漢朝的衰亡"),
            ("F1P2T2CH4兩漢通西域與中外文化交流.pdf", "兩漢通西域與中外文化交流"),
            ("F1P2T2CH5道教的形成_延伸部分.pdf", "道教的形成（延伸）"),
            ("F1P2T2CH6科技發明_延伸部分_造紙術、天文儀器的發明_ver.2.pdf", "科技發明（延伸）"),
        ],
        "path_prefix": "f1p2",
    },
    "three_kingdoms": {
        "id": "three_kingdoms",
        "title": "三國兩晉南北朝",
        "subtitle": "分裂政局、江南開發與社會文化發展",
        "chapters": [
            ("F1P3T1CH1三國鼎立局面的形成.pdf", "第一章：三國鼎立局面的形成"),
            ("F1P3T1CH2兩晉南北朝政權的更替概況.pdf", "第二章：兩晉南北朝政權的更替概況"),
            ("F1P3T1CH3武備的演進_延伸部分.pdf", "第三章：武備的演進（延伸）"),
            ("F1P3T2CH1北方的政局與孝文帝漢化.pdf", "第一章：北方的政局與孝文帝漢化"),
            ("F1P3T2CH2江南地區的開發.pdf", "第二章：江南地區的開發"),
            ("F1P3T3CH1士族的生活面貌.pdf", "第一章：士族的生活面貌"),
            ("F1P3T3CH2石窟藝術與中外文化交流.pdf", "第二章：石窟藝術與中外文化交流"),
        ],
        "path_prefix": "f1p3",
    },
    "sui_tang": {
        "id": "sui_tang",
        "title": "隋唐",
        "subtitle": "盛世開創、安史之亂與開放的唐朝社會",
        "chapters": [
            ("F1P4T1CH1隋朝的統一.pdf", "第一章：隋朝的統一"),
            ("F1P4T1CH2開皇之治的措施與影響.pdf", "第二章：開皇之治的措施與影響"),
            ("F1P4T2CH1隋代大運河的開通與作用.pdf", "第一章：隋代大運河的開通與作用"),
            ("F1P4T3CH1唐的建國.pdf", "第一章：唐的建國"),
            ("F1P4T3CH2貞觀之治的治績與影響.pdf", "第二章：貞觀之治的治績與影響"),
            ("F1P4T3CH3武后施政特色_延伸部分.pdf", "第三章：武后施政的特色（延伸）"),
            ("F1P4T3CH4開元之治的治績與影響_延伸部分.pdf", "第四章：開元之治的治績與影響（延伸）"),
            ("F1P4T4CH1安史之亂的始末.pdf", "第一章：安史之亂的始末"),
            ("F1P4T4CH2唐中葉後的政局與衰亡.pdf", "第二章：唐中葉後的政局與衰亡"),
            ("F1P4T5CH1婦女的生活面貌與地位.pdf", "第一章：婦女的生活面貌與地位"),
            ("F1P4T5CH2玄奘西行與中印文化交流.pdf", "第二章：玄奘西行與中印文化交流"),
            ("F1P4T5CH3唐代海路交通及對外關係.pdf", "第三章：唐代海路交通及對外關係"),
        ],
        "path_prefix": "f1p4",
    },
}


def download_pdf(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1000:
        return
    subprocess.run(
        ["curl", "-skL", "-o", str(dest), url],
        check=True,
        capture_output=True,
    )


def extract_pdf_text(path: Path) -> str:
    doc = fitz.open(path)
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return _clean_text(text)


def _clean_text(text: str) -> str:
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    return text.strip()


def _summarize_chapter(text: str, title: str, max_len: int = 280) -> str:
    """Pick first substantive bullet paragraph as scene narrative."""
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    skip = {"考前筆記", "中一級", "歷史時期", "課題", "延伸部分"}
    candidates: list[str] = []
    for ln in lines:
        if any(k in ln for k in skip) and len(ln) < 30:
            continue
        if ln.startswith("一、") or ln.startswith("二、") or ln.startswith("三、"):
            continue
        if ln.startswith("- ") or ln.startswith("•"):
            body = ln.lstrip("- •").strip()
            if len(body) >= 20:
                candidates.append(body)
        elif re.match(r"^\d+\.\d", ln):
            continue
        elif len(ln) >= 30 and not ln.endswith("："):
            candidates.append(ln)

    if candidates:
        summary = candidates[0]
        if len(summary) > max_len:
            summary = summary[: max_len - 1] + "…"
        return f"【{title}】{summary}"

    snippet = text[:max_len].replace("\n", " ")
    return f"【{title}】{snippet}…"


def scrape_period(period_id: str, period: dict) -> dict:
    prefix = period["path_prefix"]
    period_dir = DATA_DIR / period_id
    period_dir.mkdir(parents=True, exist_ok=True)
    chapters_out: list[dict] = []
    full_text_parts: list[str] = []

    for filename, title in period["chapters"]:
        url = f"{BASE}/{prefix}/{filename}"
        pdf_path = period_dir / filename
        txt_path = period_dir / (Path(filename).stem + ".txt")

        print(f"  下載 {title}…")
        download_pdf(url, pdf_path)
        text = extract_pdf_text(pdf_path)
        if is_placeholder_text(text) and txt_path.exists():
            existing = txt_path.read_text(encoding="utf-8")
            if not is_placeholder_text(existing):
                text = existing
                print(f"    保留既有補充文本（PDF 無效）")
        txt_path.write_text(text, encoding="utf-8")
        summary = (
            summarize_from_text(text, title)
            if not is_placeholder_text(text)
            else _summarize_chapter(text, title)
        )
        chapters_out.append(
            {
                "title": title,
                "filename": filename,
                "url": url,
                "summary": summary,
                "textLength": len(text),
            }
        )
        full_text_parts.append(f"\n\n=== {title} ===\n\n{text}")

    full_story = "".join(full_text_parts).strip()
    (period_dir / "full_story.txt").write_text(full_story, encoding="utf-8")

    meta = {
        "id": period_id,
        "title": period["title"],
        "subtitle": period["subtitle"],
        "sourceUrl": "https://chistory.kanhan.com/tc/f1-reading-card",
        "chapterCount": len(chapters_out),
        "chapters": chapters_out,
        "fullTextLength": len(full_story),
    }
    (period_dir / "metadata.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return meta


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    all_periods: list[dict] = []
    for period_id, period in PERIODS.items():
        print(f"\n=== {period['title']} ===")
        meta = scrape_period(period_id, period)
        all_periods.append(meta)

    index = {
        "source": "https://chistory.kanhan.com/tc/f1-reading-card",
        "periods": all_periods,
    }
    (DATA_DIR / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\n完成！資料儲存於 {DATA_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
