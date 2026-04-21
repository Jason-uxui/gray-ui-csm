import type { TicketChannel, TicketHealth } from "@/lib/tickets/types"

export const ticketsPageSectionsCopy = {
  pageTitle: "Tickets",
  export: "Export",
  newTicket: "New Ticket",
  toggleTicketMetrics: "Toggle ticket metrics",
  exportTicketsAriaLabel: "Export tickets",
  openSortMenuAriaLabel: "Open sort menu",
  tableOptionsTriggerLabel: "Table options",
  clearSelectionAriaLabel: "Clear selection",
  changeStatus: "Change status",
  assign: "Assign",
  unassigned: "Unassigned",
  priority: "Priority",
  moreBulkActionsAriaLabel: "More bulk actions",
  health: "Health",
  channel: "Channel",
  escalated: "Escalated",
  pastDue: "Past due",
  setEscalated: "Set escalated",
  setNotEscalated: "Set not escalated",
  markPastDue: "Mark past due",
  markOnTime: "Mark on time",
  exportCsv: "Export CSV",
  exportSelectionAriaLabel: "Export selected tickets to CSV",
  delete: "Delete",
  deleteSelectionAriaLabel: "Delete selected tickets",
  selectAllVisible: (count: number) => `Select all ${count}`,
}

export function formatSelectedTicketsLabel(count: number) {
  return count === 1 ? "1 ticket selected" : `${count} tickets selected`
}

export const bulkHealthOptions: TicketHealth[] = [
  "on-track",
  "warning",
  "breached",
]
export const bulkChannelOptions: TicketChannel[] = ["email", "chat", "slack"]

export const bulkHealthLabel: Record<TicketHealth, string> = {
  "on-track": "On track",
  warning: "Warning",
  breached: "Breached",
}

export const bulkChannelLabel: Record<TicketChannel, string> = {
  email: "Email",
  chat: "Chat",
  slack: "Slack",
}
