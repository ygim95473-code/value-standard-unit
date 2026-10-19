#!/usr/bin/env python3
"""Archive official ECB daily reference exchange-rate observations; no V calculation."""
import csv
import hashlib
import io
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

URL = "https://data-api.ecb.europa.eu/service/data/EXR/D.USD+KRW+JPY+CNY.EUR.SP00.A?format=csvdata"
CURRENCIES = {"USD", "KRW", "JPY", "CNY"}
ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "data" / "raw" / "fx" / "ecb"
MAX_BYTES = 8_000_000

def main():
    req = Request(URL, headers={"User-Agent": "value-standard-unit-research/0.2", "Accept": "text/csv"})
    with urlopen(req, timeout=35) as resp:
        content = resp.read(MAX_BYTES + 1)
        if len(content) > MAX_BYTES:
            raise ValueError("ECB response exceeded safety limit")
        ctype = resp.headers.get("Content-Type", "")
        if "html" in ctype.lower():
            raise ValueError("ECB returned HTML, not CSV")
    decoded = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames or not {"TIME_PERIOD", "OBS_VALUE"}.issubset(reader.fieldnames):
        raise ValueError(f"Unexpected ECB CSV columns: {reader.fieldnames}")
    currency_column = next((c for c in ("CURRENCY", "currency") if c in reader.fieldnames), None)
    if not currency_column:
        raise ValueError("ECB currency column absent")
    observations = {}
    for row in reader:
        currency = (row.get(currency_column) or "").strip()
        period = (row.get("TIME_PERIOD") or "").strip()
        value = (row.get("OBS_VALUE") or "").strip()
        if currency not in CURRENCIES or not period or not value:
            continue
        try:
            date = datetime.strptime(period, "%Y-%m-%d").date()
            number = float(value)
        except (ValueError, OverflowError):
            raise ValueError("Invalid ECB observation")
        if number <= 0 or not number < float("inf"):
            raise ValueError("Nonpositive or infinite ECB rate")
        if date > datetime.now(timezone.utc).date():
            raise ValueError("Future observation from ECB")
        observations[(period, currency)] = {"date": period, "currency": currency, "units_per_eur": number}
    if not observations:
        raise ValueError("No usable ECB observations")
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    new_count = 0
    # Daily publication snapshots, not overwrite: revisions retained by hash.
    by_date = {}
    for (date, currency), observation in sorted(observations.items()):
        by_date.setdefault(date, []).append(observation)
    for date, records in sorted(by_date.items()):
        canonical = json.dumps(records, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        digest = hashlib.sha256(canonical.encode()).hexdigest()[:16]
        path = ARCHIVE / date[:4] / f"{date}-{digest}.json"
        if path.exists():
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "provider": "European Central Bank", "dataset": "EXR",
            "source_url": URL, "observation_date": date,
            "quote_convention": "currency units per 1 EUR",
            "retrieved_at_utc": datetime.now(timezone.utc).isoformat(),
            "content_sha256": hashlib.sha256(canonical.encode()).hexdigest(),
            "observations": records,
            "note": "ECB reference rates are not intraday spot quotes or V values; publication and market calendars differ.",
        }
        path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        new_count += 1
    print(f"ECB dates={len(by_date)}, new archive snapshots={new_count}")
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write(f"ECB observation dates: {len(by_date)}; new snapshots: {new_count}\n")

if __name__ == "__main__":
    main()
