# Remote Assist demo

Remote Assist and phone support run inside the existing Ticket Detail flow. Open `/tickets/t-001`, choose **More actions → Remote Assist**, press Enter in the empty message field to accept its suggestion, send the invitation, and open the session. The sample customer automatically connects and shares their screen. **Request control** receives a simulated customer response and enables pointer movement/clicks. **Demo scenarios** remains available for alternate connection/permission states; phone support also connects automatically; alternate states are under More actions → Call scenarios.

This is a local UI demo. It sends no email, places no real calls and captures no customer camera or screen. The supplied screen video is a two-second HD preview. The supplied phone audio is an audible synthesized sample of about twelve seconds. A copied invitation link opens the agent demo in the same browser tab context; it is not a customer authentication link.

## Implemented behavior

- Editable invitations with multiple recipient chips, validation, pending submission, cancellation and retry on preparation errors. Add recipients with Enter, comma, semicolon or blur; remove with × or Backspace; duplicates are ignored case-insensitively. Earlier single-recipient histories remain supported.
- Five-minute expiry, cancel/resend with a new ID/code, waiting, connecting, live, disconnect and reconnect.
- The isolated sample-customer adapter connects after 1.8 seconds and shares after a further 1.2 seconds while the workspace is open. Control/recording requests get separate simulated approvals after 0.9 seconds. Unmounting, ending or disconnecting cancels pending responses; reconnect resumes only after an explicit reconnect action. Disconnect releases control. The screen is a Figma-derived demo asset with a simulated pointer, keyboard movement and click feedback.
- Session chat, reply, formatting, emoji and attachments. Internal notes use a separate collection and the existing Notes UI.
- Screenshot download, browser full screen and small-screen Chat/Notes/Details sheets.
- Idempotent ending, session summary, event log, recording processing/failed/ready and playable/downloadable demo media.
- Phone dialing/connected/unanswered, mute, camera indicator, hold/resume, keypad and call results. Below desktop, the call panel can minimize so the ticket reply remains usable.
- Browser-tab history under `gray-csm-remote-assist:<ticketId>`, with versioned validation and a reset action. Saved history retains the latest twenty sessions. One support session is active per ticket at a time; remote and phone sessions do not run concurrently in this demo.

## Reuse and integration

`TicketDetailPage` composes the feature without adding a route. `?assist=<sessionId>` selects the workspace. The existing AppShell, sidebar, ticket assignments, side conversation and reply flow remain in use.

`TicketDetailsContent` extracts the existing Details UI for both the ticket and the session. `DetailRightPanelShell`, `SharedInternalNotesTabContent`, `DiscussionMessageEntry`, `DiscussionThreadContent`, `ThreadComposer`, `ActivityTimelineList`, `Sheet`, `Card` and `ConfirmDialog` are reused. ThreadComposer adds optional customer-facing labels while retaining its internal defaults. DropdownMenuContent adds an optional positioning class so a menu inside an invitation dialog can sit above its backdrop.

Feature views live in `components/tickets/remote-assist`; types, fixtures, transitions, persistence and presentation helpers live in `lib/tickets/remote-assist`. The transition model prevents control/recording grants without a preceding request, rejects actions after ending and avoids duplicate messages/results.

## Design evidence

Source: [Remote Assist and Phone Support](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0?node-id=2330-1982). Implementation planning: [Code Blueprint](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0?node-id=2419-2636). The local coded live state was captured as editable raw layers in the same Figma file: [Code capture](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0?node-id=2474-2636) and [design code review](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0?node-id=2474-2641). Native capture may omit browser CSS filters on small media icons; browser screenshots remain the visual reference for those details.

Assets under `public/remote-assist` come from the supplied Figma nodes. Desktop 2395:3167, desktop thumbnail 2408:2468, recording poster 2408:2640 and consent illustration 2405:8068 are isolated content assets rather than flattened application screens. Generic UI remains code. The repository owner confirmed permission to publish the supplied assets alongside this source on 2026-10-14; media remains separate from the MIT code license.

The demo reads the current ticket/customer and logged-in support user. Sample names, inconsistent dates and the source's simultaneous processing/playable presentation were replaced with consistent runtime data and mutually exclusive recording states. The desktop screen identity uses two lines to accommodate ticket context; the Figma reference places its compact identity inline.

## Validation

`pnpm test:remote-assist` runs twenty-five behavior tests against transpiled production models and works with the repository's Node 20 CI. These cover multiple recipients, earlier histories and the sample-customer adapter alongside session/permission behavior. The PR workflow invokes this check. Local guardrails, typecheck, lint and production build passed.

Browser checks covered invitation validation/retry/cancellation, clipboard, expiry/resend, customer join, denied/granted control, separate recording consent, screenshot/full screen, attachments, chat/notes separation, reconnect, reload/history, ending, summary, session log, media previews and phone controls/unanswered calls. Remote workspace controls were checked at 320, 390, 768, 1024, 1280 and 1490px; mobile sheets and Light/Dark were checked. Evidence lives in the ignored `output/playwright` folder.

Safari/Firefox, an exhaustive screen-reader audit, real devices/services and final designer approval are not included in these checks. No commit, push or deployment was performed for this change.

## Feedback review — 2026-10-13

The [visual feedback board](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0?node-id=2531-3094) contains source/code comparisons, editable native captures, numbered pins and one before/after card for each of the eleven original comments and seven follow-ups. Source frames were not edited.

| Surface                      | Gap resolved                                                                                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Invitation and summary cards | Connected title/body corners, source spacing and typography; summary editing/scenarios moved to the session log. Ready recording uses the source metadata/preview/file/action arrangement. |
| Invitation dialog            | Borderless title, editable recipient chips, empty message with suggestion, Enter to accept the suggestion, 4× illustration export, 14px consent description, source footer actions.        |
| Join link                    | Content-sized chip; no underline by default; subtle background hover and keyboard focus. Copy feedback uses an auto-dismissing toast outside the card.                                     |
| Expiry                       | Neutral gray background and remaining-time fill, updated each second and clamped to expiry.                                                                                                |
| Workspace                    | Sample connection/sharing/control is reachable through the normal flow. Duration is absent before starting; the header Demo badge is removed.                                              |
| Recording empty/error        | Centered icon, title and explanation; 176px minimum height. The copy distinguishes not started, recording not enabled and processing failure.                                              |

Targeted browser checks verified Enter suggestion/newlines, duplicate/invalid/multiple emails, saving and reloading recipients, copy without card-height change, hover, countdown, automatic connection, pointer keyboard input, cancellation before join, separate recording approval, failed/ready recording and log access. Desktop 1622×1198, mobile 390/320 and Light/Dark were checked. Screenshots are in `output/playwright/feedback-*.png`.

## Feedback review — 2026-10-14

The [21-feedback comparison board](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0?node-id=2559-3350) records the seventeen comments plus four follow-ups, source references, numbered pins, expected/before/after cards, severity and verification. It includes an editable [native call-result capture](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0?node-id=2551-2) plus browser screenshots of the final audio card, email suggestions, the updated shared screen and the video lightbox. The native raw reference is retained beside the board; its earlier badge and SVG-filter omissions are explicitly labeled. The main comparison uses final browser pixels.

- Recipient search uses the existing ticket/support contacts, excludes chosen addresses and supports mouse/keyboard selection. The autocomplete portal stays inside the invitation dialog for correct focus handling. The invitation footer is removed.
- Control cursor is filled white. Screenshot/full-screen buttons are icon-only with tooltips and accessible names. Duration is 14px, with a 16px icon, muted label and semibold timer.
- Session tabs contain Chat/Notes with a bottom border. Ticket Details remains in the rail and mobile sheet. Only Chat hides its heading. Only the Remote Assist notes composer hides its avatar; regular Ticket Notes defaults are preserved.
- End-call/end-session icons use a muted gray wrapper. Non-ready result metadata keeps date and time on one line; at narrow widths the full date/time remains available in the title.
- Recording processing finishes after four seconds when simulated consent was granted. Failed/empty states remain unchanged. Remote video opens in a centered responsive lightbox with no visible title/description. Closing unmounts playback.
- Connected sample phone calls simulate a recording request and customer approval, then use the supplied audio fixture after ending. No microphone is accessed. Calls ended before joining or before approval still have no recording. A denied request is not automatically retried. The result matches Figma 2405:7436: waveform, central Play/Pause, Call Summary and download.
- Phone panel matches source 2404:6728 and has equal 16px right/bottom margins. Active calls show only the floating panel; the conversation card appears after ending.
- Desktop asset 2395:3167 was reexported at 3× as `desktop@3x.png` (2809×1839). The main shared-screen image uses the full-resolution file to preserve fine menu text; the sample video is regenerated at 1920px width as `demo-screen-hd.mp4`.

Targeted Chrome checks verified suggestion selection, tooltips, notes scope, source typography, automatic phone connection, processing/ready, audible playback (11.87s), video playback, centered lightbox/Close/Escape, and the new desktop file's natural dimensions. The lightbox was checked at desktop 1320×1065 and mobile 390×844 with no horizontal overflow. The phone panel was also checked at 390px: 358px wide, equal 16px right/bottom margins, with no horizontal overflow. The confirmation icon wrapper measured 48px and used the muted gray background. Screenshots are in `output/playwright/r3-*.png`. Behavior tests, typecheck, lint, guardrails and build passed.

Quality review: feature/domain separation is retained; shared component options default to prior behavior; no new dependencies or component copies. The patch is maintainable and aligned with project tokens/components and PROJECT_RULES.md. Real services, Safari/Firefox, exhaustive accessibility and designer acceptance remain outside this local demo validation.

## Final flow / responsive / regression audit — 2026-10-14

The final section of the [review board](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0?node-id=2559-3350) contains five scoped fixes and browser evidence. Source flow was reopened: invitation, waiting, live, video and phone-result designs match the current approved feedback. The source has no separate disconnected/declined/unanswered layouts; those states use existing components and tokens rather than claiming an exact source frame.

Final fixes: compact mobile header; correct control button names at every breakpoint; explicit declined-recording notices; a reconnect action within the phone panel; call-specific timeout/cancel/log/empty copy; disconnected status no longer hidden behind On hold. The timeout and reconnect model cases have regression tests.

Browser coverage: both workspaces at 320, 390, 768, 1024, 1280, 1490 and 1622px without horizontal overflow; Light/Dark; 390×540 invitation with dropdown and visible Send; mobile Chat/Notes/Details/People/Knowledge Base; pending/granted/declined control and recording; waiting/connecting/disconnected/reconnecting/expiry/cancellation; recording empty/processing/ready/failed; phone mute/camera/hold/keypad/minimize/reconnect; audio playback; saved-history error and reset recovery. Seeded histories were used only in the independent QA browser to reach alternate states. No capture-only branches were added to production code.

Regression checks: Ticket t-002 Notes keeps its composer avatar and Details heading; regular ticket reply Send enables; Customer lattice-cloud Notes keeps its avatar and Customer Details heading; Remote Assist Notes alone hides the composer avatar and remains separate from customer chat. Knowledge Base article/details rendering was checked. Complete Knowledge Base editor/discard automation was not confirmed and is not included in the pass claim. The default confirmation dialog was verified without the new optional icon. Customer/Knowledge Base feature files are unchanged.

Validation: 25 Remote Assist model tests, 8 merge tests, format, guardrails, typecheck, lint and build pass. Typecheck was rerun after build finished to avoid concurrent generated-type writes. A temporary production server on port 3011 confirmed the invitation/open/control/reload path, valid Conversation tab labeling, Dark mobile layout, and no console errors in that stable check. It was separate from the user's existing development server and is stopped after QA. Browser fixtures, timings and screenshots are in ignored `output/playwright/final-*.png`.

Quality: existing feature/domain boundaries and shared defaults are preserved; no dependencies, generic token policies, route implementations or unrelated screens were changed in this final pass. The scoped patch is maintainable, extensible for replacing the demo adapter, design-system aligned and compliant with PROJECT_RULES.md. Safari/Firefox, real devices/services, exhaustive accessibility and final designer approval remain unverified. No commit, push, merge or deployment.

## Cross-browser and engineering follow-up — 2026-10-14

This follow-up supersedes the earlier Firefox/Knowledge Base verification limits.
See the [engineering review](./remote-assist-quality-review.md) for the adopted
rules, precise scope, findings and remaining limits.

Firefox 156 and WebKit 26.6 now cover the invitation autocomplete, Remote Assist
and Phone Support flows, media playback and mobile layouts. Native Safari still
requires the user's Allow remote automation setting; WebKit is recorded separately.
The padded autocomplete empty wrapper is removed; suggestions are controlled by
the same filtered results used for keyboard navigation, and no-match searches
leave the dropdown closed.

Knowledge Base editor coverage includes title/content, formatting/link, metadata,
status, save/reload, version history, creating articles, guarded navigation and
discard, plus mobile details. Two pre-existing bugs were fixed within Knowledge
Base: omitted seed revisions that caused saved sample edits to be overwritten,
and duplicate Link/Underline registrations. Six storage regression tests join
the 25 Remote Assist and eight merge checks. Format, guardrails, lint, typecheck
and build pass. No dependencies, policy exceptions, commit or deployment added.

## Call surface polish — 2026-10-14

The white join line came from `shadow-raised-control` on both structural panels,
not a border or separator. Those shadows and the overlap/pseudo-element workaround
were removed; the matching backgrounds now meet directly. Call controls and keypad
digits use the semantic border without the bright raised outline. The override is
scoped to Phone Support; shared Button variants and global tokens are unchanged.

Ready audio/video recording cards now show the existing Tooltip primitive with
the label `Download`. The accessible button name and download behavior remain.
Browser checks confirm the join has no border/shadow, controls have no visible
shadow and use the dark border token, mute/hold/minimize/expand work, the mobile
panel retains 16px margins without overflow, and the tooltip and WAV download work.
Evidence: ignored `output/playwright/call-seam-*.png` and
`output/playwright/call-download-tooltip.png`.
