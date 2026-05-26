# Gray UI CSM Project Rules

This document is the source of truth for implementation rules in `gray-ui-csm`.

Use it for:
- planning new work
- implementing UI and state changes
- reviewing maintainability and scale risk
- validating design-system compliance
- creating repo-specific Codex skills and automated checks

If a future skill, script, or checklist disagrees with this file, update that tool to match this file or update this file intentionally.

## Project Intent

`gray-ui-csm` is a UI-first Customer Success workspace demo. The repository optimizes for:
- polished interaction design
- reusable UI patterns
- maintainable feature composition
- realistic demo workflows
- clear paths to future productionization

This repository does **not** optimize for shipping backend complexity inside feature views. Keep the UI and state architecture clean enough that real APIs, server actions, and persistence can replace the demo layer later.

## Core Principles

1. Preserve existing patterns before inventing new ones.
2. Keep route files thin and feature components intentional.
3. Reuse shared primitives before creating custom one-off UI.
4. Prefer semantic tokens and design-system components over ad hoc styling.
5. Keep demo data and presentation separate.
6. Make state and mutations easy to replace with real data flows later.

## Source Of Truth By Concern

- Route metadata and section identity live in `lib/csm-routes.ts`.
- App-level layout and navigation patterns live in `components/app-shell.tsx` and `components/app-sidebar.tsx`.
- Shared primitive UI lives in `components/ui`.
- Shared complex table and drawer patterns live in `components/data-grid`.
- Feature-specific UI lives in `components/<feature>`.
- Domain types, mock data, and view-model helpers live in `lib/<feature>`.
- Global design tokens live in `app/globals.css`.

Do not create a second source of truth for any of the areas above.

## Architecture Rules

### 1. Route layer must stay thin

Files in `app/*/page.tsx` should:
- read `params` or `searchParams`
- normalize or validate route input
- compose feature page components
- call `notFound()` or redirect when necessary

Files in `app/*/page.tsx` should not:
- contain large inline data sets
- hold business mutations
- implement large filtering or transformation logic
- introduce feature-specific presentation that belongs in `components/<feature>`

### 2. Feature pages own composition, not everything

Feature page components may compose sections and wire hooks together, but they should not become dumping grounds for all logic.

When a page starts managing many concerns, split them by role:
- query and URL state
- mutation state
- pure helpers
- presentational sections

`components/tickets` is the reference pattern for this split.

### 3. Domain logic belongs outside view markup

Keep JSX focused on rendering.

Move these out of render bodies when they are non-trivial:
- filter logic
- sorting logic
- option building
- domain mapping
- export formatting
- mutation helpers

Preferred homes:
- `components/<feature>/*-helpers.ts`
- `components/<feature>/use-*.ts`
- `lib/<feature>/*.ts`

### 4. Shared abstractions must be earned

Do not extract a generic shared abstraction on first use.

Extract to shared layers only when:
- the same pattern is used more than once
- the abstraction reduces duplication without hiding intent
- the shared API is still easy to understand

Preferred order:
- keep logic local to a feature
- extract to feature helpers or feature hooks
- promote to `components/ui` or `components/data-grid` only when reuse is real

### 5. Cross-feature coupling should stay low

Avoid importing deep feature logic across domains.

Good:
- `customers` uses shared primitives
- `tickets` uses shared primitives

Avoid:
- `customers` depending on internals from `tickets`
- feature A importing feature B helper logic just because it is convenient

If two features need the same domain rule, promote it to an intentional shared helper instead of importing sideways.

## State And Scaling Rules

### 1. URL-worthy state should live in the URL

State should go into route params or search params when it affects:
- deep links
- shareable views
- selected layout or tab
- currently open detail context

`tickets` and `customers` already establish this pattern.

### 2. Local demo mutations must resemble future real mutations

Even with mock data, mutation flows should be easy to swap later for:
- API calls
- server actions
- persistence layers

That means:
- keep mutation helpers isolated
- avoid scattered inline state updates across many components
- keep data-shape transformations predictable

### 3. Types must lead the implementation

If a feature has domain types in `lib/<feature>/types.ts`, new code should follow those types instead of inventing local ad hoc shapes.

Do not normalize the same concept differently in multiple places unless there is a deliberate view-model boundary.

## Hardcoding Rules

### 1. No hardcoded visual values when a token should exist

Avoid introducing one-off values for:
- colors
- border colors
- radii
- spacing systems
- shadows
- typography intent

Prefer:
- semantic utility classes such as `bg-background`, `text-muted-foreground`, `border-border`
- values derived from tokens in `app/globals.css`
- existing variants in shared primitives

If the design system is missing a needed visual token, add it intentionally instead of bypassing the system inline.

### 2. No large demo content inside view components

Avoid embedding large demo arrays, content blocks, or fake records directly into page and view components.

Move them to:
- `lib/<feature>/mock-data.ts`
- `components/<feature>/*.copy.ts`

Small local constants are fine when they are truly view-local and not reused, but anything that grows or repeats should move out.

### 3. Minimize magic numbers

When a number controls behavior or layout meaningfully, prefer a named constant.

Examples:
- breakpoints
- animation durations
- panel sizes
- thresholds
- overlay offsets

If a number is part of a deliberate component API or design token, name it clearly.

## Design System Rules

### 1. Prefer existing primitives first

Before creating custom markup, check:
- `components/ui`
- `components/data-grid`
- existing feature patterns in `tickets` and `customers`

New UI should usually be:
- composition of existing primitives
- a thin wrapper around an existing primitive
- a variant added to an existing primitive

### 2. Use semantic styling, not custom color logic

Prefer semantic classes and tokens over raw visual values.

Good:
- `bg-background`
- `text-foreground`
- `text-muted-foreground`
- `border-border`
- `bg-card`

Avoid:
- arbitrary color literals in JSX
- feature-specific color systems that bypass the global theme

### 3. Design-system compliance includes behavior, not just appearance

New or changed UI should respect:
- light and dark themes
- desktop and mobile layouts
- hover, focus, active, and disabled states
- keyboard interaction when relevant
- empty, loading, and error states when relevant

### 4. Keep iconography and visual language consistent

The repo uses Tabler icons and shadcn-style primitives. Prefer continuing that language unless there is an explicit design reason to extend it.

## Maintainability Rules

### 1. Keep file responsibilities clear

Avoid files that simultaneously:
- define domain rules
- manage mutations
- hold copy content
- render many sections
- own shared utilities

If a file starts doing too much, split by responsibility.

### 2. Name things by product meaning

Prefer names that describe product concepts or UI intent.

Avoid vague names such as:
- `misc`
- `helpers2`
- `temp`
- `new-data`
- `custom-stuff`

### 3. Repeated logic should trigger extraction

If logic appears twice, consider extraction.

Common extraction targets:
- formatting helpers
- filter helpers
- state hooks
- shared toolbar actions
- repeated option builders

### 4. Keep change scope focused

A single change should not silently refactor unrelated patterns unless that refactor is the task.

When improving an area, preserve the repo's existing structure unless there is a clear reason to reshape it.

## Reference Patterns In This Repo

Use these as default examples before creating new patterns:

- Thin route wrappers:
  - `app/tickets/page.tsx`
  - `app/customers/page.tsx`
  - `app/tickets/[ticketId]/page.tsx`

- Shared route metadata:
  - `lib/csm-routes.ts`

- Feature state split:
  - `components/tickets/use-tickets-page-query-state.ts`
  - `components/tickets/use-tickets-page-mutations.ts`
  - `components/tickets/use-tickets-page-state.ts`

- Shared complex table foundation:
  - `components/data-grid/data-grid.tsx`

- Global tokens and theme:
  - `app/globals.css`

## Required Review Questions

Before marking work complete, answer these:

1. Did I preserve an existing repo pattern instead of inventing a new one?
2. Is the route layer still thin?
3. Did I keep domain logic and mock data out of the render layer where appropriate?
4. Did I avoid hardcoded colors, data, and ad hoc design values?
5. Did I use existing shared primitives before creating new custom UI?
6. Will this structure still be understandable after the next two related features?
7. Can this local state and mutation flow be upgraded to real data later without rewriting the whole feature?
8. Did I validate the UI states that matter for this change?

## Required Validation Before Merge

Run these for meaningful code changes:

```bash
pnpm check:guardrails
pnpm typecheck
pnpm lint
pnpm build
```

For UI changes, also verify the touched surface manually at the relevant route, including:
- intended layout
- responsive behavior
- theme behavior
- obvious interaction states

## Workflow Enforcement

Install repo-local git hooks with:

```bash
pnpm install:git-hooks
```

The intended workflow is:
- `pre-commit`: `pnpm check:guardrails`
- `pre-push`: `pnpm check:guardrails`, `pnpm lint`, `pnpm typecheck`
- before merge: `pnpm check:guardrails`, `pnpm typecheck`, `pnpm lint`, `pnpm build`

CI enforcement is defined in `.github/workflows/pr-guardrails.yml`.

If merge blocking is desired, require the `Guardrails, Lint, Typecheck, Build` GitHub check in branch protection settings.

## Change Policy

These rules are intentionally strict by default. If a change should break one of them, that decision should be explicit and documented in the diff or PR summary.
