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
        "Promos, con exclusives, NAOL / Kickstarter bonuses, and related entries (card category, type, title, location, year, notes). "
        "Level 8 power alternate arts are prefixed **ERB promos —** in Location on export (promotional releases, not the core ERB numbered set).",
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

# Level 8 power promo / alternate-art titles in Checklist Promos (e.g. "8E - Zeus", "8A - Osiris character sketch").
_LEVEL_8_POWER_ALT_TITLE = re.compile(r"^8[A-Z] -")
_ERB_PROMOS_LOC_PREFIX = "ERB promos — "


def _col_index(header: list[str], name: str) -> int:
    for i, h in enumerate(header):
        if h.strip() == name:
            return i
    return -1


def postprocess_checklist_promos_rows(rows: list[list[str]]) -> list[list[str]]:
    """Tag level 8 power alternate-art rows as ERB promos in Location (not ambiguous with core ERB set)."""
    if not rows:
        return rows
    header = rows[0]
    # Google CSV uses "Card Category" for values like Power Card / Character Card, and "Type" for the main title (e.g. 8E - Zeus).
    ci = _col_index(header, "Card Category")
    type_col = _col_index(header, "Type")
    li = _col_index(header, "Location")
    if ci < 0 or type_col < 0 or li < 0:
        return rows
    ncols = len(header)
    out: list[list[str]] = [header]
    for r in rows[1:]:
        row = list(r)
        if len(row) < ncols:
            row.extend([""] * (ncols - len(row)))
        else:
            row = row[:ncols]
        kind = row[ci].strip()
        title_line = row[type_col].strip()
        loc = row[li].strip()
        if kind == "Power Card" and _LEVEL_8_POWER_ALT_TITLE.match(title_line):
            if not loc.startswith("ERB promos"):
                row[li] = f"{_ERB_PROMOS_LOC_PREFIX}{loc}" if loc else "ERB promos"
        out.append(row)
    return out


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
        if filename == "checklist-promos.md":
            rows = postprocess_checklist_promos_rows(rows)
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
