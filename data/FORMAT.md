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
currency,variant,period,index_value,source,series_id,verified,baseline_period
```
- `variant` is `NEER` or `REER`. **Never combine variants.**
- `period` is `YYYY-MM-DD` for daily observations or `YYYY-MM` for monthly observations.
- At least two distinct periods per currency/variant for a trend; the **explicit `baseline_period` observation** is treated as the index baseline, whether it is the first or last period. The baseline observation must exist in the uploaded series, or the application rejects the file. For NEER, select the latest daily observation demonstrably published by 2026-10-19 09:00 KST (which may predate 2026-10-19); for REER, the baseline must be an earlier month (`2026-09` or earlier), with documented evidence that the selected monthly release was available at the reference instant. The application checks period syntax and presence, but it cannot independently prove the release date. Record the exact selected baseline observation date, its release/publication timestamp, BIS series identifier, index value, and supporting source separately. Never infer publication date from observation date.
- `index_value` is a positive finite number. `source` and `series_id` must identify the BIS source/series.
- Data revisions, index direction, release date and source retrieval date should be recorded in a separate reproducibility log before publication.
- **Monthly REER has no intraday 09:00 value.** An October 2026 REER observation is ex-post, not information available at 09:00 on October 19. Historical observations before the baseline period are converted by the same ratio formula; a historical index value does not establish an independent absolute currency value.

## Caveats / 한계
- FX is a time-specific market quote, while NEER may be daily and REER monthly.
- The index-derived V value is **not** a market exchange rate, an absolute value, or a validated universal numeraire.
- Different BIS trade baskets and weights can cause inconsistent implied cross rates.
- Synthetic demo values must never be used to support economic conclusions.
- Review calculations and evidence in GitHub Issues/Discussions before any public claim.
