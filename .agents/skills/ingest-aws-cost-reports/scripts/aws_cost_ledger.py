#!/usr/bin/env python3
"""Append-only CSV ledger for emailed and backfilled AWS cost records."""

from __future__ import annotations

import argparse
import csv
import fcntl
import hashlib
import json
import os
import sys
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Iterable

FIELDNAMES = [
    "record_key",
    "source_type",
    "source_id",
    "source_sha256",
    "report_name",
    "generated_at_utc",
    "period_start",
    "period_end",
    "granularity",
    "row_index",
    "row_label",
    "normalized_row_label",
    "column_index",
    "column_label",
    "billing_month",
    "amount",
    "currency",
    "estimated",
    "ingested_at_utc",
]

SOURCE_TYPES = {"email_pdf", "aws_cost_explorer", "aws_invoice_pdf"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    for name in ("init", "verify"):
        command = subparsers.add_parser(name)
        command.add_argument("--ledger", required=True, type=Path)

    contains = subparsers.add_parser("contains")
    contains.add_argument("--ledger", required=True, type=Path)
    contains.add_argument("--source-type", required=True, choices=sorted(SOURCE_TYPES))
    contains.add_argument("--source-id", required=True)

    append = subparsers.add_parser("append")
    append.add_argument("--ledger", required=True, type=Path)
    append.add_argument("--input", default="-", help="JSON file path or - for stdin")
    return parser.parse_args()


def require_text(value: Any, name: str, *, allow_empty: bool = False) -> str:
    if not isinstance(value, str) or (not allow_empty and not value.strip()):
        raise ValueError(f"{name} must be a non-empty string")
    return value.strip()


def require_index(value: Any, name: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError(f"{name} must be a non-negative integer")
    return value


def require_iso(value: Any, name: str, *, allow_empty: bool = False) -> str:
    text = require_text(value, name, allow_empty=allow_empty)
    if not text and allow_empty:
        return text
    try:
        if "T" in text:
            datetime.fromisoformat(text.replace("Z", "+00:00"))
        else:
            date.fromisoformat(text)
    except ValueError as exc:
        raise ValueError(f"{name} must be an ISO date or timestamp") from exc
    return text


def require_sha256(value: Any) -> str:
    text = require_text(value, "source_sha256").lower()
    if len(text) != 64 or any(char not in "0123456789abcdef" for char in text):
        raise ValueError("source_sha256 must be 64 lowercase hexadecimal characters")
    return text


def normalize_amount(value: Any) -> str:
    text = require_text(value, "amount")
    try:
        amount = Decimal(text)
    except InvalidOperation as exc:
        raise ValueError(f"invalid decimal amount: {text}") from exc
    if not amount.is_finite():
        raise ValueError("amount must be finite")
    normalized = format(amount, "f")
    if "." in normalized:
        normalized = normalized.rstrip("0").rstrip(".")
    return "0" if normalized in {"", "-0"} else normalized


def record_key(record: dict[str, str]) -> str:
    identity = "\x1f".join(
        record[field]
        for field in (
            "source_type",
            "source_id",
            "source_sha256",
            "period_start",
            "period_end",
            "row_index",
            "row_label",
            "column_index",
            "column_label",
        )
    )
    return hashlib.sha256(identity.encode("utf-8")).hexdigest()


def build_records(document: Any) -> list[dict[str, str]]:
    if not isinstance(document, dict):
        raise ValueError("append input must be a JSON object")
    source_type = require_text(document.get("source_type"), "source_type")
    if source_type not in SOURCE_TYPES:
        raise ValueError(f"source_type must be one of {sorted(SOURCE_TYPES)}")

    shared = {
        "source_type": source_type,
        "source_id": require_text(document.get("source_id"), "source_id"),
        "source_sha256": require_sha256(document.get("source_sha256")),
        "report_name": require_text(document.get("report_name", ""), "report_name", allow_empty=True),
        "generated_at_utc": require_iso(document.get("generated_at_utc", ""), "generated_at_utc", allow_empty=True),
        "period_start": require_iso(document.get("period_start"), "period_start"),
        "period_end": require_iso(document.get("period_end"), "period_end"),
        "granularity": require_text(document.get("granularity"), "granularity"),
        "ingested_at_utc": require_iso(document.get("ingested_at_utc"), "ingested_at_utc"),
    }

    rows = document.get("rows")
    if not isinstance(rows, list) or not rows:
        raise ValueError("rows must be a non-empty array")

    records: list[dict[str, str]] = []
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("each row must be an object")
        row_index = require_index(row.get("row_index"), "row_index")
        row_label = require_text(row.get("row_label"), "row_label")
        normalized_label = require_text(
            row.get("normalized_row_label", row_label),
            "normalized_row_label",
        )
        row_period_start = require_iso(
            row.get("period_start", shared["period_start"]),
            "row.period_start",
        )
        row_period_end = require_iso(
            row.get("period_end", shared["period_end"]),
            "row.period_end",
        )
        values = row.get("values")
        if not isinstance(values, list) or not values:
            raise ValueError("each row must contain at least one value")

        for value in values:
            if not isinstance(value, dict):
                raise ValueError("each value must be an object")
            estimated = value.get("estimated")
            if not isinstance(estimated, bool):
                raise ValueError("estimated must be a boolean")
            record = {
                **shared,
                "period_start": row_period_start,
                "period_end": row_period_end,
                "row_index": str(row_index),
                "row_label": row_label,
                "normalized_row_label": normalized_label,
                "column_index": str(require_index(value.get("column_index"), "column_index")),
                "column_label": require_text(value.get("column_label"), "column_label"),
                "billing_month": require_text(
                    value.get("billing_month", ""),
                    "billing_month",
                    allow_empty=True,
                ),
                "amount": normalize_amount(value.get("amount")),
                "currency": require_text(value.get("currency"), "currency").upper(),
                "estimated": "true" if estimated else "false",
            }
            record["record_key"] = record_key(record)
            records.append({field: record[field] for field in FIELDNAMES})

    keys = [record["record_key"] for record in records]
    if len(keys) != len(set(keys)):
        raise ValueError("append input contains duplicate record identities")
    return records


def read_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != FIELDNAMES:
            raise ValueError("ledger header does not match the expected schema")
        return list(reader)


def validate_rows(rows: Iterable[dict[str, str]]) -> int:
    seen: set[str] = set()
    count = 0
    for row in rows:
        if set(row) != set(FIELDNAMES):
            raise ValueError("ledger contains an invalid column set")
        if row["record_key"] != record_key(row):
            raise ValueError(f"record key mismatch for {row['record_key']}")
        if row["record_key"] in seen:
            raise ValueError(f"duplicate record key: {row['record_key']}")
        seen.add(row["record_key"])
        if row["source_type"] not in SOURCE_TYPES:
            raise ValueError(f"invalid source type: {row['source_type']}")
        normalize_amount(row["amount"])
        if row["estimated"] not in {"true", "false"}:
            raise ValueError("estimated must be true or false")
        count += 1
    return count


def initialize(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        validate_rows(read_rows(path))
        return
    with path.open("x", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=FIELDNAMES, lineterminator="\n")
        writer.writeheader()
        stream.flush()
        os.fsync(stream.fileno())


def append_records(path: Path, records: list[dict[str, str]]) -> tuple[int, bool]:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a+", newline="", encoding="utf-8") as stream:
        fcntl.flock(stream.fileno(), fcntl.LOCK_EX)
        stream.seek(0)
        first_character = stream.read(1)
        if first_character:
            stream.seek(0)
            reader = csv.DictReader(stream)
            if reader.fieldnames != FIELDNAMES:
                raise ValueError("ledger header does not match the expected schema")
            existing = list(reader)
        else:
            stream.seek(0)
            writer = csv.DictWriter(stream, fieldnames=FIELDNAMES, lineterminator="\n")
            writer.writeheader()
            existing = []

        validate_rows(existing)
        existing_keys = {row["record_key"] for row in existing}
        same_source = {
            (row["source_type"], row["source_id"]): row["source_sha256"]
            for row in existing
        }
        source_identity = (records[0]["source_type"], records[0]["source_id"])
        prior_hash = same_source.get(source_identity)
        if prior_hash is not None and prior_hash != records[0]["source_sha256"]:
            raise ValueError("source_id already exists with a different source_sha256")

        new_records = [record for record in records if record["record_key"] not in existing_keys]
        if prior_hash is not None and new_records:
            raise ValueError("source_id is only partially present; refusing a partial append")
        if not new_records:
            return 0, True

        stream.seek(0, os.SEEK_END)
        writer = csv.DictWriter(stream, fieldnames=FIELDNAMES, lineterminator="\n")
        writer.writerows(new_records)
        stream.flush()
        os.fsync(stream.fileno())
        return len(new_records), False


def load_document(input_path: str) -> Any:
    if input_path == "-":
        line = sys.stdin.readline()
        if not line:
            raise ValueError("append input was empty")
        return json.loads(line)
    with Path(input_path).open(encoding="utf-8") as stream:
        return json.load(stream)


def main() -> int:
    args = parse_args()
    if args.command == "init":
        initialize(args.ledger)
        print(json.dumps({"initialized": True, "ledger": str(args.ledger)}))
        return 0
    if args.command == "verify":
        count = validate_rows(read_rows(args.ledger))
        print(json.dumps({"valid": True, "records": count}))
        return 0
    if args.command == "contains":
        matched = any(
            row["source_type"] == args.source_type and row["source_id"] == args.source_id
            for row in read_rows(args.ledger)
        )
        print(json.dumps({"contains": matched}))
        return 0
    if args.command == "append":
        records = build_records(load_document(args.input))
        added, duplicate = append_records(args.ledger, records)
        print(json.dumps({"added": added, "duplicate": duplicate}))
        return 0
    raise AssertionError("unreachable")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
