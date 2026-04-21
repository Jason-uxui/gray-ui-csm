export type TicketQueueStatus = "open" | "pending" | "resolved" | "closed"

export type TicketHealth = "warning" | "breached" | "on-track"

export type TicketChannel = "email" | "chat" | "slack"

export type TicketTrend = "up" | "down" | "flat"

export type TicketPriority = "urgent" | "high" | "medium" | "low" | "todo"

export type TicketType = "incident" | "question" | "task" | "problem"

export type TicketViewKey =
  | "all"
  | "mine"
  | "unassigned"
  | "past-due"
  | "escalated"

export type TicketLayoutMode = "board" | "table"

export type TicketSubmitAction = "send" | "pending" | "resolved"

export type TicketDrawerOrigin = {
  x: number
  y: number
  width: number
  height: number
}

export type TicketCategoryKey =
  | "billing"
  | "technical"
  | "account-login"
  | "subscription"
  | "other"

export interface TicketPerson {
  name: string
  avatarUrl?: string
  email?: string
}

export type TicketAssignee = TicketPerson

export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  queueStatus: TicketQueueStatus
  boardOrder: number
  health: TicketHealth
  channel: TicketChannel
  trend: TicketTrend
  requester?: TicketPerson
  assignee?: TicketAssignee
  followers?: TicketPerson[]
  tags?: string[]
  ticketType?: TicketType
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
