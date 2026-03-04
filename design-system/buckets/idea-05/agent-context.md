# Agent Context: Expedition Editorial Travel

## Bucket

- ID: `idea-05`
- Name: Expedition Editorial Travel
- Style family: marketing-editorial
- Best for: travel landing pages, consumer marketing, brand-forward discovery apps

## Rules

- Use only theme variables from `tokens.css` for colors, radius, shadows, spacing, and type scale.
- Do not hardcode hex values in feature components.
- Keep component behavior aligned to this bucket's interaction model.
- Preserve responsive and accessibility requirements from `bucket.json`.

## Developer Brief

# Idea 05 Developer Brief

## Experience Goal
Create a bold, conversion-focused travel interface that blends editorial storytelling with app-like interactivity. Users should immediately feel discovery energy while understanding clear next actions.

## Composition Priorities
1. Large hero headline and supporting value proposition.
2. Right-side mosaic cards communicating destinations, stats, and reviews.
3. Persistent quick actions for saved/map/feedback.
4. Strong CTA anchored in a highlighted content card.

## Visual Rules
- Near-black canvas with high-impact typography.
- Curated warm/cool card palette; each card variant has a purpose.
- Asymmetric grid for visual rhythm.
- Keep text concise and punchy.

## Responsive Strategy
- Desktop: split hero + mosaic board.
- Tablet: compressed split with fewer simultaneous card columns.
- Mobile: one-column narrative flow, with actions moved to bottom rail.

## Dark Mode Behavior
Dark-first brand style. If light mode is added, retain card variant semantics and headline emphasis.

## Minimum Token Set
- `color`: near-black base + explicit card variants + action accents
- `typography`: strong display scale
- `radius`: medium-large card radii
- `motion`: expressive but controlled reveal/hover transitions

## Implementation Checklist
- [ ] Hero typography scale remains dominant
- [ ] Mosaic cards are variant-driven and reusable
- [ ] Quick-action controls remain accessible on mobile
- [ ] CTA maintains contrast on light card surfaces
- [ ] Layout remains intentional after breakpoint collapse

## Implementation Brief

# Idea 05 Implementation Brief

## Context Block (edit only this for each project)

```text
Project: [PROJECT_NAME]
Route: [ROUTE]
Domain: [DOMAIN]
Primary user outcome: [OUTCOME]
```

## Build Instructions
Implement a brand-forward landing/marketing route in the "Expedition Editorial Travel" style using `design-criteria.jsonc`.

Required:
- Responsive split layout that degrades cleanly to one-column mobile flow
- Dark-first theme with tokenized color variants per card type
- Reusable hero block, mosaic card variants, and action rail components
- No magic strings for design primitives

## Required Sections
- Top navigation and utility action
- Left hero headline + supporting copy
- Right mosaic card board (feature card, stat card, review card)
- Floating side actions (desktop) and mobile action rail
- Primary destination CTA

## Engineering Constraints
- Centralize card variant tokens and style mapping.
- Keep layout algorithm for mosaic vs stacked mode in one module.
- Ensure all text-on-color combinations pass contrast requirements.
- Add lightweight motion tokens and use consistently.

## Done Criteria
- Strong editorial hierarchy preserved on all breakpoints
- Card system is reusable and variant-driven
- Interaction controls are accessible and touch-friendly
- Visual result is bold without becoming noisy
