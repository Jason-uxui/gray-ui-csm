---
name: gray-ui-csm-design-system-review
description: Review UI changes in gray-ui-csm for compliance with PROJECT_RULES.md, semantic token usage, shared primitive reuse, responsive behavior, theme parity, and interaction-state coverage. Use after building or editing UI, before merge, or when checking whether a screen still matches the repo's design system.
---

# Gray Ui Csm Design System Review

## Overview

Use this skill as a focused UI review pass after implementation. Read [PROJECT_RULES.md](../../PROJECT_RULES.md) first and compare the change against the repo's actual design system, not against generic frontend taste.

## Review Workflow

1. Inspect the changed screen and the files that shape it.

Start with:
- the touched feature component
- related `components/ui` or `components/data-grid` primitives
- `app/globals.css`
- any nearby established screen using a similar pattern

2. Check primitive and token reuse.

Flag when the change:
- bypasses an existing primitive from `components/ui`
- recreates behavior already present in `components/data-grid`
- uses raw color literals or one-off visual values where semantic tokens should be used
- adds custom visual treatment without an intentional system reason

3. Check design-system behavior, not just static visuals.

Review whether the changed surface still respects:
- light and dark themes
- responsive behavior
- hover, focus, active, and disabled states
- keyboard interaction when relevant
- empty, loading, and error states when relevant

4. Check visual consistency with this repo.

Prefer consistency with:
- Tabler icon usage
- shadcn-style primitive composition
- token-driven colors from `app/globals.css`
- existing patterns in `tickets` and `customers`

Flag screens that look locally correct but drift from the repo's visual language.

## Output Format

Return findings first, ordered by severity.

For each finding, include:
- the concrete issue
- why it breaks the repo's design-system rules
- the file to inspect

If there are no findings, say so explicitly and mention any residual gaps such as unverified responsive states or theme states.

## Review Questions

1. Did the implementation reuse an existing primitive before creating custom UI?
2. Are semantic tokens used instead of raw visual values?
3. Does the change stay consistent with nearby repo patterns?
4. Were responsive, theme, and interaction states actually verified?
