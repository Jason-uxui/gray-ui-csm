import type { InboxView } from "@/lib/inbox/types"

export const inboxViews: InboxView[] = [
  "mine",
  "unassigned",
  "all-open",
  "snoozed",
]

export const inboxViewLabels: Record<InboxView, string> = {
  mine: "My inbox",
  unassigned: "Unassigned",
  "all-open": "All open",
  snoozed: "Snoozed",
}

export function getInboxView(value: string | null): InboxView {
  return inboxViews.find((view) => view === value) ?? "mine"
}
