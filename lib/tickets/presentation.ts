import type {
  TicketChannel,
  TicketHealth,
  TicketPriority,
  TicketQueueStatus,
} from "@/lib/tickets/types"

export const ticketStatusLabel: Record<TicketQueueStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
}

export const ticketStatusToneClassName: Record<TicketQueueStatus, string> = {
  open: "border-[var(--status-open-border)] bg-[var(--status-open-background)] text-[var(--status-open-foreground)]",
  pending:
    "border-[var(--status-pending-border)] bg-[var(--status-pending-background)] text-[var(--status-pending-foreground)]",
  resolved:
    "border-[var(--status-resolved-border)] bg-[var(--status-resolved-background)] text-[var(--status-resolved-foreground)]",
  closed:
    "border-[var(--status-closed-border)] bg-[var(--status-closed-background)] text-[var(--status-closed-foreground)]",
}

export const ticketChannelLabel: Record<TicketChannel, string> = {
  email: "Email",
  chat: "Chat",
  slack: "Slack",
}

export const ticketPriorityLabel: Record<TicketPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  todo: "Todo",
}

export const ticketPriorityIndicatorToneClassName: Record<
  TicketPriority,
  string
> = {
  urgent: "text-red-600 dark:text-red-400",
  high: "text-orange-600 dark:text-orange-400",
  medium: "text-sky-600 dark:text-sky-400",
  low: "text-zinc-500 dark:text-zinc-400",
  todo: "text-zinc-400 dark:text-zinc-500",
}

export const ticketHealthLabel: Record<TicketHealth, string> = {
  "on-track": "On track",
  warning: "Warning",
  breached: "Breached",
}

export const ticketHealthToneClassName: Record<TicketHealth, string> = {
  warning:
    "border-amber-200 bg-amber-100 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/60 dark:text-orange-300",
  breached:
    "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300",
  "on-track":
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
}

export const ticketHealthDotClassName: Record<TicketHealth, string> = {
  warning: "bg-orange-500 dark:bg-orange-400",
  breached: "bg-rose-600 dark:bg-rose-400",
  "on-track": "bg-zinc-700 dark:bg-zinc-300",
}

export function getTicketInitials(name?: string) {
  if (!name) return "--"

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
