# Agent Context: Lime Fintech Operations

## Bucket

- ID: `idea-02`
- Name: Lime Fintech Operations
- Style family: dark-data-dense
- Best for: fintech dashboards, ops consoles, transaction-heavy UIs

## Rules

- Use only theme variables from `tokens.css` for colors, radius, shadows, spacing, and type scale.
- Do not hardcode hex values in feature components.
- Keep component behavior aligned to this bucket's interaction model.
- Preserve responsive and accessibility requirements from `bucket.json`.

## Developer Brief

# Idea 02 Developer Brief

## Experience Goal
Deliver a high-density financial operations dashboard with clear information hierarchy and fast scanning. The interface should feel efficient, not decorative.

## Composition Priorities
1. Persistent navigation and search.
2. KPI strip and high-signal metrics.
3. Mid-level analysis widgets (limits + chart).
4. Dense transaction table for operational work.

## Visual Rules
- Neutral dark scaffold with sharp module separation.
- Lime accent reserved for key highlights and selected data points.
- Tight spacing and small typography with disciplined alignment.
- Card corners slightly rounded; not soft consumer-style rounding.

## Responsive Strategy
- Desktop keeps multi-column analytical layout.
- Tablet collapses secondary controls and reduces table columns.
- Mobile prioritizes KPI cards and chart; transaction list becomes card stack.

## Dark Mode Behavior
Dark mode is default. If light mode is introduced, preserve emphasis logic: only high-priority data gets accent treatment.

## Minimum Token Set
- `color`: dark neutrals + lime accent + status set
- `spacing`: dense 4-based scale
- `radius`: 6/10/14/18
- `motion`: fast state transitions

## Implementation Checklist
- [ ] Accent color usage capped to key highlights
- [ ] Sidebar and table components reusable
- [ ] Chart can switch line/bar style without rewrites
- [ ] Keyboard/screen-reader support for table interactions
- [ ] Loading/empty/error states implemented in every data module

## Implementation Brief

# Idea 02 Implementation Brief

## Context Block (edit only this for each project)

```text
Project: [PROJECT_NAME]
Route: [ROUTE]
Domain: [DOMAIN]
Primary user outcome: [OUTCOME]
```

## Build Instructions
Implement a dense operations dashboard in the "Lime Fintech Operations" style using `design-criteria.jsonc`.

Required:
- Responsive shell with desktop sidebar and mobile drawer
- Dark-mode capable with strict token usage
- Reusable KPI cards, chart panels, and transaction table components
- No hardcoded design literals in feature components

## Required Sections
- Left navigation with grouped menu sections
- Top controls/search/action bar
- KPI cards row
- Spending-limits widget
- Primary chart widget
- Transaction table with filters

## Engineering Constraints
- Use typed data models for metrics and rows.
- Keep chart config separate from chart rendering component.
- Extract all status-chip styling to token-driven variant config.
- Keep table responsive strategy in a dedicated adapter layer.

## Done Criteria
- Reads clearly at high density without visual noise
- Accent applied only to emphasized metrics/events
- Mobile version retains essential operations flow
- Accessibility and focus states verified
