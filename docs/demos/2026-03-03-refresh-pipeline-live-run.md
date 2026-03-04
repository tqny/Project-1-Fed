# Demo Log - Refresh Pipeline Live Run

- Date: 2026-03-03
- Topic: Manual refresh pipeline behavior with live SAM key
- Audience: Hiring manager / GTM ops reviewer / technical screener
- Presenter: Project owner

## What was shown
- Pages/routes demonstrated: `/opportunities`, `/api/refresh`, `/opportunities/[id]`
- Core workflow demonstrated:
  - Manual refresh invocation from UI and backend route.
  - Live SAM fetch behavior including strict-query fallback behavior.
  - Upsert + scoring + brief persistence path.
  - Latest refresh run telemetry surfaced in UI.

## Reproduction steps
1. Initialize local DB and Prisma artifacts:
   - `./scripts/init-db.sh`
2. Ensure `.env` has a valid `SAM_API_KEY`.
3. Start the app: `npm run dev`.
4. Open `http://localhost:3000/opportunities`.
5. Click **Refresh Opportunities**.
6. Observe summary counters and latest run status panel.

## Expected behavior
- Refresh summary counts are returned in API/UI payload.
- Deterministic scores and brief objects are stored for refreshed opportunities.
- If SAM rate limit is hit, run records `failed` with explicit provider error and next access hint.

## Outcomes
- What worked:
  - End-to-end refresh succeeded in a live run with non-zero ingestion:
    - fetched: 50
    - upserted: 50
    - scored: 50
    - briefed: 50
    - errors: 0
  - UI displayed latest run telemetry from persisted `RefreshRun` data.
- What did not:
  - SAM strict NAICS query returned `0` results for target NAICS in tested windows.
  - Later requests were throttled (`429`) with next access time from provider.

## Follow-ups
- Immediate fixes:
  - Added strict-query fallback behavior in SAM connector.
  - Added run-level status/error persistence for auditable operations.
- Deferred items (v0.2+):
  - automated scheduler with quota-aware backoff
  - stronger enrichment depth and connector contract tests
