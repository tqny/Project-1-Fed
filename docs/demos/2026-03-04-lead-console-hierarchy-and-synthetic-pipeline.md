# Demo Log

- Date: 2026-03-04
- Topic: Synthetic Lead Pipeline + Multi-Page Lead Ops Console
- Audience: Hiring managers, GTM leaders, technical reviewers
- Presenter: tqny

## What was shown
- Pages/routes demonstrated:
  - `/opportunities` (visual operations dashboard)
  - `/opportunities/policy`
  - `/opportunities/problem`
  - `/opportunities/architecture`
  - `/opportunities/agent-workflow`
  - `/opportunities/github-evidence`
  - `/opportunities/[id]` (lead detail rationale/provenance)
- Core workflow demonstrated:
  - Generate synthetic lead batch
  - Run sorting agent
  - Review ranked queue, grade mix, and top handoff
  - Drill into lead-level rationale and field provenance

## Reproduction steps
1. Start app (`npm run dev`) and open `/opportunities`.
2. Choose batch size and click `Generate Leads`.
3. Click `Run Sorting Agent`.
4. Review charts/KPIs, ranked pipeline, and handoff panel.
5. Open one lead detail and inspect rationale/provenance.

## Expected behavior
- Refresh summary counts:
  - Generation run reports mixed grade distribution.
  - Sorting run reports queued vs discarded counts.
- Scoring breakdown visibility:
  - Deterministic component scores and reasons are visible on detail page.
- Brief rendering behavior:
  - Lead detail emphasizes rationale/provenance and queue state (no fabricated contract claims).

## Outcomes
- What worked:
  - Deterministic generation/scoring/sorting pipeline end-to-end.
  - Clear IA separation between dashboard operations and policy/narrative pages.
  - Evidence page surfaces governance/evidence artifacts in-app.
- What did not:
  - Dev runtime saw intermittent stale chunk error (`Cannot find module '/331.js'`) requiring dev server restart/cache reset.

## Follow-ups
- Immediate fixes:
  - Keep fallback style hardening in place and restart dev on stale chunk occurrence.
- Deferred items (v0.2+):
  - Add live/synthetic mode switch.
  - Add scheduled automation and export pathways.
