---
name: gray-ui-csm-implementation-rules
description: Implement or modify code in gray-ui-csm while following PROJECT_RULES.md, established route and feature boundaries, shared UI reuse, and mock-data placement rules. Use when building a screen, refactoring a flow, deciding where code should live, wiring state, or checking whether a change matches the repo's implementation patterns.
---

# Gray Ui Csm Implementation Rules

## Overview

Use this skill to decide how a change should fit into the current repo instead of inventing a new pattern too early.

Read [PROJECT_RULES.md](../../PROJECT_RULES.md) first, then use the repo's existing surfaces as the implementation map.

## Workflow

1. Identify the layer that owns the change.

Use these defaults:
- `app/*/page.tsx` for thin route parsing, redirects, and `notFound()`
- `components/<feature>` for feature UI composition
- `components/ui` for shared primitives
- `components/data-grid` for reusable grid, drawer, and table behavior
- `lib/<feature>` for types, mock data, and domain helpers
- `app/globals.css` for global tokens

2. Reuse before creating.

Check these files before creating a new pattern:
- `lib/csm-routes.ts`
- `components/app-shell.tsx`
- `components/app-sidebar.tsx`
- `components/tickets/*`
- `components/customers/*`
- `components/data-grid/*`
- `components/ui/*`

If an existing pattern is close, extend it instead of creating a new one.

3. Keep route files thin.

Do not place heavy business logic, large inline demo data, or mutation flows in `app/*/page.tsx`.

Push non-trivial logic into:
- feature hooks
- feature helpers
- `lib/<feature>` domain files

4. Keep rendering separate from domain logic.

Move non-trivial filtering, sorting, mapping, export formatting, and mutation helpers out of JSX and into helpers or hooks.

Use `components/tickets/use-tickets-page-query-state.ts`, `components/tickets/use-tickets-page-mutations.ts`, and `components/tickets/use-tickets-page-state.ts` as the reference split.

5. Protect future scale.

When adding local state or local mutations:
- keep shareable view state in the URL when appropriate
- isolate mutation logic so it can later be replaced by API calls or server actions
- follow existing domain types instead of inventing ad hoc local shapes

6. Avoid hardcoding.

Do not introduce:
- large fake records inside view components
- raw color literals when a token should exist
- one-off spacing, radius, or shadow values without a clear design-system reason
- repeated product copy in multiple files

Move repeated copy to `*.copy.ts` and demo data to `lib/<feature>/mock-data.ts`.

7. Validate before calling the work done.

For meaningful code changes, run:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

For UI changes, also inspect the touched route for:
- desktop and mobile behavior
- light and dark theme behavior
- obvious empty, hover, focus, and disabled states

## Required Questions

Before finishing, answer:

1. Did I preserve an existing repo pattern before inventing a new one?
2. Is the route layer still thin?
3. Did I keep data and domain logic out of the render layer where appropriate?
4. Did I avoid hardcoded visuals and demo content?
5. Will this structure still make sense after the next related feature lands?
