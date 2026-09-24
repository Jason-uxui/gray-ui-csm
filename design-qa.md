# Design QA

## Latest merge polish — 24 Sep 2026

Latest adjustment: picker/note expansion and collapse now take 1000ms. Toast remains horizontally centered but sits 16px from the top, not vertically centered. Its four-second fully-visible duration is unchanged.

Demo pacing follow-up: dialog 500ms, picker/note height 600ms, loading 2200ms, result reveal 650ms. Toast now sits at viewport center and stays fully visible four seconds after entrance. Browser verification confirmed Add ticket is usable after ticket 2, the existing three-ticket cap displays an explanation, loading lasts over 2.1 seconds, and toast is centered and dismisses automatically. Typecheck and eight tests passed. See the latest override in `docs/ticket-merge-handoff.md` for complete timings.

This section supersedes older merge timing and loading notes below.

- Merge is a standalone outline icon action with tooltip in the header.
- Merge results reuse the conversation author/avatar/time wrapper.
- Search IDs are muted regular text. Results remain 224px high for all queries, including no matches.
- Selection area animates height over 240ms; results fade after 80ms; selected content reveals over 220ms. Reduced-motion disables movement.
- Loading uses the Figma illustration/ring and Cancel merge. The local demo waits 650ms; production must await a real transaction instead.
- Result reveal is 320ms after 180ms; toast begins after 280ms and stays four seconds.
- Verified: success, cancellation without committing (draft retained), simulated failure/retry, fixed empty-search height, mobile dark layout bounds, typecheck, eight unit tests, and production build.
- Seven core Figma flow states are covered. Updated Figma picker styling, header action, and motion specification; no new prototype wiring claimed.
- Detailed evidence and backend limits: `docs/ticket-merge-handoff.md`.

## Previous scope — Analytics

- Visual source of truth: Knowledge Base article `Insight` tab
- Reference screenshot: `/tmp/kb-insights-reference.png`
- Implementation screenshot: `/tmp/analytics-polished-desktop.png`
- Round 2 implementation screenshot: `/tmp/analytics-polish-round-2-desktop.png`
- Implementation URL: `http://localhost:3000/analytics?range=30d&compare=previous-period`
- Tested states: light and dark themes; 1386px desktop; 397px mobile (390px target); default and active filters; SLA table expanded and collapsed

### Analytics visual comparison

Analytics now reuses the same data-display anatomy as Knowledge Base Insights: muted rounded outer surface, compact uppercase heading, bordered white/neutral inner surface, large tabular values, primary-colored trends, and semantic status colors. KPI blocks use the shared `StatCard`; analytical blocks use the shared `InsightMetricBlock`. The ticket-volume chart follows the Total Views treatment with primary gradients and a taller investigation area.

The SLA table follows the Linked Tickets/Matching table hierarchy. Long customer names truncate with a tooltip, numeric cells use tabular figures, short values do not wrap, and lower-priority columns hide at narrow breakpoints. Internal actions use a right-arrow and stay in the same application tab.

### Analytics interaction and responsive evidence

- All 9 range/comparison URL combinations render the selected state and update range-based KPI, chart, SLA, quality, issue, and secondary-signal data.
- Invalid URL values fall back visually to `30d` and `previous-period`; selecting `7d` and `none` updates the URL and removes comparison deltas.
- Team selection enables the icon-only Clear filters control; clearing restores `All teams` and disables the action.
- SLA breach detail expands and collapses; its desktop table no longer creates an internal horizontal scrollbar.
- Mobile filters stack one per row. At the 397px measured viewport, the page root and content grid do not overflow horizontally.
- Dark mode preserves contrast, semantic statuses, chart gradients, and card hierarchy.
- Final browser console check reports no warnings or errors.

### Analytics findings resolved during QA

- P1: Next.js production prerender required a Suspense boundary around URL search parameters. Added at the route boundary.
- P1: Mobile grid items inherited intrinsic widths and were visually clipped. Constrained the root grid and each responsive grid to `minmax(0, 1fr)` and stacked filters on mobile.
- P2: SLA table forced horizontal scrolling at desktop card width. Reduced column/padding footprint and hid supporting columns at narrow breakpoints.
- P2: Recharts animation caused incomplete screenshots and a transient partial chart. Disabled animation for deterministic complete rendering.
- P1: The volume chart used a fixed height inside a card stretched to match the SLA panel, leaving a large empty area. The block, inner content, and chart now form a full-height flex layout.
- P1: Both chart series resolved to nearly the same dark-mode color. New tickets keeps `primary`; resolved tickets now uses the darker semantic `chart-4` token, with matching legend and gradient.
- P1: `monotone` interpolation softened and distorted the trend shape. Both series now use straight `linear` segments, matching the supplied chart reference.
- P1: KPI sparklines exposed an active point without useful data. They now use area gradients and show a metric-name/value tooltip on hover.
- P2: Supporting cards had equal outer heights but short inner surfaces. All three now stretch their inner content to fill the row.
- P2: Major section spacing was too compressed. Desktop/tablet gaps now use 20px while mobile retains 16px.
- P2: Removed the active-filter helper sentence and the future Self-service block as requested.

### Analytics round 2 verification

- Desktop dark and light mode: main chart fills the card beside SLA, gradients remain visible, and the two series remain distinct.
- Main chart tooltip verified at Apr 16 with both `New tickets 168` and `Resolved tickets 142`.
- KPI sparkline tooltip verified with the metric label and selected value.
- Active Team filter still enables Clear filters and no longer inserts helper copy into the layout.
- Mobile measured at 391px: root content has no horizontal overflow; filters remain stacked; the Self-service block is absent.
- No global colors, route state, table behavior, or mock-data contracts changed.
- The 30-day view now plots one value per day while retaining a sparse readable X-axis; hidden dates remain interactive and 7-day/90-day ranges use the same separation between plotted data and visible labels.

## Current scope — Merge tickets flow

- Source visual truth: user-provided KiriDesk merge-flow screenshots, especially `Screenshot 2026-09-22 at 2.40.30 PM.png` through `Screenshot 2026-09-22 at 2.41.01 PM.png`; the earlier generated wireframe remains supporting structure only.
- Implementation: `http://localhost:3001/tickets/t-001`
- Implementation screenshot: Codex in-app browser captures inspected inline during this run (the browser surface did not expose a persistent screenshot path)
- Desktop viewport: browser default, approximately 1600 × 900 CSS px
- Responsive viewports: 768 × 900 and 390 × 844 requested; measured mobile dialog bounds were x 12, y 12, width 463.5, height 1031 within the browser's scaled 487 × 1055 CSS viewport
- Density normalization: browser screenshots and UI were compared at CSS scale; the source board was used as flow and hierarchy guidance rather than a pixel-perfect product screen
- States checked: action menu, empty/search, selected Ticket 2, optional note, disabled/enabled merge action, processing state, success toast, persistent merge record, previously merged ticket, cancel/reset, responsive modal, dark mode

## Full-view comparison evidence

The implementation preserves the reference's sequence: entry action, searchable modal, selected-ticket state, processing feedback, and a persistent result inside the conversation. The final UI intentionally inherits the existing Gray CSM shell, semantic tokens, typography, button treatments, ticket status badges, and 24px modal radius instead of copying the reference product's decorative connector lines.

## Focused region comparison evidence

- Header: merge icon, title, helper copy, and close action match the intended hierarchy.
- Ticket stack: Ticket 1 is fixed and visually anchored; each card is intentionally limited to two content rows—ticket number/status and subject—with a quiet remove action on selected targets.
- Search: query filters realistic existing mock tickets and excludes the current/already-selected tickets.
- Repeat merge prevention: tickets included in an earlier merge no longer appear as selectable results, with an explanatory empty state.
- Footer: Cancel is secondary; Merge tickets is disabled until a target is selected.
- Processing: the modal becomes a compact, non-dismissible progress state for 800ms, clearly naming the destination ticket.
- Result: merge closes the modal, announces a toast, adds a concise Activity event, and inserts a structured merge record into Conversation with every merged ticket and the optional note.

## Required fidelity surfaces

- Fonts and typography: uses the project's existing type stack, weights, and sentence-case labels; hierarchy is consistent with Ticket detail.
- Spacing and layout rhythm: 20–24px modal padding, 20px section gaps, compact ticket cards, fixed header/footer, and scrolling body match the target's density.
- Colors and visual tokens: all surfaces, borders, focus rings, badges, muted text, backdrop, and buttons use existing semantic project tokens; no hardcoded product palette was introduced.
- Image and asset fidelity: the target contains no raster assets. Icons use the project's existing Tabler icon library.
- Copy and content: required labels and helper text are present; ticket content comes from the existing mock dataset.

## Findings

No actionable P0, P1, or P2 mismatch remains.

## Interaction and browser verification

- Opened Merge tickets from the ticket-detail overflow menu.
- Confirmed Merge tickets is disabled in the empty state.
- Searched for `salesforce` and selected #TC-002.
- Added #TC-003 as the optional third ticket and confirmed the maximum target limit.
- Entered an optional internal note and completed the merge.
- Confirmed the processing state appears before completion.
- Confirmed the persistent Conversation merge record contains both tickets and the internal note; Activity retains the concise event and the toast confirms completion.
- Reopened Merge tickets, searched for the ticket just merged, and confirmed it was unavailable with clear explanatory copy.
- Switched the ticket detail and merge modal to dark mode and visually confirmed surface, border, badge, backdrop, text, and disabled-action contrast; restored light mode afterward.
- The asynchronous failure path preserves the draft and returns the modal to an inline `Merge failed` alert with retry available. This code path is typechecked but cannot be triggered by the current always-successful demo data provider.
- Reopened the dialog and confirmed transient selections and note were reset.
- Confirmed no browser console warnings or errors.
- Confirmed typecheck, lint, design-token guardrail, and route-thinness checks pass.

## Comparison history

- Initial implementation pass: no P0/P1/P2 issues found in desktop comparison.
- Responsive pass: measured dialog remained within the scaled mobile viewport; no overlap or hidden persistent footer actions found.
- Annotation feedback pass: converted section labels to sentence case, reduced ticket cards to two content rows, removed secondary account/submission metadata, and changed Internal note to an on-demand label-plus action matching the Ticket drawer's Tags/Followers disclosure pattern. Browser verification confirmed the note editor opens below the label and receives focus.
- Reference-learning pass: reduced the modal to a focused 560px maximum width, added a non-dismissible processing state, and replaced the generic Conversation event with a structured merge record. Post-fix browser evidence showed the modal transition, processing screen, two-ticket result, optional note, and semantic success styling with no console warnings or errors.
- Edge-state pass: added asynchronous error recovery, prevented repeat merges within the current ticket session, verified the explanatory unavailable-result state, and completed a visual dark-mode pass. The mobile layout contract remains unchanged: full-height inset modal below the small breakpoint, scrolling body, and fixed footer.

## Follow-up polish

- P3: When a merge API becomes available, connect the prepared asynchronous callback to the endpoint and replace the session-only unavailable-ticket list with persisted server state and authoritative timestamps.

## final result: passed

# Inbox design QA

- Design source: [Inbox desktop](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0/-Internal--UXUI---Gray-CSM--v2-?node-id=2124-12576) and [responsive examples](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0/-Internal--UXUI---Gray-CSM--v2-?node-id=2161-1384).
- Local preview: `http://localhost:3002/inbox?view=mine`.
- Scope: local, mock-data Inbox implementation; no backend persistence.

## Verified composition

- The 360px secondary sidebar combines Views, conversation search/filters, and the conversation list. No separate queue column remains.
- Conversation rows are 48px high, with a 24px empty-contact avatar, contact name, one-line subject preview, and unread dot or relative time.
- The selected conversation has a compact ticket header, icon-only operational actions with tooltips, a message/activity timeline, and a composer sharing the Ticket Detail shell.
- The contact placeholder uses Figma's muted/muted-foreground pair in Light and Dark. Its 24px silhouette keeps the Figma 44% opacity and white 54% inner shadow at x 0, y 2, blur 3.1.
- Below 768px, the list and detail are separate views with a Back control; compact actions move into a menu.
- The list title aligns with the Views label. Desktop search opens a centered dialog with recent/matching conversations below its input and a subtle 200ms enter/exit animation; Filter opens nested Priority and Status menus without a redundant title row or shifting the list. On mobile, search stays inline and the filter submenu flips into the viewport.

## Interaction checks

- View counts, selection, search, priority/status filters, assignment, snooze, resolve, and local reply sending were checked in the browser.
- Sender selection and Macros update the local composer. Formatting, emoji, attachment, voice, image, End Chat, and Open full ticket are marked preview-only in tooltips or labels, without status lines beneath the composer.
- Search selection, Enter-to-select, Escape-to-close, filter submenu selection, Clear filters, and both Light/Dark menu appearances were checked in the browser at desktop and 390px widths.
- “Open full ticket” is preview-only because Inbox and Tickets currently have separate mock records, so matching IDs can open unrelated content.
- TypeScript, ESLint, design-token/route guardrails, and production build are release checks; rerun them after the final code change.

## Remaining product integration

- Connect Inbox and Ticket Detail to one ticket data source before enabling cross-navigation.
- Specify and implement persistence, realtime updates, file/voice/image handling, and close-chat behavior separately.

final result: passed for the mock-data Inbox scope
