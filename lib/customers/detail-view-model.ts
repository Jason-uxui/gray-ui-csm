import type {
  Customer,
  CustomerRecentTicket,
  CustomerTicketPriority,
} from "@/lib/customers/types"

export type CustomerDetailTab = "ticket" | "activity" | "attachment" | "notes"
export type CustomerTicketType = "support" | "billing" | "technical"
export type CustomerTicketTypeFilter = "all" | CustomerTicketType
export type CustomerTicketPriorityFilter = "all" | CustomerTicketPriority

export type CustomerDetailMetric = {
  key: string
  label: string
  value: string
  helper?: string
  tone?: "default" | "danger"
}

export type CustomerTicketRow = {
  id: string
  ticketNumber: string
  subject: string
  status: CustomerRecentTicket["status"]
  priority: CustomerTicketPriority
  type: CustomerTicketType
  requestDate: string
}

export type CustomerInternalNote = {
  id: string
  author: {
    name: string
    avatarUrl?: string
    email?: string
  }
  timestamp: string
  body: string
}

export const customerDetailTabs: CustomerDetailTab[] = [
  "ticket",
  "activity",
  "attachment",
  "notes",
]

export const customerTicketTypeFilterOptions: CustomerTicketTypeFilter[] = [
  "all",
  "support",
  "billing",
  "technical",
]

export const customerTicketPriorityFilterOptions: CustomerTicketPriorityFilter[] = [
  "all",
  "high",
  "medium",
  "low",
]

export const customerTicketTypeLabels: Record<CustomerTicketType, string> = {
  support: "Support",
  billing: "Billing",
  technical: "Technical",
}

const customerTicketTypes: CustomerTicketType[] = ["support", "billing", "technical"]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

const AVERAGE_RESPONSE_SECONDS_BY_HEALTH = {
  healthy: 2 * 60 + 15,
  watch: 8 * 60 + 30,
  at_risk: 25 * 60,
} as const

const RESPONSE_TREND_BY_HEALTH = {
  healthy: "-6%",
  watch: "+4%",
  at_risk: "+12%",
} as const

function formatResponseDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

function inferTicketType(ticket: CustomerRecentTicket, index: number): CustomerTicketType {
  const subject = ticket.subject.toLowerCase()

  if (
    subject.includes("invoice") ||
    subject.includes("billing") ||
    subject.includes("contract") ||
    subject.includes("renewal")
  ) {
    return "billing"
  }

  if (
    subject.includes("api") ||
    subject.includes("automation") ||
    subject.includes("webhook") ||
    subject.includes("export") ||
    subject.includes("rules")
  ) {
    return "technical"
  }

  return customerTicketTypes[index % customerTicketTypes.length]
}

export function normalizeCustomerDetailTab(value: string | null | undefined): CustomerDetailTab {
  if (value && customerDetailTabs.includes(value as CustomerDetailTab)) {
    return value as CustomerDetailTab
  }

  return "ticket"
}

export function normalizeCustomerTicketTypeFilter(
  value: string | null | undefined
): CustomerTicketTypeFilter {
  if (
    value &&
    customerTicketTypeFilterOptions.includes(value as CustomerTicketTypeFilter)
  ) {
    return value as CustomerTicketTypeFilter
  }

  return "all"
}

export function normalizeCustomerTicketPriorityFilter(
  value: string | null | undefined
): CustomerTicketPriorityFilter {
  if (
    value &&
    customerTicketPriorityFilterOptions.includes(
      value as CustomerTicketPriorityFilter
    )
  ) {
    return value as CustomerTicketPriorityFilter
  }

  return "all"
}

export function buildCustomerDetailMetrics(customer: Customer): CustomerDetailMetric[] {
  const averageResponseSeconds = AVERAGE_RESPONSE_SECONDS_BY_HEALTH[customer.health]

  return [
    {
      key: "open-tickets",
      label: "Open tickets",
      value: String(customer.openTickets),
      tone: customer.openTickets >= 4 ? "danger" : "default",
    },
    {
      key: "csat",
      label: "CSAT",
      value: customer.csat.toFixed(1),
      helper: customer.health === "healthy" ? "Healthy account" : undefined,
      tone: customer.csat < 4 ? "danger" : "default",
    },
    {
      key: "arr",
      label: "ARR",
      value: formatCurrency(customer.annualValue),
    },
    {
      key: "avg-response-time",
      label: "Avg. response time",
      value: formatResponseDuration(averageResponseSeconds),
      helper: RESPONSE_TREND_BY_HEALTH[customer.health],
      tone: customer.health === "at_risk" ? "danger" : "default",
    },
  ]
}

export function buildCustomerTicketRows(customer: Customer): CustomerTicketRow[] {
  return customer.recentTickets.map((ticket, index) => ({
    id: ticket.id,
    ticketNumber: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    type: inferTicketType(ticket, index),
    requestDate: ticket.requestDate,
  }))
}

export function buildCustomerInternalNotes(
  customer: Customer
): CustomerInternalNote[] {
  const seedBody = customer.notes.trim()
  if (seedBody.length === 0) return []

  return [
    {
      id: `${customer.id}-internal-note-seed`,
      author: customer.owner,
      timestamp: customer.lastTouchLabel,
      body: seedBody,
    },
  ]
}
