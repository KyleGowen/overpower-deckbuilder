#!/usr/bin/env python3

import datetime as dt
import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from collect_excelsior_aws_cost_audit import (  # noqa: E402
    has_project_ownership,
    is_relevant_service,
    previous_and_current_month_window,
    redact_error,
    summarize_numbers,
    tags_to_dict,
)


class CollectorUnitTests(unittest.TestCase):
    def test_tags_to_dict(self) -> None:
        self.assertEqual(
            tags_to_dict([{"Key": "Project", "Value": "op-deckbuilder"}]),
            {"Project": "op-deckbuilder"},
        )

    def test_ownership_requires_excelsior_signal(self) -> None:
        self.assertTrue(has_project_ownership([{"Key": "Project", "Value": "Excelsior"}]))
        self.assertTrue(has_project_ownership(None, "op-deckbuilder-app"))
        self.assertFalse(has_project_ownership([{"Key": "Project", "Value": "another-app"}]))

    def test_service_filter_excludes_unrelated_services(self) -> None:
        self.assertTrue(is_relevant_service("Amazon Elastic Container Registry (ECR)"))
        self.assertTrue(is_relevant_service("EC2 Container Registry (ECR)"))
        self.assertTrue(is_relevant_service("EC2 - Other"))
        self.assertFalse(is_relevant_service("Amazon WorkSpaces"))

    def test_month_window_includes_previous_month_and_today(self) -> None:
        self.assertEqual(
            previous_and_current_month_window(dt.date(2026, 8, 29)),
            ("2026-07-01", "2026-08-30"),
        )
        self.assertEqual(
            previous_and_current_month_window(dt.date(2026, 1, 1)),
            ("2025-12-01", "2026-01-02"),
        )

    def test_numeric_summary_drops_non_finite_values(self) -> None:
        summary = summarize_numbers([2.0, math.nan, 4.0])
        self.assertEqual(summary["samples"], 2)
        self.assertEqual(summary["minimum"], 2.0)
        self.assertEqual(summary["maximum"], 4.0)
        self.assertEqual(summary["mean"], 3.0)

    def test_error_is_bounded_and_single_line(self) -> None:
        value = redact_error("first\nsecond " + "x" * 600)
        self.assertNotIn("\n", value)
        self.assertLessEqual(len(value), 500)


if __name__ == "__main__":
    unittest.main()
