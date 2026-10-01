#!/usr/bin/env python3
"""Export the Funding Finder workbook to website-ready JSON."""

from __future__ import annotations

import json
import re
from datetime import date, datetime
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / "Funding_Finder_for_Statistics_FFS.xlsx"
OUTPUT = ROOT / "data" / "funding-opportunities.json"


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:80]


def deadline_fields(value: object) -> tuple[str, str, str, str]:
    if isinstance(value, (pd.Timestamp, datetime)):
        date = pd.Timestamp(value)
        return date.strftime("%-d %b %Y"), date.strftime("%Y-%m-%d"), "exact", ""

    text = str(value).strip()
    if text.lower() == "no closing date":
        return text, "9999-12-31", "rolling", "Rolling"

    parsed = pd.to_datetime(text, format="%b %Y", errors="coerce")
    if pd.notna(parsed):
        return text, parsed.strftime("%Y-%m-%d"), "month", "Expected"

    return text, "9999-12-31", "text", ""


def clean(value: object) -> str:
    return "" if pd.isna(value) else str(value).strip()


def main() -> None:
    data = pd.read_excel(WORKBOOK, sheet_name="Funding opportunities")
    guide = pd.read_excel(WORKBOOK, sheet_name="Guide & sources", header=None)
    last_reviewed = clean(guide.loc[guide[0].eq("Last reviewed"), 1].iloc[0])

    records = []
    for index, row in data.iterrows():
        display, sort_key, kind, note = deadline_fields(row["Deadline"])
        status_setting = clean(row.get("Status setting", row["Status"]))
        status = status_setting
        if kind == "exact" and pd.Timestamp(row["Deadline"]).date() < date.today():
            status = "DEADLINE PASSED"
        records.append(
            {
                "id": f"{slugify(clean(row['Opportunity']))}-{index + 1}",
                "status": status,
                "deadline_display": display,
                "deadline_sort": sort_key,
                "deadline_kind": kind,
                "deadline_note": note,
                "funder": clean(row["Funder"]),
                "opportunity": clean(row["Opportunity"]),
                "type": clean(row["Type"]),
                "funding_duration": clean(row["Funding / duration"]),
                "eligibility": clean(row["Who can apply / key restriction"]),
                "statistics_relevance": clean(row["Why relevant to Statistics"]),
                "theme_tags": clean(row["Theme tags"]),
                "internal_note": clean(row["Internal action / note"]),
                "source": clean(row["Source"]),
            }
        )

    records.sort(key=lambda item: (item["deadline_sort"], item["opportunity"]))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps({"last_reviewed": last_reviewed, "opportunities": records}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Exported {len(records)} opportunities to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
