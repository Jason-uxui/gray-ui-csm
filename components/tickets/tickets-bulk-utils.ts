import type { Ticket, TicketAssignee } from "@/lib/tickets/types"

const BULK_EXPORT_HEADERS = [
  "Ticket ID",
  "Subject",
  "Status",
  "Priority",
  "Assignee",
  "Requester",
  "Category",
  "Channel",
  "Health",
  "Escalated",
  "Past Due",
  "Tags",
]

const fileDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

function stringifyCsvCell(value: string) {
  const escapedValue = value.replace(/"/g, '""')
  if (
    escapedValue.includes(",") ||
    escapedValue.includes('"') ||
    escapedValue.includes("\n")
  ) {
    return `"${escapedValue}"`
  }
  return escapedValue
}

export function formatLocalDateForFilename(date = new Date()) {
  return fileDateFormatter.format(date)
}

export function buildBulkExportCsv(tickets: Ticket[]) {
  const rows = tickets.map((ticket) => [
    ticket.ticketNumber,
    ticket.subject,
    ticket.queueStatus,
    ticket.priority,
    ticket.assignee?.name ?? "",
    ticket.requester?.name ?? "",
    ticket.category,
    ticket.channel,
    ticket.health,
    ticket.escalated ? "yes" : "no",
    ticket.pastDue ? "yes" : "no",
    ticket.tags?.join("; ") ?? "",
  ])

  return [BULK_EXPORT_HEADERS, ...rows]
    .map((row) => row.map((cell) => stringifyCsvCell(cell)).join(","))
    .join("\n")
}

export function areTicketAssigneesEqual(
  left?: TicketAssignee,
  right?: TicketAssignee
) {
  return (
    (left?.name ?? "") === (right?.name ?? "") &&
    (left?.email ?? "") === (right?.email ?? "") &&
    (left?.avatarUrl ?? "") === (right?.avatarUrl ?? "")
  )
}
