# ECB reference FX archive

Workflow: `.github/workflows/archive-ecb-fx.yml` (weekdays, 17:25 UTC; scheduled GitHub Actions may be delayed or skipped). Manual trigger: Actions > Archive ECB FX observations > Run workflow.

Source: [ECB SDMX EXR API](https://data-api.ecb.europa.eu/service/data/EXR/D.USD+KRW+JPY+CNY.EUR.SP00.A?format=csvdata).

Stores dated JSON snapshots containing ECB reference rates quoted as **currency units per EUR**. A snapshot's file name includes a content hash so a changed published observation can be retained without silently overwriting prior records. Retrieval time and observation date are different. Files are public and the archive may grow over time.

**Limitations:** ECB daily reference rates are not 2026-10-19 09:00 KST spot FX quotes. The 2026-10-19 reference timestamp is not established by this collector. This archive does **not** calculate V, ingest BIS NEER/REER, or prove that an automated run succeeded. Confirm Actions execution and actual committed JSON snapshots before describing collection as operational. Keep off-repository backups.
