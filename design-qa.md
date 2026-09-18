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

final result: passed
