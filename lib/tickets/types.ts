export type TicketQueueStatus = "open" | "pending" | "resolved" | "closed"

export type TicketHealth = "warning" | "breached" | "on-track"

export type TicketChannel = "email" | "chat" | "slack"

export type TicketTrend = "up" | "down" | "flat"

export type TicketPriority = "urgent" | "high" | "medium" | "low" | "todo"

export type TicketViewKey =
  | "all"
  | "mine"
  | "unassigned"
  | "past-due"
  | "escalated"

export type TicketLayoutMode = "board" | "table"

export type TicketCategoryKey =
  | "billing"
  | "technical"
  | "account-login"
  | "subscription"
  | "other"

export interface TicketAssignee {
  name: string
  avatarUrl?: string
}

export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  queueStatus: TicketQueueStatus
  boardOrder: number
  health: TicketHealth
  channel: TicketChannel
  trend: TicketTrend
  assignee?: TicketAssignee
  category: TicketCategoryKey
  priority: TicketPriority
  mine: boolean
  escalated: boolean
  pastDue: boolean
}

export interface TicketStat {
  key: "total" | "open" | "pending" | "resolved"
  label: string
  value: number
  previousValue: number
  delta: number
  deltaPercent: number
  trend: TicketTrend
  comparison: string
}

export interface TicketBoardColumn {
  key: TicketQueueStatus
  label: string
}

export interface TicketSidebarItem {
  key: string
  label: string
  count: number
}

export interface TicketSidebarGroup {
  key: "views" | "categories" | "priority"
  label: string
  items: TicketSidebarItem[]
}
