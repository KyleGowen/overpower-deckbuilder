#!/usr/bin/env python3
"""
Download each tab of the public OverPower Check List Google Sheet as CSV
and write markdown tables under docs/checklist-source/.

Sheet ID: 1WGvA8v8NAd8ByOtiuhhG6d13R3twSGbs
Requires network access to Google export URLs.
"""
from __future__ import annotations

import csv
import io
import re
import urllib.request
from pathlib import Path

SPREADSHEET_ID = "1WGvA8v8NAd8ByOtiuhhG6d13R3twSGbs"
EDIT_URL = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit"

SHEETS: list[tuple[str, str, str, str]] = [
    (
        "1007221192",
        "checklist.md",
        "Checklist",
        "Main card list (#, name, special, rarity, location). Source of truth for collection names and numbers per docs/current/COLLECTION_CHECKLIST_SOURCE.md.",
    ),
    (
        "1403717334",
        "checklist-promos.md",
        "Checklist Promos",
        "Promos, con exclusives, NAOL / Kickstarter bonuses, and related entries (card category, type, title, location, year, notes).",
    ),
    (
        "1934819538",
        "erb-woprize-packs.md",
        "ERB",
        "Edgar Rice Burroughs WoPrize / prize-pack style entries (set prefix ERB, card #, name, special, rarity, location).",
    ),
    (
        "2083568690",
        "edgar-rice-burroughs-full-checklist.md",
        "Edgar Rice Burroughs and the WoPrize Packs",
        "Full ERB-set style checklist including Have, Set, #, name, special, rarity, location, and notes.",
    ),
]


def cell_md(value: str) -> str:
    s = value.replace("\r\n", "\n").replace("\r", "\n").strip()
    s = re.sub(r"\s+", " ", s)
    return s.replace("|", "\\|").replace("\n", " ")


def csv_to_markdown_table(rows: list[list[str]]) -> str:
    if not rows:
        return "_No rows._\n"

    header = rows[0]
    body = rows[1:] if len(rows) > 1 else []

    def row_line(cells: list[str]) -> str:
        return "| " + " | ".join(cell_md(c) for c in cells) + " |"

    sep = "| " + " | ".join("---" for _ in header) + " |"
    lines = [row_line(header), sep]
    for r in body:
        if len(r) < len(header):
            r = r + [""] * (len(header) - len(r))
        elif len(r) > len(header):
            r = r[: len(header)]
        lines.append(row_line(r))
    return "\n".join(lines) + "\n"


def fetch_csv(gid: str) -> str:
    url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={gid}"
    req = urllib.request.Request(url, headers={"User-Agent": "Excelsior-checklist-export/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read().decode("utf-8", errors="replace")


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out_dir = root / "docs" / "checklist-source"
    out_dir.mkdir(parents=True, exist_ok=True)

    for gid, filename, tab_name, description in SHEETS:
        raw = fetch_csv(gid)
        reader = csv.reader(io.StringIO(raw))
        rows = list(reader)
        md_path = out_dir / filename
        tab_url = f"{EDIT_URL}?gid={gid}#gid={gid}"
        content = (
            f"# {tab_name}\n\n"
            f"{description}\n\n"
            f"- **Spreadsheet**: [OverPower Check List]({EDIT_URL})\n"
            f"- **This tab**: [open tab]({tab_url}) (gid `{gid}`)\n"
            f"- **Exported**: CSV via Google `export?format=csv&gid=` — regenerate with `python3 scripts/export-overpower-checklist-markdown.py`\n\n"
            f"## Data\n\n"
            f"{csv_to_markdown_table(rows)}"
        )
        md_path.write_text(content, encoding="utf-8")
        print(f"Wrote {md_path.relative_to(root)} ({len(rows)} rows)")


if __name__ == "__main__":
    main()
