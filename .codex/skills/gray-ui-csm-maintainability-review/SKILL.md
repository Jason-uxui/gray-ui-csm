---
name: gray-ui-csm-maintainability-review
description: Review gray-ui-csm changes for maintainability, scaling risk, hardcoding, layering drift, and deviation from PROJECT_RULES.md and established repo patterns. Use after implementation, before commit, or when deciding whether a change will remain easy to extend and safe to build on.
---

# Gray Ui Csm Maintainability Review

## Overview

Use this skill as the architectural and maintainability review pass. Read [PROJECT_RULES.md](../../PROJECT_RULES.md) first, then compare the change against the actual repo structure and reference patterns before judging it.

## Review Workflow

1. Map the change to the repo's layers.

Check whether code is in the right place:
- `app/*/page.tsx` for thin route wrappers
- `components/<feature>` for feature UI
- `components/ui` and `components/data-grid` for intentional reuse
- `lib/<feature>` for types, mock data, and domain helpers

2. Look for maintainability regressions.

Flag when a change:
- makes a route file heavy
- mixes rendering, data shaping, and mutation logic in one file
- duplicates logic that already exists nearby
- creates sideways coupling between features
- invents a new pattern where the repo already has a good one

3. Look for scale risk.

Flag when:
- URL-worthy view state is trapped only in local state
- mutation logic is scattered across unrelated components
- domain shapes drift from `lib/<feature>/types.ts`
- a local shortcut would make later API or server-action adoption harder

4. Look for hardcoding and silent drift.

Flag:
- large demo records inside view components
- repeated text that should live in `*.copy.ts`
- one-off behavior constants without clear naming
- ad hoc visual values that bypass the design system

5. Compare against the strongest reference pattern already in the repo.

Use `tickets` first for complex feature composition and state splitting.
Use `customers` as the secondary pattern for domain page composition.

## Output Format

Return findings first, ordered by severity.

For each finding, include:
- the problem
- why it increases maintenance or scaling cost
- the file to inspect

If there are no findings, say that explicitly and mention any residual uncertainty such as untested runtime behavior or areas not covered by the diff.

## Review Questions

1. Is this code in the right layer?
2. Does the change make the next related feature easier or harder to add?
3. Is there new duplication or hidden coupling?
4. Did the implementation introduce hardcoded content, logic, or styling that should live elsewhere?
5. Does the shape of the code still resemble the repo's best existing patterns?
