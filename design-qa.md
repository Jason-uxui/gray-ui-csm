# Analytics design QA

- Visual source of truth: Knowledge Base article `Insight` tab
- Reference screenshot: `/tmp/kb-insights-reference.png`
- Implementation screenshot: `/tmp/analytics-polished-desktop.png`
- Round 2 implementation screenshot: `/tmp/analytics-polish-round-2-desktop.png`
- Implementation URL: `http://localhost:3000/analytics?range=30d&compare=previous-period`
- Tested states: light and dark themes; 1386px desktop; 397px mobile (390px target); default and active filters; SLA table expanded and collapsed

## Visual comparison

Analytics now reuses the same data-display anatomy as Knowledge Base Insights: muted rounded outer surface, compact uppercase heading, bordered white/neutral inner surface, large tabular values, primary-colored trends, and semantic status colors. KPI blocks use the shared `StatCard`; analytical blocks use the shared `InsightMetricBlock`. The ticket-volume chart follows the Total Views treatment with primary gradients and a taller investigation area.

The SLA table follows the Linked Tickets/Matching table hierarchy. Long customer names truncate with a tooltip, numeric cells use tabular figures, short values do not wrap, and lower-priority columns hide at narrow widths. Internal actions use a right-arrow and stay in the same application tab.

## Interaction and responsive evidence

- All 9 range/comparison URL combinations render the selected state and update range-based KPI, chart, SLA, quality, issue, and secondary-signal data.
- Invalid URL values fall back visually to `30d` and `previous-period`; selecting `7d` and `none` updates the URL and removes comparison deltas.
- Team selection enables the icon-only Clear filters control; clearing restores `All teams` and disables the action.
- SLA breach detail expands and collapses; its desktop table no longer creates an internal horizontal scrollbar.
- Mobile filters stack one per row. At the 397px measured viewport, the page root and content grid do not overflow horizontally.
- Dark mode preserves contrast, semantic statuses, chart gradients, and card hierarchy.
- Final browser console check reports no warnings or errors.

## Findings resolved during QA

- P1: Next.js production prerender required a Suspense boundary around URL search parameters. Added at the route boundary.
- P1: Mobile grid items inherited intrinsic widths and were visually clipped. Constrained the root grid and each responsive grid to `minmax(0, 1fr)` and stacked filters on mobile.
- P2: SLA table forced horizontal scrolling at desktop card width. Reduced column/padding footprint and hid supporting columns at narrow breakpoints.
- P2: Recharts animation caused incomplete screenshots and a transient partial chart. Disabled animation for deterministic complete rendering.

### Feedback round 2

- P1: The volume chart used a fixed height inside a card stretched to match the SLA panel, leaving a large empty area. The block, inner content, and chart now form a full-height flex layout.
- P1: Both chart series resolved to nearly the same dark-mode color. New tickets keeps `primary`; resolved tickets now uses the darker semantic `chart-4` token, with matching legend and gradient.
- P1: `monotone` interpolation softened and distorted the trend shape. Both series now use straight `linear` segments, matching the supplied chart reference.
- P1: KPI sparklines exposed an active point without useful data. They now use area gradients and show a metric-name/value tooltip on hover.
- P2: Supporting cards had equal outer heights but short inner surfaces. All three now stretch their inner content to fill the row.
- P2: Major section spacing was too compressed. Desktop/tablet gaps now use 20px while mobile retains 16px.
- P2: Removed the active-filter helper sentence and the future Self-service block as requested.

## Round 2 verification

- Desktop dark and light mode: main chart fills the card beside SLA, gradients remain visible, and the two series remain distinct.
- Main chart tooltip verified at Apr 16 with both `New tickets 168` and `Resolved tickets 142`.
- KPI sparkline tooltip verified with the metric label and selected value.
- Active Team filter still enables Clear filters and no longer inserts helper copy into the layout.
- Mobile measured at 391px: root content has no horizontal overflow; filters remain stacked; the Self-service block is absent.
- No global colors, route state, table behavior, or mock-data contracts changed.

### Dense daily chart data

- The 30-day view now plots one value per day instead of only the visible axis milestones, producing more natural short-term movement while keeping straight line segments.
- The X-axis remains intentionally sparse: Apr 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, and 30.
- Hidden intermediate dates remain interactive; browser QA verified the Apr 6 tooltip with both ticket series and their values.
- The 7-day and 90-day ranges use the same separation between plotted data and visible labels; the 90-day view remains readable with ten-day milestones.

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
