import type { TicketPriority } from "@/lib/tickets/types"

export type InboxStatus =
  | "unassigned"
  | "open"
  | "waiting"
  | "snoozed"
  | "resolved"

export type InboxView = "mine" | "unassigned" | "all-open" | "snoozed"

export type InboxSlaState = "on-track" | "at-risk" | "breached"

export type InboxMessage = {
  id: string
  author: string
  role: "customer" | "agent"
  body: string
  sentAt: string
  isNew?: boolean
}

export type InboxEvent = {
  id: string
  title: string
  body: string
  time: string
  position: "before" | "after"
}

export type InboxItem = {
  id: string
  ticketId: string
  ticketNumber: string
  customer: string
  contact: string
  displayOrder?: number
  accountName: string
  subject: string
  latestUpdate: string
  updatedAt: string
  owner?: string
  status: InboxStatus
  priority: TicketPriority
  slaState: InboxSlaState
  slaLabel?: string
  unread: boolean
  mine: boolean
  returnedFromSnooze?: boolean
  messages: InboxMessage[]
  events?: InboxEvent[]
}
