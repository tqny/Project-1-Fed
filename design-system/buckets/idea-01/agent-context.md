# Agent Context: Nocturne Minimal Analytics

## Bucket

- ID: `idea-01`
- Name: Nocturne Minimal Analytics
- Style family: dark-minimal
- Best for: single-focus dashboard, report cards, executive snapshots

## Rules

- Use only theme variables from `tokens.css` for colors, radius, shadows, spacing, and type scale.
- Do not hardcode hex values in feature components.
- Keep component behavior aligned to this bucket's interaction model.
- Preserve responsive and accessibility requirements from `bucket.json`.

## Developer Brief

# Idea 01 Developer Brief

## Experience Goal
Create a compact, premium analytics experience that feels calm and deliberate. The UI should direct attention to one chart and one actionable report list without visual clutter.

## Composition Priorities
1. Header utilities and breadcrumb at low emphasis.
2. Sales chart as primary attention anchor.
3. Report list rows as secondary actionable layer.
4. Single CTA at the bottom-right for clear next action.

## Visual Rules
- Dark surfaces with subtle elevation steps.
- One dominant accent (violet) for selected states and key interactions.
- Quiet neutral typography with small label sizing.
- Rounded shapes and thin strokes only.

## Responsive Strategy
- Desktop: centered panel with fixed rhythm and chart labels visible.
- Tablet: compress side paddings and simplify chart labels.
- Mobile: stack controls and convert report rows into touch-friendly cards.

## Dark Mode Behavior
This style is dark-first. For optional light mode, keep hierarchy identical and preserve violet accent usage for selected states.

## Minimum Token Set
- `color`: bg/surface/border/text/accent/success/warning/danger
- `radius`: sm/md/lg/pill
- `spacing`: 4-based scale
- `motion`: fast/normal + standard easing

## Implementation Checklist
- [ ] Chart grid and tooltip match low-noise style
- [ ] No hardcoded hex values in page components
- [ ] Avatar stack and filter pills are reusable components
- [ ] Focus rings visible on every interactive element
- [ ] Empty and loading states included for chart + report list

## Implementation Brief

# Idea 01 Implementation Brief

## Context Block (edit only this for each project)

```text
Project: [PROJECT_NAME]
Route: [ROUTE]
Domain: [DOMAIN]
Primary user outcome: [OUTCOME]
```

## Build Instructions
Implement the route in the "Nocturne Minimal Analytics" style using `design-criteria.jsonc`.

Required:
- Fully responsive from 360px to 1440px+
- Dark-mode capable (dark-first)
- Tokenized design values only (no magic strings)
- Shared primitive composition for buttons, pills, cards, inputs
- Maintainable structure with reusable sections

## Required Sections
- Top utility bar with breadcrumb and utility action
- Sales chart card with compare toggles and tooltip
- Report section with filter chips and row list
- Footer utility copy + primary CTA

## Engineering Constraints
- Put palette/spacing/radius/motion in central tokens.
- Keep chart styles in a dedicated chart-theme config.
- Avoid inline style literals except dynamic chart values.
- Include loading and empty states for data blocks.

## Done Criteria
- Visual hierarchy matches design criteria
- Contrast and keyboard focus pass accessibility checks
- All repeated patterns extracted to components
