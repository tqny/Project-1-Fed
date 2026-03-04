# Federal Opportunity Intelligence Platform (v0.1)

Portfolio-grade internal-style GTM system:

> "How I would operationalize federal opportunity intelligence for an AI compliance SaaS company."

## Problem Statement
Federal opportunities are high-volume and noisy. A GTM team needs a practical way to:
- ingest current federal opportunities quickly
- rank them using explicit business logic
- generate consistent discovery-ready briefs
- keep an auditable trail of decisions and delivery evidence

## Product Perspective
This v0.1 slice is intentionally scoped to one product archetype:
- **AI Compliance & Workflow Automation Platform for regulated environments**

The system is not generic scraping. It uses an explicit `ProductProfile` (`config/productProfile.ts`) with:
- target NAICS
- positive/negative keywords
- score dimension weights

## Architecture Overview
- **Frontend:** Next.js App Router pages for ranked pipeline + detail drill-down
- **Data:** SQLite via Prisma (`Opportunity` table)
- **Connectors:** SAM.gov opportunities + USAspending agency context
- **Core logic:** deterministic scoring and structured brief generation
- **Ops mode:** evidence-first with daily worklogs and repository checks

Pipeline (`POST /api/refresh`):
1. Fetch opportunities from SAM.gov.
2. Normalize and upsert by `sourceId`.
3. Enrich by agency from USAspending.
4. Score deterministically with explainable reasons.
5. Generate structured brief (LLM or stub fallback).
6. Return run counts + errors without full-run crash on partial failures.

## Data Sources
- **SAM.gov Get Opportunities Public API** (primary opportunity feed)
- **USAspending API** (agency spend context)

Connectors are defensive because source fields can change. If fields drift, the app logs mismatches instead of silently guessing.

## Scoring Model Philosophy
The model is intentionally transparent:
- deterministic weights (`fit`, `timing`, `signal`, `complexity`)
- explicit rule-based boosts/penalties (NAICS overlap, keyword hits, timing, spend context)
- human-readable reasons persisted and rendered in UI

This project avoids opaque black-box ranking in v0.1.

## Agent Workflow
Operational cycle for each refresh:
1. Pull + normalize fresh opportunities.
2. Attach enrichment context.
3. Recompute scores and breakdown reasons.
4. Generate structured opportunity brief JSON.
5. Review ranked list, then inspect detail pages for decision support.

If LLM credentials are not configured, brief generation falls back to a non-crashing stub.

## Repository Signaling & Engineering Hygiene
This repository is a hiring artifact. It is maintained to read like a real internal product:
- evidence-first documentation (`docs/worklog`, demo logs, ADRs, changelog)
- reproducibility (setup and demo instructions)
- auditable architecture decisions (`docs/adr/`)
- no secrets in git (`.env` ignored, sample env only)

Commit protocol:
- do local development during the day
- update worklog continuously
- commit/push only on explicit daily close with validation evidence

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env and set keys:
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client and apply schema:
   ```bash
   ./scripts/init-db.sh
   ```
4. Start app:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000/opportunities](http://localhost:3000/opportunities)

## Validation
```bash
npm run lint
npm run test
npm run build
./scripts/check-evidence.sh
```

## Demo Reproduction (v0.1)
1. Start the app and open `/opportunities`.
2. Click **Refresh Opportunities**.
3. Confirm summary counts (`fetched`, `upserted`, `enriched`, `scored`, `briefed`).
4. Open any opportunity detail page and verify:
   - score sub-dimensions + reasons
   - structured brief sections
   - raw description is collapsible
