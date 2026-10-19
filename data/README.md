# V Experiment Data Archive (v0.2 design)

This directory defines the long-term recordkeeping rules for the Value Standard Unit (V) experiment. **This is a storage specification, not evidence that automatic collection is already running.**

## Reference and scope
- Reference instant: **2026-10-19 09:00:00 KST** = **2026-10-19T00:00:00Z**.
- Initial scale: **1 V = 1 KRW at the reference instant only**, not a permanent KRW peg.
- Initial currencies: KRW, USD, EUR, JPY, CNY.
- NEER-V and REER-V are distinct experimental series. BIS effective exchange rate indices measure relative currency strength, not intrinsic or absolute value. Derived V ratios need not equal spot cross rates.

## Planned directories
- `data/raw/fx/`: raw source FX observations and quote metadata (including source, URL, observed time, retrieved time, quote type, timezone).
- `data/raw/bis/`: raw BIS series releases with publication/vintage information and retrieval time.
- `data/derived/`: calculated V observations, source references, calculation version and validation status.
- `data/audit/`: corrections, revisions, calculation methodology changes and failed validation records.
- `data/backups/`: backup manifests only; independent backups should be held outside this repository.

## Non-negotiable rules
1. Never invent missing quotes, values, dates, or source verification.
2. Preserve raw source snapshots and original retrieval metadata. A later correction creates a new version rather than silently replacing old observations.
3. Distinguish observation period, publication date, retrieval date, and calculation date. A monthly REER release is **not** a 09:00 KST instant observation.
4. Do not label synthetic demonstration data as actual market or BIS data.
5. Mark missing or unverified inputs explicitly and suppress misleading calculated results.
6. Include source, series identifier, timestamp convention, code/method version, and data vintage with each derived output.
7. Retain experiment and comparison series separately; DXY, spot FX and economic indicators are external comparisons, not direct substitutes for BIS NEER/REER.
8. GitHub history alone is not an independent backup. Establish periodic off-repository backup and test restoration.

## Automation status
- Scheduled collection: **not implemented**.
- Automated calculation: **not implemented**.
- Automated backup: **not implemented**.
- Data availability and licensing checks: **pending**.

The archive will only be called operational after a real-source ingestion, reproducibility and persistence test succeeds.
