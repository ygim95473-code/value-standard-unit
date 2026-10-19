#!/usr/bin/env python3
"""Build a compact public ECB FX dashboard feed from archived immutable snapshots."""
import json
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/raw/fx/ecb"
DEST = ROOT / "data/public/ecb-fx-latest.json"
LIMIT = 180

def main():
    snapshots = {}
    for path in SOURCE.glob("*/*.json"):
        try:
            obj = json.loads(path.read_text(encoding="utf-8"))
            d = obj["observation_date"]
            date.fromisoformat(d)
            records = obj["observations"]
            if not isinstance(records, list) or not records:
                continue
            # Latest retrieval snapshot wins when a source observation is revised.
            if d not in snapshots or obj["retrieved_at_utc"] > snapshots[d]["retrieved_at_utc"]:
                snapshots[d] = obj
        except (ValueError, KeyError, TypeError):
            continue
    if not snapshots:
        raise ValueError("No valid archived ECB observations")
    rows = []
    for d in sorted(snapshots)[-LIMIT:]:
        obj = snapshots[d]
        rates = {r["currency"]: r["units_per_eur"] for r in obj["observations"] if r["currency"] in ("USD","KRW","JPY","CNY")}
        if not all(k in rates for k in ("USD","KRW","JPY","CNY")):
            continue
        rows.append({"date": d, "rates_per_eur": rates, "retrieved_at_utc": obj["retrieved_at_utc"]})
    if not rows:
        raise ValueError("No dates with all four currencies")
    payload = {
        "dataset": "ECB reference exchange rates", "source_url": "https://data-api.ecb.europa.eu/service/data/EXR/D.USD+KRW+JPY+CNY.EUR.SP00.A?format=csvdata",
        "quote_convention": "currency units per 1 EUR",
        "observation_count": len(rows),
        "notice": "Historical ECB daily reference rates, not BIS, V values, live quotes or the 2026-10-19 09:00 KST reference quote.",
        "rows": rows,
    }
    DEST.parent.mkdir(parents=True, exist_ok=True)
    DEST.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Published {len(rows)} ECB observation dates to {DEST.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
