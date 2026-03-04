# Agent Context: Soft Pastel Commerce

## Bucket

- ID: `idea-03`
- Name: Soft Pastel Commerce
- Style family: light-soft
- Best for: orders dashboards, customer portals, friendly admin tools

## Rules

- Use only theme variables from `tokens.css` for colors, radius, shadows, spacing, and type scale.
- Do not hardcode hex values in feature components.
- Keep component behavior aligned to this bucket's interaction model.
- Preserve responsive and accessibility requirements from `bucket.json`.

## Developer Brief

# Idea 03 Developer Brief

## Experience Goal
Create a clean, friendly operations dashboard that feels approachable for everyday business users. The design should be easy to scan and low-friction for routine order tracking.

## Composition Priorities
1. Clear title and date context.
2. Quick summary cards with soft category color-coding.
3. Order state tabs as primary workflow switch.
4. Readable orders table as core working area.

## Visual Rules
- Light backgrounds with restrained pastel accents.
- Purple is the only strong accent for navigation/selection.
- Generous whitespace and soft radius values.
- Keep iconography simple and low-contrast unless active.

## Responsive Strategy
- Desktop keeps sidebar + full table.
- Tablet narrows sidebar and limits table columns.
- Mobile promotes summary cards + tabbed list cards.

## Dark Mode Behavior
Light-first style. Dark mode should preserve friendly feel using deep slate surfaces and softened pastel equivalents.

## Minimum Token Set
- `color`: neutral light scale + purple accent + pastel card variants
- `spacing`: 4-based spacious scale
- `radius`: 8/12/16/20
- `motion`: short opacity/tint transitions

## Implementation Checklist
- [ ] Sidebar active state uses accent token only
- [ ] Summary cards are variant-driven components
- [ ] Tabs use proper semantic roles and keyboard behavior
- [ ] Status indicators map to semantic tokens
- [ ] Table has usable mobile fallback layout

## Implementation Brief

# Idea 03 Implementation Brief

## Context Block (edit only this for each project)

```text
Project: [PROJECT_NAME]
Route: [ROUTE]
Domain: [DOMAIN]
Primary user outcome: [OUTCOME]
```

## Build Instructions
Implement a light-first dashboard in the "Soft Pastel Commerce" style using `design-criteria.jsonc`.

Required:
- Responsive sidebar/dashboard layout
- Light mode as default, dark mode supported
- Tokenized pastel card variants and status colors
- Reusable summary card, tab switcher, and table row components
- No magic strings for design values

## Required Sections
- Left navigation with active route emphasis
- Header with date/search/actions
- Three summary cards
- Order status tab strip
- Orders data table (desktop) + stacked fallback (mobile)

## Engineering Constraints
- Keep all color usage semantic (no direct hex in view components).
- Build status badge component with token-driven variants.
- Use typed column definitions and row model for order table.
- Include loading/empty/error views for table and summary strip.

## Done Criteria
- Friendly visual tone preserved across breakpoints
- Pastel accents remain subtle and legible
- Dark mode maintains hierarchy and readability
- Focus/keyboard behavior passes baseline accessibility checks
