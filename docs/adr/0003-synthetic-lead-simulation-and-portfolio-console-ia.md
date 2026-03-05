# ADR 0003: Synthetic Lead Simulation and Portfolio Console IA

- Status: Accepted
- Date: 2026-03-04

## Context
The initial v0.1 path focused on live federal opportunity ingestion and ranking. For portfolio signaling, the project also needs a stable, explainable, demo-ready lead workflow that is reproducible on demand without external API volatility or quota risk.

The project also needs clearer information architecture for hiring-manager readability:
- visual operations dashboard first
- policy/rules separated from operational screens
- explicit pages for problem framing, architecture, agent workflow, and evidence posture

## Decision
Adopt a synthetic-lead simulation layer for v0.1 demos while preserving deterministic scoring and explicit provenance/disclosure.

Implement:
- `Lead` and `LeadRun` persistence models for simulation runs and queue state
- generation + scoring + sorting pipeline with explainable reasons and grade bands
- clear synthetic-data disclosure in UI and stored rationale/provenance
- console IA split:
  - `Overview` (visual dashboard only)
  - `Policy & Guardrails`
  - `Problem`
  - `System Architecture`
  - `Agent Workflow`
  - `GitHub + Evidence`

## Consequences
- Positive:
  - Reliable, repeatable demo flow independent of external API uptime/quota.
  - Stronger portfolio narrative clarity for non-engineering reviewers.
  - Maintains explainability and auditability principles.
- Negative:
  - Introduces synthetic data that must be clearly labeled to avoid confusion.
  - Adds dual-path complexity versus a single live-data-only story.
- Follow-up:
  - Keep live SAM/USAspending path available for future production-like mode.
  - Consider a user-facing mode switch (live vs synthetic) in a later version.
