# ADR 0001: v0.1 Architecture and Decision Policy

- Status: Accepted
- Date: 2026-03-03

## Context
Project 1 is a public portfolio artifact intended to signal practical GTM systems engineering for enterprise-facing roles. The implementation must be credible as an internal tool, not a demo toy. Constraints:

- thin-slice scope with fast iteration
- explicit evidence discipline
- explainable ranking logic
- resilient handling of external API variability

## Decision
Adopt a single Next.js App Router application with modular core/connectors packages:

- `app/` for UI routes and API refresh endpoint
- `packages/connectors/` for external API boundaries (SAM.gov, USAspending)
- `packages/core/` for scoring and brief logic
- Prisma + SQLite for local persistence
- Evidence-first repository standards (worklog, changelog, demo logs, check script)

Scoring will be deterministic and rule-based with persisted reasons. LLM usage is restricted to structured brief generation and must degrade safely to a stub when keys are missing or requests fail.

## Consequences
- Positive:
  - Clear separation of concerns for maintainability
  - High auditability for scoring and prioritization logic
  - Better portfolio signal through explicit architecture and evidence trail
  - Lower operational risk from predictable non-LLM core ranking

- Negative:
  - Less flexibility than full multi-service architecture
  - Manual refresh only in v0.1 limits automation
  - Connector drift risk remains as public APIs evolve

- Follow-up:
  - Add connector contract tests with fixture snapshots
  - Add scheduled refresh and export integrations in v0.2+
