#!/usr/bin/env python3
"""Render an encrypted AWS dashboard PDF without persisting its password."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    from pypdf import PdfReader, PdfWriter
except ImportError as exc:  # pragma: no cover - environment guidance
    raise SystemExit(
        "pypdf is required; run this script with the bundled Codex PDF Python runtime"
    ) from exc


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--dpi", type=int, default=180)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.pdf.is_file():
        raise SystemExit(f"PDF not found: {args.pdf}")
    if args.dpi < 72 or args.dpi > 600:
        raise SystemExit("--dpi must be between 72 and 600")
    if shutil.which("pdftoppm") is None:
        raise SystemExit("pdftoppm is required to render the report")

    password = sys.stdin.readline().rstrip("\r\n")
    if not password:
        raise SystemExit("PDF password must be supplied on standard input")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    if any(args.output_dir.iterdir()):
        raise SystemExit("--output-dir must be empty")

    reader = PdfReader(str(args.pdf))
    if reader.is_encrypted and not reader.decrypt(password):
        raise SystemExit("PDF password was rejected")

    password = ""
    with tempfile.TemporaryDirectory(prefix="aws-cost-pdf-") as scratch:
        decrypted = Path(scratch) / "report.pdf"
        writer = PdfWriter()
        writer.clone_document_from_reader(reader)
        with decrypted.open("wb") as stream:
            writer.write(stream)

        prefix = args.output_dir / "page"
        subprocess.run(
            [
                "pdftoppm",
                "-png",
                "-r",
                str(args.dpi),
                str(decrypted),
                str(prefix),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
        )

    rendered = sorted(
        args.output_dir.glob("page-*.png"),
        key=lambda path: int(path.stem.rsplit("-", 1)[-1]),
    )
    pages = [str(path.resolve()) for path in rendered]
    if not pages:
        raise SystemExit("PDF rendering produced no pages")

    print(
        json.dumps(
            {
                "pdf_sha256": sha256_file(args.pdf),
                "page_count": len(pages),
                "page_images": pages,
            },
            separators=(",", ":"),
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
