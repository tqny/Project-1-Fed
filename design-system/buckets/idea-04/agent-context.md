# Agent Context: Tactical Service Planner

## Bucket

- ID: `idea-04`
- Name: Tactical Service Planner
- Style family: dark-enterprise
- Best for: scheduling systems, service operations, B2B control panels

## Rules

- Use only theme variables from `tokens.css` for colors, radius, shadows, spacing, and type scale.
- Do not hardcode hex values in feature components.
- Keep component behavior aligned to this bucket's interaction model.
- Preserve responsive and accessibility requirements from `bucket.json`.

## Developer Brief

# Idea 04 Developer Brief

## Experience Goal
Build a serious enterprise scheduling workspace for operational teams. Users should be able to scan workload, inspect profile context, and leave structured notes without leaving the screen.

## Composition Priorities
1. Calendar/schedule board as central decision surface.
2. Context pane (profile, skills, certifications) for assignment confidence.
3. Notes and activity pane for collaboration and audit trail.
4. Stable left navigation with clear active routing.

## Visual Rules
- Layered dark panels to separate functional zones.
- Blue = primary action/selection; red = critical/active route; purple/yellow = secondary statuses.
- Compact typography and strong alignment discipline.
- Limited visual effects, high functional clarity.

## Responsive Strategy
- Desktop: tri-pane layout.
- Tablet: collapse context pane; keep calendar primary.
- Mobile: shift from full grid calendar to agenda-style stacked schedule.

## Dark Mode Behavior
Dark-first style intended for continuous work sessions. If light mode is added, keep status semantics and information hierarchy unchanged.

## Minimum Token Set
- `color`: deep neutral ramp + semantic status accents
- `spacing`: dense operational spacing
- `radius`: restrained rounded corners
- `motion`: controlled transitions only

## Implementation Checklist
- [ ] Calendar supports keyboard navigation and announced selection
- [ ] Status colors are semantic tokens, not hardcoded
- [ ] Notes composer is componentized and reusable
- [ ] Pane collapse behavior works across breakpoints
- [ ] Activity feed has loading/empty/error states

## Implementation Brief

# Idea 04 Implementation Brief

## Context Block (edit only this for each project)

```text
Project: [PROJECT_NAME]
Route: [ROUTE]
Domain: [DOMAIN]
Primary user outcome: [OUTCOME]
```

## Build Instructions
Implement a multi-pane service operations UI in the "Tactical Service Planner" style using `design-criteria.jsonc`.

Required:
- Responsive tri-pane architecture with graceful pane collapse
- Dark-first token system and optional light mapping
- Reusable calendar board, profile pane sections, and notes composer
- Strictly tokenized styling; no magic strings

## Required Sections
- Left navigation rail with active route indicator
- Context/profile pane with chips and docs
- Calendar board with day cells and assignment blocks
- Notes editor and activity feed

## Engineering Constraints
- Calendar must be data-driven and componentized.
- Use semantic status enums mapped to tokenized colors.
- Keep breakpoints and pane-collapse logic centralized.
- Implement accessibility for keyboard calendar traversal and focus order.

## Done Criteria
- Dense content remains readable and navigable
- Calendar interactions are stable and predictable
- Status semantics remain consistent everywhere
- Accessibility behavior is validated in dense UI regions
