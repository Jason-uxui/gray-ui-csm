import {
  IconBook2,
  IconInfoCircle,
  IconUsers,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import type { TicketDetailTab } from "@/lib/tickets/detail-data"
import type { Ticket } from "@/lib/tickets/types"
export {
  getTicketInitials as getInitials,
  ticketChannelLabel as channelLabel,
  ticketPriorityLabel as priorityLabel,
  ticketStatusLabel as statusLabel,
  ticketStatusToneClassName as statusToneClassName,
} from "@/lib/tickets/presentation"

export const detailTabs: Array<{ value: TicketDetailTab; label: string }> = [
  { value: "conversation", label: "Conversation" },
  { value: "task", label: "Task" },
  { value: "activity", label: "Activity" },
  { value: "notes", label: "Notes" },
]

export type RightPanelSection = "details" | "people" | "knowledge"

export const rightPanelSections: Array<{
  value: RightPanelSection
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { value: "details", label: "Ticket Details", icon: IconInfoCircle },
  { value: "people", label: "People", icon: IconUsers },
  { value: "knowledge", label: "Knowledge Base", icon: IconBook2 },
]

export const macroSuggestions = [
  "Thanks for the update. I am pulling the latest account context now.",
  "I have reviewed the ticket and I am aligning the next step with the account plan.",
  "If you can share the latest customer impact, I can tighten the follow-up summary.",
  "I will send back the blocker, owner, and ETA so the CSM team can close the loop.",
]

export function getTicketNumberLabel(ticket: Ticket) {
  return ticket.ticketNumber.startsWith("#-")
    ? `#TC-${ticket.ticketNumber.slice(2)}`
    : ticket.ticketNumber
}

export function getTicketTypeLabel(ticket: Ticket) {
  const ticketType = ticket.ticketType ?? "incident"

  return ticketType.charAt(0).toUpperCase() + ticketType.slice(1)
}

export function getAssigneePerson(ticket: Ticket) {
  if (ticket.assignee) return ticket.assignee

  return {
    name: "Unassigned",
    email: "unassigned@graycsm.example",
  }
}
