# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Evidence-first repository foundation:
  - `docs/worklog/`, `docs/adr/`, `docs/demos/`, `docs/metrics/`, `docs/postmortems/`
  - CI evidence workflow and local evidence validator script
  - PR template enforcing evidence and validation reporting
- Next.js + TypeScript application skeleton for v0.1
- Prisma + SQLite data model for `Opportunity`
- SAM.gov connector with defensive normalization and NAICS/WA best-effort filtering
- USAspending connector with agency context lookup and spend-context best-effort handling
- Deterministic, explainable scoring engine with weighted breakdown reasons
- Structured brief generation module with LLM abstraction and safe stub fallback
- `/opportunities` ranked pipeline page with refresh action and filters
- `/opportunities/[id]` detail page with score explanation and brief rendering
- `scripts/init-db.sh` for reliable local Prisma bootstrap
- `RefreshRun` persistence model to audit manual refresh execution history
- Demo log: `docs/demos/2026-03-03-refresh-pipeline-live-run.md`
- ADR: `docs/adr/0002-sam-query-fallback-and-manual-refresh-ops.md`
- Design wardrobe system assets under `design-system/`:
  - `manifest.json`, `active-bucket.json`, and all bucket packages
  - `themes.css` that imports all bucket token styles
- Outfit command manager `scripts/outfit-manager.mjs` with command support:
  - `list outfits`
  - `switch to next one`
  - `switch to previous one`
  - `switch to idea-0X`

### Changed
- Expanded README into portfolio-grade product documentation:
  - problem framing
  - architecture and data flow
  - scoring philosophy
  - agent workflow
  - repository signaling standards
- Corrected SQLite path to `file:./dev.db` for Prisma schema-relative resolution
- SAM connector now includes mandatory `postedTo` and has fallback query behavior when strict NAICS query returns zero records
- Refresh pipeline now returns `runId` and persists final run status/counts/errors
- `/opportunities` operator UX now includes:
  - latest run status badge and run-id summary
  - collapsible last-run error drilldown with SAM next-access hint parsing
  - explicit empty-state guidance and clear-filters action
  - WA relevance and opportunity status columns in pipeline table
- Refresh button now shows run-id summary and collapsible error details after each run
- Root layout now applies active theme class from `design-system/active-bucket.json`
- App styling migrated to bucket-token driven variables and utility classes

### Security
- Added explicit no-secrets posture:
  - `.env` ignored
  - `.env.example` provided for local setup
