import { currentUser } from "@/lib/current-user"
import type { Ticket, TicketChannel, TicketPerson } from "@/lib/tickets/types"

export type TicketDetailTab = "conversation" | "task" | "activity" | "notes"

export type TicketTimelineMessage = {
  id: string
  kind: "message"
  timestamp: string
  direction: "inbound" | "outbound"
  author: TicketPerson
  channel: TicketChannel
  body: string
}

export type TicketTimelineEvent = {
  id: string
  kind: "event"
  timestamp: string
  title: string
  detail: string
  tone?: "neutral" | "success" | "warning"
}

export type TicketTimelineNote = {
  id: string
  kind: "note"
  timestamp: string
  author: TicketPerson
  body: string
}

export type TicketTimelineItem =
  | TicketTimelineMessage
  | TicketTimelineEvent
  | TicketTimelineNote

export type TicketTaskStatus = "todo" | "in-progress" | "done"

export type TicketTaskDuePreset = "none" | "today" | "tomorrow" | "this-week"

export type TicketTask = {
  id: string
  title: string
  status: TicketTaskStatus
  due: TicketTaskDuePreset
  assignee?: TicketPerson
}

export type TicketNote = {
  id: string
  author: TicketPerson
  timestamp: string
  body: string
}

export type TicketDetail = {
  customer: TicketPerson
  accountName: string
  openedAt: string
  responseSla: string
  nextDue: string
  timeline: TicketTimelineItem[]
  tasks: TicketTask[]
  notes: TicketNote[]
}

type TicketScenario = {
  opener: string
  reply1: string
  reply2: string
  followUp: string
  internal: string
}

const customerPool: TicketPerson[] = [
  {
    name: "Amina Rahman",
    email: "amina@pinepeak.example",
  },
  {
    name: "Leo Martinez",
    email: "leo@cedargrowth.example",
  },
  {
    name: "Hanh Nguyen",
    email: "hanh@northstarhealth.example",
  },
  {
    name: "Priya Desai",
    email: "priya@marlowe.example",
  },
]

const accountPool = [
  "Pine & Peak Retail",
  "Cedar Growth Studio",
  "Northstar Health Ops",
  "Marlowe Logistics",
]

function getTicketSeedIndex(ticketId: string) {
  const numericPart = Number(ticketId.replace(/[^\d]/g, ""))
  return Number.isFinite(numericPart) && numericPart > 0 ? numericPart : 1
}

function pickFromPool<T>(ticketId: string, values: T[]) {
  const index = (getTicketSeedIndex(ticketId) - 1) % values.length
  return values[index]
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getSupportAgent(): TicketPerson {
  return {
    name: currentUser.name,
    email: currentUser.email,
    avatarUrl: currentUser.avatar,
  }
}

function getScenario(ticket: Ticket, accountName: string): TicketScenario {
  switch (ticket.category) {
    case "billing":
      return {
        opener: `We are trying to close our monthly account review for ${accountName}, but the finance breakdown behind "${ticket.subject}" is still unclear. Can your team help us confirm the right number to share with the customer?`,
        reply1:
          "I am pulling the billing timeline, the current invoice state, and any adjustments that would affect the review summary.",
        reply2:
          "Once I confirm the billing detail, I will send back a customer-ready recap with the exact next step.",
        followUp:
          "Perfect. We need the recap before tomorrow's conversion review, so a concise summary will help.",
        internal:
          "Billing detail is blocking the account review wrap-up. Confirm credits, renewal timing, and what CSM can safely promise.",
      }
    case "technical":
      return {
        opener: `I am preparing an account review for ${accountName}, and "${ticket.subject}" is showing up as the main blocker to adoption. I need a clear status update and the next action the customer can take.`,
        reply1:
          "Thanks for flagging it. I am checking the recent product signals, the latest repro details, and whether there is an active workaround we can share today.",
        reply2:
          "I can package the current status into a short action plan so your review stays focused on resolution and timing.",
        followUp:
          "That works. If you can include owner plus ETA, I can align the customer success follow-up from there.",
        internal:
          "Technical blocker is now part of the account health conversation. Need a crisp owner, ETA, and workaround before the next customer touchpoint.",
      }
    case "account-login":
      return {
        opener: `Our champion at ${accountName} is getting stuck on "${ticket.subject}" right before a training handoff. We need to unlock the account path so the rollout does not slip.`,
        reply1:
          "I am reviewing the access history, current permissions, and whether we need an admin action or a reset from our side.",
        reply2:
          "As soon as I confirm the right path, I will send you a step-by-step update that is safe to forward to the customer.",
        followUp:
          "Thanks. The team is waiting on enablement next, so a forwardable answer will help keep the conversion motion on track.",
        internal:
          "Access issue is affecting activation timing. Confirm who owns the unblock and whether a customer admin or support action is required.",
      }
    case "subscription":
      return {
        opener: `We are in a growth review with ${accountName}, and "${ticket.subject}" is part of the expansion conversation. I need a clear recommendation before we present options back to the customer.`,
        reply1:
          "I am checking the current plan state, renewal timing, and any commercial constraints that should shape the recommendation.",
        reply2:
          "I will send back the recommended path and the tradeoffs so the review can end with a concrete next step.",
        followUp:
          "Great. If the recommendation affects timing or ownership, include that too so we can keep the account plan realistic.",
        internal:
          "Expansion discussion needs a customer-success framing, not just policy details. Tie the recommendation to timing, owner, and rollout impact.",
      }
    default:
      return {
        opener: `I am using this ticket to prepare the next account review for ${accountName}. "${ticket.subject}" still needs a cleaner resolution path before we close the loop with the customer.`,
        reply1:
          "I am reviewing the latest context and I will narrow it into a concise summary with the next best action.",
        reply2:
          "I can shape the follow-up so it works for both the customer update and the internal handoff.",
        followUp:
          "Helpful. Please keep the update brief enough that we can reuse it in the review notes.",
        internal:
          "General account-review follow-up. Need a short summary, named owner, and next milestone before the ticket can be wrapped.",
      }
  }
}

export function buildTicketDetail(ticket: Ticket): TicketDetail {
  const customer = pickFromPool(ticket.id, customerPool)
  const accountName = pickFromPool(ticket.id, accountPool)
  const agent = getSupportAgent()
  const scenario = getScenario(ticket, accountName)
  const priorityLabel = titleCase(ticket.priority)
  const ticketTypeLabel = titleCase(ticket.ticketType ?? "incident")
  const channelLabel = titleCase(ticket.channel)

  const timeline: TicketTimelineItem[] = [
    {
      id: `${ticket.id}-created`,
      kind: "event",
      timestamp: "9:05 AM",
      title: "Ticket created",
      detail: `${customer.name} opened the thread from ${accountName} via ${channelLabel}.`,
      tone: "neutral",
    },
    {
      id: `${ticket.id}-message-1`,
      kind: "message",
      timestamp: "9:12 AM",
      direction: "inbound",
      author: customer,
      channel: ticket.channel,
      body: scenario.opener,
    },
    {
      id: `${ticket.id}-message-2`,
      kind: "message",
      timestamp: "9:18 AM",
      direction: "outbound",
      author: agent,
      channel: ticket.channel,
      body: scenario.reply1,
    },
    {
      id: `${ticket.id}-message-3`,
      kind: "message",
      timestamp: "9:26 AM",
      direction: "inbound",
      author: customer,
      channel: ticket.channel,
      body: scenario.followUp,
    },
    {
      id: `${ticket.id}-message-4`,
      kind: "message",
      timestamp: "9:34 AM",
      direction: "outbound",
      author: agent,
      channel: ticket.channel,
      body: scenario.reply2,
    },
    {
      id: `${ticket.id}-priority-change`,
      kind: "event",
      timestamp: "10:02 AM",
      title: `Priority updated to ${priorityLabel}`,
      detail: `The account review is currently tracking this as a ${priorityLabel.toLowerCase()} item.`,
      tone:
        ticket.priority === "urgent" || ticket.priority === "high"
          ? "warning"
          : "neutral",
    },
    {
      id: `${ticket.id}-type-change`,
      kind: "event",
      timestamp: "10:09 AM",
      title: `Ticket type confirmed as ${ticketTypeLabel}`,
      detail: `The working category remains ${titleCase(ticket.category)} for triage and reporting.`,
      tone: "neutral",
    },
    {
      id: `${ticket.id}-note`,
      kind: "note",
      timestamp: "10:16 AM",
      author: agent,
      body: scenario.internal,
    },
  ]

  const tasks: TicketTask[] = [
    {
      id: `${ticket.id}-task-1`,
      title: "Confirm the outcome needed for the account review",
      status: "done",
      due: "today",
      assignee: agent,
    },
    {
      id: `${ticket.id}-task-2`,
      title: "Pull account context before replying",
      status: "done",
      due: "today",
      assignee: agent,
    },
    {
      id: `${ticket.id}-task-3`,
      title: "Send the customer-ready follow-up",
      status: "in-progress",
      due: "tomorrow",
      assignee: {
        name: "CSM Lead",
        email: "csm-lead@opensource-demo.dev",
      },
    },
  ]

  const notes: TicketNote[] = [
    {
      id: `${ticket.id}-note-1`,
      author: agent,
      timestamp: "10:16 AM",
      body: scenario.internal,
    },
    {
      id: `${ticket.id}-note-2`,
      author: {
        name: "CSM Lead",
        email: "csm-lead@opensource-demo.dev",
      },
      timestamp: "10:24 AM",
      body: "Keep the next update outcome-focused. We only need the blocker, owner, ETA, and whether this changes the account plan.",
    },
  ]

  return {
    customer,
    accountName,
    openedAt: "Today, 9:05 AM",
    responseSla: "First response within 30 minutes",
    nextDue: "Today, 4:00 PM",
    timeline,
    tasks,
    notes,
  }
}
