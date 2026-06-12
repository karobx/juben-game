#!/usr/bin/env python3
"""Build playable story fixtures from scraped 中一讀書卡 data."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.chistory_service import build_and_save_all_fixtures


def main() -> int:
    build_and_save_all_fixtures()
    return 0


if __name__ == "__main__":
    sys.exit(main())
