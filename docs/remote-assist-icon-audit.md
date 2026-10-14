# Support icon control audit — 2026-10-14

Remote Assist and Phone Support opt into the reusable `TooltipButton` composition.
It derives the tooltip from the accessible label unless an explicit label is
supplied, uses the existing Tooltip/Button primitives, and keeps tooltips above
dialogs. Disabled controls have a non-interactive hover target. Separate trigger
identities prevent stale hover handlers when the control becomes enabled.

Coverage includes invitation close/remove, copy link/code, menu, responsive
back/control/panel actions, microphone/camera, screenshot/full screen, panel rail
and sheet sections/close, composer formatting/emoji/cancel reply/attachments,
phone minimize/expand/keypad/hold/end, audio play/pause, video play/close,
download, session-log close and notification dismissal. People/Knowledge actions
also opt in when shown in the Remote Assist sidebar.

Ordinary support controls share semantic border, hover, pressed/expanded and
keyboard-focus styles. The bright raised outline is suppressed locally, while
the keyboard focus ring remains visible at 2px. Primary playback and call-ending
actions retain their distinct semantic colors. No global Button variant or theme
token was changed for this audit.

Shared panel/composer/emoji/people/knowledge components keep `iconTooltips=false`
and their existing styles by default. Only Remote Assist enables the new options.
Browser regression checks confirm regular Ticket/Customer Notes keep their
avatars and Details headings, and regular panel buttons remain plain Buttons.

Validation: 41 hover-label checks across desktop/mobile, plus keyboard message
send, formatting/emoji menus, control/camera pressed states, disabled hover,
reply cancellation, video close and measured hover/focus styling. The 41 checks
also pass on a separate production preview based on current `origin/master`
(`bed9053`), after resolving additive integration conflicts with the two already
merged agent-transfer/side-conversation updates. The user preview stays on 3000.

Frozen installation, format, token/route guardrails, lint, typecheck and build pass
on that integration checkout. Behavior tests: 25 Remote Assist, 6 Knowledge Base
storage, 8 ticket merge, 4 existing Side Conversation; 43 total. Screenshots are
ignored artifacts under `output/playwright/icon-only-*`.

Publication permission for supplied assets was confirmed by the repository owner.
Native Safari, real services/devices and exhaustive accessibility remain outside
this validation. GitHub master is protected; delivery uses a PR and waits for its
required check, without an administrator bypass.
