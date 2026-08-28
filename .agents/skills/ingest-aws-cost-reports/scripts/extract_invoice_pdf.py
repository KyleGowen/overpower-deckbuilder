#!/usr/bin/env python3
"""Convert a finalized AWS invoice PDF into aws_cost_ledger append JSON."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

SERVICE_LINE = re.compile(
    r"^ {4}([^ ].*?) {2,}(?:(-?)USD\s+|\$)([0-9][0-9,]*\.\d{2})\s*$"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True, type=Path)
    parser.add_argument("--invoice-id", required=True)
    parser.add_argument("--issued-at-utc", required=True)
    parser.add_argument("--period-start", required=True)
    parser.add_argument("--period-end", required=True)
    parser.add_argument("--total", required=True)
    parser.add_argument("--ingested-at-utc", required=True)
    return parser.parse_args()


def require_iso(value: str, name: str) -> str:
    try:
        if "T" in value:
            datetime.fromisoformat(value.replace("Z", "+00:00"))
        else:
            date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"{name} must be an ISO date or timestamp") from exc
    return value


def parse_amount(value: str) -> Decimal:
    try:
        amount = Decimal(value.replace(",", ""))
    except InvalidOperation as exc:
        raise ValueError(f"invalid decimal amount: {value}") from exc
    if not amount.is_finite():
        raise ValueError("amount must be finite")
    return amount


def format_amount(value: Decimal) -> str:
    normalized = format(value, "f")
    if "." in normalized:
        normalized = normalized.rstrip("0").rstrip(".")
    return "0" if normalized in {"", "-0"} else normalized


def extract_text(pdf: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(pdf), "-"],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout


def extract_services(text: str) -> list[tuple[str, Decimal]]:
    services: list[tuple[str, Decimal]] = []
    seen: set[str] = set()
    for raw_line in text.splitlines():
        line = raw_line.lstrip("\f")
        match = SERVICE_LINE.match(line)
        if not match:
            continue
        label, negative, amount_text = match.groups()
        if label == "AWS Service Charges":
            continue
        if label in seen:
            raise ValueError(f"duplicate service line: {label}")
        seen.add(label)
        amount = parse_amount(amount_text)
        if negative:
            amount = -amount
        if amount != 0:
            services.append((label, amount))
    return services


def build_document(args: argparse.Namespace) -> dict[str, object]:
    if not args.pdf.is_file():
        raise ValueError(f"invoice PDF not found: {args.pdf}")
    if not args.invoice_id.isdigit():
        raise ValueError("invoice ID must contain only digits")

    text = extract_text(args.pdf)
    if not re.search(rf"Invoice Number:\s+{re.escape(args.invoice_id)}\b", text):
        raise ValueError("invoice ID does not match the PDF")

    services = extract_services(text)
    expected_total = parse_amount(args.total)
    service_total = sum((amount for _, amount in services), Decimal("0"))
    if service_total != expected_total:
        raise ValueError(
            f"service rows total {format_amount(service_total)} does not match "
            f"invoice total {format_amount(expected_total)}"
        )

    period_start = require_iso(args.period_start, "period_start")
    period_end = require_iso(args.period_end, "period_end")
    issued_at = require_iso(args.issued_at_utc, "issued_at_utc")
    ingested_at = require_iso(args.ingested_at_utc, "ingested_at_utc")
    billing_month = period_start[:7]

    rows: list[dict[str, object]] = [
        {
            "row_index": 0,
            "row_label": "Total costs",
            "normalized_row_label": "Total costs",
            "values": [
                {
                    "column_index": 0,
                    "column_label": "Final invoice",
                    "billing_month": billing_month,
                    "amount": format_amount(expected_total),
                    "currency": "USD",
                    "estimated": False,
                }
            ],
        }
    ]
    for row_index, (label, amount) in enumerate(services, start=1):
        rows.append(
            {
                "row_index": row_index,
                "row_label": label,
                "normalized_row_label": label,
                "values": [
                    {
                        "column_index": 0,
                        "column_label": "Final invoice",
                        "billing_month": billing_month,
                        "amount": format_amount(amount),
                        "currency": "USD",
                        "estimated": False,
                    }
                ],
            }
        )

    return {
        "source_type": "aws_invoice_pdf",
        "source_id": args.invoice_id,
        "source_sha256": hashlib.sha256(args.pdf.read_bytes()).hexdigest(),
        "report_name": f"AWS Invoice {args.invoice_id}",
        "generated_at_utc": issued_at,
        "period_start": period_start,
        "period_end": period_end,
        "granularity": "monthly_invoice",
        "ingested_at_utc": ingested_at,
        "rows": rows,
    }


def main() -> int:
    try:
        document = build_document(parse_args())
        json.dump(document, sys.stdout, separators=(",", ":"))
        sys.stdout.write("\n")
        return 0
    except (OSError, subprocess.CalledProcessError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
