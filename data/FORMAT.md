# V 0.1 — data format / 자료 형식

The application processes **two local CSV files**. Neither is uploaded to a server. The example button generates **synthetic data for interface testing only**, never a published V result.

## 1. Baseline FX CSV
Header (required, exact):
```csv
currency,krw_per_unit,quote_time_utc,source,source_url,quote_type,verified
```
- One row each for KRW, USD, EUR, JPY, CNY (partial coverage is accepted and flagged).
- `krw_per_unit` is the number of KRW for **one unit** of the listed currency, not 100 JPY. Positive finite number.
- KRW must be exactly 1 by convention.
- `quote_time_utc`: full ISO timestamp, e.g. `2026-10-19T00:00:00Z`; actual timestamp of observed quote, **not** a fabricated timestamp.
- `source`, `source_url`: traceable provenance; `quote_type`: mid/bid/ask/close or other explained convention.
- `verified`: `true` or `false`. This field represents the contributor's declaration, **not** independent verification.
- If an exact 09:00 KST quote is unavailable, include the actual timestamp and explain the selection rule. The dashboard warns about differences.

## 2. BIS index CSV
Header (required, exact):
```csv
currency,variant,period,index_value,source,series_id,verified
```
- `variant` is `NEER` or `REER`. **Never combine variants.**
- `period` is `YYYY-MM-DD` for daily observations or `YYYY-MM` for monthly observations.
- At least two distinct periods per currency/variant for a trend; the **first row by period** is treated as the index baseline. **IMPORTANT:** this is an experimental simplification. For a legitimate run, the earliest period must be the explicitly documented baseline period (NEER daily 2026-10-19 if available; REER monthly 2026-10 or a clearly labeled latest previously published month). The dashboard flags incompatible or missing baseline periods. Never silently treat an arbitrary first observation as October 19.
- `index_value` is a positive finite number. `source` and `series_id` must identify the BIS source/series.
- Data revisions, index direction, release date and source retrieval date should be recorded in a separate reproducibility log before publication.
- **Monthly REER has no intraday 09:00 value.** An October 2026 REER observation is ex-post, not information available at 09:00 on October 19.

## Caveats / 한계
- FX is a time-specific market quote, while NEER may be daily and REER monthly.
- The index-derived V value is **not** a market exchange rate, an absolute value, or a validated universal numeraire.
- Different BIS trade baskets and weights can cause inconsistent implied cross rates.
- Synthetic demo values must never be used to support economic conclusions.
- Review calculations and evidence in GitHub Issues/Discussions before any public claim.
