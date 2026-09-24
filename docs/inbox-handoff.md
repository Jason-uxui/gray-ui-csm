# Inbox workspace handoff

Source: [Desktop / Light](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0/-Internal--UXUI---Gray-CSM--v2-?node-id=2124-12576) and [Narrow examples](https://www.figma.com/design/sFoSM9QLUXjDWXy1JsmtN0/-Internal--UXUI---Gray-CSM--v2-?node-id=2161-1384). This document records implementation decisions for the static Figma examples; it does not imply that interactions were tested in Figma.

## What to build

- Preserve the shared app shell and the 360px Inbox sidebar on desktop. The sidebar contains views, search/filter controls, and conversation rows; the selected conversation owns the main content area.
- Conversation rows are 48px high with a 24px contact avatar, contact name, one-line preview, and an independent unread indicator. The avatar is a generic placeholder until a real contact image is available; it must not replace the contact name. Selected and unread states remain distinct.
- The desktop detail has the account title, ticket/owner metadata, priority and SLA cues, icon-only operational actions with accessible names/tooltips, a readable event timeline, and a reply composer.
- Below 768px, show either the list or the selected detail, not both. Back returns to the list. The list uses a 16px horizontal inset, a full-width search control, and 40px header controls. The detail uses 16px header/composer insets and a scrollable timeline.
- From 768px to 1023px, keep the two-column workspace but use a compact detail header and the same more-actions menu as mobile. The full metadata/action row returns at 1024px. This is a code QA adaptation for the fixed 360px sidebar; the Figma examples do not include a tablet frame.

## Interaction mapping

| Control                              | Desktop                                    | Narrow                                            |
| ------------------------------------ | ------------------------------------------ | ------------------------------------------------- |
| Search                               | Popover with recent/matching conversations | List search field                                 |
| Priority / status                    | Filter menu with submenus                  | The same filter menu                              |
| Assign, snooze, resolve, full ticket | Header icon buttons with tooltips          | More-actions menu in the detail header            |
| Reply                                | Bottom composer                            | Bottom composer; Send disabled for an empty draft |

The search popover adapts the user's Codex reference to Inbox data: recent conversations appear below the input, and typing filters contacts, companies, subjects, and ticket IDs within the current view. Choosing a result selects that conversation and closes the popover. The filter menu keeps Priority and Status in nested choices and includes Clear filters. These open states are implementation decisions because the Figma examples show only their closed states; do not add unrelated Codex quick actions or new Inbox operations without a product decision.

## Data and state

- Keep contact name, account, ticket number, subject/preview, unread, status, priority, SLA, owner, messages, and timestamps separate. Avoid repeating the account name in the row's contact field.
- A missing photo uses the placeholder avatar. A missing preview truncates the subject. A read row shows its updated time; an unread row shows its dot. Long names/previews truncate without obscuring actions.
- Search and filters operate on the same collection on desktop and mobile. Selection, view counts, and actions update together. Empty results need a clear message and a way to clear filters.

## QA gates

- Design QA: compare desktop and 390px examples, spacing, row density, icon semantics, hierarchy, and text truncation; inspect Light and Dark.
- Code QA: verify view/filter/search selection, mobile list/detail/back behavior, action menus, reply, keyboard/focus/labels, empty results, and widths around the 768px breakpoint.
- Not specified by the static Figma examples: actual photo sourcing, long-thread virtualization, persistence/backend, and detailed failure/loading states. These remain separate follow-ups, not silently implied by this visual sync.
- The Inbox composer now shares the Ticket Detail shell. Sender selection and Macros work in the local preview; formatting, emoji, attachments, voice, images, and End Chat show preview-only feedback until their behavior and data contracts are specified. Sending a reply still updates only local Inbox state.
- The 24px empty contact avatar follows Figma's `base/muted` and `base/muted-foreground` in both themes, with the exported silhouette at 44% opacity and a white 54% inner shadow (x 0, y 2, blur 3.1). Inbox-scoped token aliases keep this mapping intact without changing the app-wide muted colors.
- The Inbox and Tickets pages currently use separate mock records. “Open full ticket” therefore shows preview-only feedback instead of navigating to an unrelated record. Before enabling that link, map each conversation to the same ticket record in both pages. Reply and action changes also currently live only in client state.
