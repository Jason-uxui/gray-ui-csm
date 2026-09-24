# Ticket merge — Figma → code handoff

## Source of truth

Designer-edited Gray CSM file `sFoSM9QLUXjDWXy1JsmtN0`, verified 2026-09-23:

- Dialog: `2174:1247`; selected state: `2174:1123`.
- Ticket card: `2137:900`; result: `2137:1304`.
- Status badge: `2188:7581`; connector: `2159:953`.
- Light/Dark reference board: `2190:8662`.

## Component mapping

| Figma | Repository |
| --- | --- |
| Ticket merge card | `TicketMergeCard` |
| Ticket status badge | `TicketStatusBadge`; shared ticket status presentation |
| Merge relationship connector | `MergeRelationshipConnector` |
| Merge tickets dialog | `MergeTicketsDialog` |
| Merge result card | `MergedTicketsTimelineCard` |

Project Theme `status/{open,pending,resolved,closed,merge}/{background,foreground,border}` maps to CSS variables with hyphenated names in `app/globals.css`. Both modes match the approved values. Connector icon and line are exact Figma exports under `public/tickets/`; CSS masks apply the active theme color.

## Interaction contract

### Prototype demo pacing override — 24 Sep

The latest requested demo pacing supersedes timings below: dialog/backdrop 500ms; measured picker and Internal note expansion/collapse 1000ms; picker reveal 450ms after 180ms; selected state 500ms; cancellable mock loading 2200ms; result reveal 650ms after 400ms. The toast is horizontally centered, 16px from the viewport top, enters over 500ms after 700ms and remains fully visible for four seconds (5200ms total lifecycle). Reduced-motion still disables motion. These are code prototype settings, not updated Figma prototype connections.

Add ticket remains available after selecting ticket 2. At the existing limit of three total tickets, explanatory text replaces the action. The limit has not been expanded.

- Current ticket is the destination. Choose one or two other distinct tickets.
- Initial state shows search. Add ticket appears only after a source is selected and while capacity remains.
- Chevron opens replacement selection. Cancel preserves the original; Remove removes only that source.
- Connector is decorative, never a button or keyboard stop.
- Card has two lines: ticket ID/status, then a single truncated subject with full text on hover.
- Search excludes current, selected and previously merged tickets. Arrow keys and Enter select; Escape dismisses results before closing the dialog.
- Internal note opens with `+`, auto-focuses, and preserves text when collapsed. The latest Figma uses a textarea; this sync does not introduce rich-text storage.
- Merge is enabled only for a valid selection. This intentionally corrects the disabled appearance in the selected Figma sample.
- During the request, prevent duplicate submissions. Cancel merge aborts the preview and returns to the preserved draft. Failure preserves draft and offers retry through Merge tickets.
- Success closes the dialog and appends the shared result card; statuses are captured at merge time. Existing records without a status do not invent one.
- Small viewports scroll the body while retaining the footer. Motion respects reduced-motion preferences.

## Scope boundary

### Feedback alignment — 23 Sep

- The business ticket chooser is 76px tall in Empty, Focus, and Selected states. Empty displays Choose ticket; clicking opens search. Shared Input sizing is unchanged.
- Connector rows include 24px top spacing plus the 76px card. The branch meets the card at 62px; every nonterminal row continues the vertical spine to the next row. The marker remains decorative and nonfocusable.
- Rounded connector correction: continuation starts at the bend tangent (55px), not the arrow baseline (62px). Preserve the exported SVG height of 65.682px including its arrowhead; both segments render at 50% muted foreground opacity, matching Figma. Evidence: `output/playwright/connector-bend-light.png` and `connector-bend-dark.png`.
- Result title and Combined into subtitle both use 14px / 20px, with different weight/color rather than different sizes.
- Figma connector property: Continue spine. Three-ticket dialog variant: `2200:3657`. Count=3 result labels corrected in the existing main components.
- Feedback evidence: `output/playwright/merge-feedback-{two-light,three-light,three-dark,result-light,result-dark}.png`.

This repository currently uses a local/mock timeline. No backend merge, source-ticket archival, or durable persistence is introduced here. A reload resets local merge history. Backend integration and transaction/error behavior require a separate production pass.

## Verification

### Feedback and motion alignment — 24 Sep

- Header: 36px outline icon-only Merge tickets action between More and Submit, with tooltip.
- Result: reuse DiscussionMessageEntry with the actual merging user's avatar/name/time; historical records without author data do not invent an author.
- Picker: muted regular IDs; fixed 224px result viewport including empty search; measured selection area expands/collapses over 240ms. Results reveal over 180ms after 80ms; selected card reveals over 220ms.
- Loading: exact Figma illustration and ring from `2174:1187`, plus Cancel merge. The local preview uses cancellable 650ms latency so loading is perceptible. Production must replace this mock wait with its real transaction, not report success on a timer. The callback receives an AbortSignal; real cancellation requires backend support.
- Completion: result reveals over 320ms after 180ms; toast appears after 280ms and remains visible for four seconds. Reduced-motion disables movement.
- Figma: updated picker `2174:1038`, Success header `2141:318`, and motion board `2142:298`. All seven core states are represented: Empty, Picker open, Selected, Note expanded, Merging, Success, Error. Motion timings are documented, not a newly wired Figma prototype.
- Browser checks: fixed-height empty results; authored result; cancel before commit preserves note; simulated failure preserves draft and retry succeeds; mobile 390×844 bounds and reduced-motion. Temporary error harness removed.
- Evidence: `output/playwright/merge-result-author-verified.png`, `merge-loading-illustration.png`, `merge-error-retry-20260924.png`, `merge-mobile-dark-20260924.png`.
- Production build passed. A development hydration warning was observed during the editing session; a fresh reload after the build produced no console errors.

- `node --test tests/ticket-merge.test.mjs`
- `pnpm typecheck`
- Targeted ESLint on changed ticket files.
- `pnpm build` and `pnpm check:guardrails` passed.
- Browser assertions passed: empty disabled state; current/duplicate/already-merged exclusions; keyboard selection; replacement; remove; two-source limit; note collapse/reopen; success timeline.
- Light/Dark screenshots inspected; 390 × 844 viewport bounds checked. Evidence: `output/playwright/merge-selected-light.png`, `merge-note-dark.png`, `merge-mobile-dark.png`, `merge-result-light.png`, `merge-result-dark.png`.
- A temporary isolated callback harness verified pending state, Escape protection, rejected request preserving selection/note, and successful retry. Evidence: `output/playwright/merge-pending.png`, `merge-error.png`. Harness removed after QA; no test-only route shipped.
- These checks cover the UI contract, not a backend merge transaction.
- Three-ticket success without a note and reduced-motion mode also passed; `output/playwright/merge-result-three-dark.png` records the result.
