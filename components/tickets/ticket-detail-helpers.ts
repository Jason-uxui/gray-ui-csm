import {
  IconBook2,
  IconInfoCircle,
  IconUsers,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import type { TicketDetailTab } from "@/lib/tickets/detail-data"
import type {
  Ticket,
  TicketChannel,
  TicketPriority,
  TicketQueueStatus,
} from "@/lib/tickets/types"

export const detailTabs: Array<{ value: TicketDetailTab; label: string }> = [
  { value: "conversation", label: "Conversation" },
  { value: "task", label: "Task" },
  { value: "activity", label: "Activity Logs" },
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

export const statusLabel: Record<TicketQueueStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
}

export const statusToneClassName: Record<TicketQueueStatus, string> = {
  open: "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
  pending:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  resolved:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  closed:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
}

export const channelLabel: Record<TicketChannel, string> = {
  email: "Email",
  chat: "Chat",
  slack: "Slack",
}

export const priorityLabel: Record<TicketPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  todo: "Todo",
}

export const macroSuggestions = [
  "Thanks for the update. I am pulling the latest account context now.",
  "I have reviewed the ticket and I am aligning the next step with the account plan.",
  "If you can share the latest customer impact, I can tighten the follow-up summary.",
  "I will send back the blocker, owner, and ETA so the CSM team can close the loop.",
]

export function getInitials(name?: string) {
  if (!name) return "--"

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

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
