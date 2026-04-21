import { currentUser } from "@/lib/current-user"
import type {
  Ticket,
  TicketLayoutMode,
  TicketPriority,
  TicketQueueStatus,
  TicketStat,
  TicketTrend,
  TicketViewKey,
} from "@/lib/tickets/types"

export const ALLOWED_VIEWS: TicketViewKey[] = [
  "all",
  "mine",
  "unassigned",
  "past-due",
  "escalated",
]

export const ALLOWED_LAYOUTS: TicketLayoutMode[] = ["board", "table"]

export const bulkStatusOptions: TicketQueueStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
]

export const bulkPriorityOptions: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]

export const bulkStatusLabel: Record<TicketQueueStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
}

export const NEW_TICKET_ID = "__new-ticket__"

export function createDraftTicket(nextIndex: number): Ticket {
  const paddedIndex = String(nextIndex).padStart(3, "0")

  return {
    id: NEW_TICKET_ID,
    ticketNumber: `#-${paddedIndex}`,
    subject: "",
    queueStatus: "open",
    boardOrder: 0,
    health: "on-track",
    channel: "email",
    trend: "flat",
    requester: undefined,
    assignee: {
      name: currentUser.name,
      avatarUrl: currentUser.avatar,
      email: currentUser.email,
    },
    followers: [],
    tags: [],
    ticketType: "incident",
    category: "other",
    priority: "medium",
    mine: true,
    escalated: false,
    pastDue: false,
  }
}

export function getNextTicketSequence(sourceTickets: Ticket[]) {
  return (
    sourceTickets.reduce((maxValue, ticket) => {
      const numericPart = Number(ticket.id.replace(/[^\d]/g, ""))
      return Number.isFinite(numericPart)
        ? Math.max(maxValue, numericPart)
        : maxValue
    }, 0) + 1
  )
}

export function getViewFromSearchParam(view: string | null): TicketViewKey {
  if (view && ALLOWED_VIEWS.includes(view as TicketViewKey)) {
    return view as TicketViewKey
  }

  return "all"
}

export function getLayoutFromSearchParam(
  layout: string | null
): TicketLayoutMode {
  if (layout && ALLOWED_LAYOUTS.includes(layout as TicketLayoutMode)) {
    return layout as TicketLayoutMode
  }

  return "board"
}

function calculateTrend(
  current: number,
  previous: number
): Pick<TicketStat, "delta" | "deltaPercent" | "trend"> {
  const delta = current - previous
  const deltaPercent =
    previous === 0
      ? current === 0
        ? 0
        : 100
      : Number(((delta / previous) * 100).toFixed(1))
  const trend: TicketTrend = delta > 0 ? "up" : delta < 0 ? "down" : "flat"

  return { delta, deltaPercent, trend }
}

export function buildStats(sourceTickets: Ticket[]): TicketStat[] {
  const total = sourceTickets.length
  const open = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "open"
  ).length
  const pending = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "pending"
  ).length
  const resolved = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "resolved"
  ).length

  const previousByKey = {
    total: Math.max(total - 3, 0),
    open: Math.max(open + 2, 0),
    pending: Math.max(pending + 1, 0),
    resolved: Math.max(resolved - 2, 0),
  }

  const totalTrend = calculateTrend(total, previousByKey.total)
  const openTrend = calculateTrend(open, previousByKey.open)
  const pendingTrend = calculateTrend(pending, previousByKey.pending)
  const resolvedTrend = calculateTrend(resolved, previousByKey.resolved)

  return [
    {
      key: "total",
      label: "Total Tickets",
      value: total,
      previousValue: previousByKey.total,
      ...totalTrend,
      comparison: "vs last week",
    },
    {
      key: "open",
      label: "Open",
      value: open,
      previousValue: previousByKey.open,
      ...openTrend,
      comparison: "vs last week",
    },
    {
      key: "pending",
      label: "Pending",
      value: pending,
      previousValue: previousByKey.pending,
      ...pendingTrend,
      comparison: "vs last week",
    },
    {
      key: "resolved",
      label: "Resolved",
      value: resolved,
      previousValue: previousByKey.resolved,
      ...resolvedTrend,
      comparison: "vs last week",
    },
  ]
}

export function sortTicketsByBoardOrder(sourceTickets: Ticket[]) {
  return [...sourceTickets].sort((leftTicket, rightTicket) => {
    if (leftTicket.boardOrder === rightTicket.boardOrder) {
      return leftTicket.id.localeCompare(rightTicket.id)
    }

    return leftTicket.boardOrder - rightTicket.boardOrder
  })
}
