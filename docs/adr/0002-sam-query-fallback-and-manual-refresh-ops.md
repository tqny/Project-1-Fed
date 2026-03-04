# ADR 0002: SAM Query Fallback and Manual Refresh Operations

- Status: Accepted
- Date: 2026-03-03

## Context
Live testing showed SAM behavior that affects reliability:
- strict NAICS query combinations can return zero rows even when broad date-window queries return large result sets
- provider throttling (`429`) occurs and includes next-available access time

The project must remain practical and auditable for portfolio review while staying within v0.1 scope (manual refresh, no scheduler).

## Decision
1. Keep manual refresh as the official operational model for v0.1.
2. In SAM connector:
   - call strict query first (`postedFrom`, `postedTo`, `ncode`)
   - if zero rows and NAICS filter was used, retry with broader query and apply NAICS filtering locally
   - if still zero after local NAICS filter, return broad latest opportunities with explicit warning logs
3. Persist each refresh run (`RefreshRun`) with status, counts, and error details for auditability.

## Consequences
- Positive:
  - higher likelihood of non-empty, reviewable pipeline data in v0.1
  - explicit, inspectable operational telemetry for each run
  - improved resilience to provider query quirks without hidden failures
- Negative:
  - fallback may include broader records when strict NAICS returns empty
  - SAM quota throttling still blocks refresh attempts until provider window resets
- Follow-up:
  - add connector contract/fixture tests
  - add quota-aware scheduler and retry policy in v0.2+
