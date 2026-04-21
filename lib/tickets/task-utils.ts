import type {
  TicketTask,
  TicketTaskDuePreset,
  TicketTaskStatus,
} from "./detail-data"
import type { TicketPerson } from "./types"

export const ticketTaskStatusOptions: Array<{
  value: TicketTaskStatus
  label: string
}> = [
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

export const ticketTaskDueOptions: Array<{
  value: TicketTaskDuePreset
  label: string
}> = [
  { value: "none", label: "No due" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this-week", label: "This week" },
]

export const ticketTaskStatusLabel: Record<TicketTaskStatus, string> = {
  todo: "To do",
  "in-progress": "In Progress",
  done: "Done",
}

export const ticketTaskDueLabel: Record<TicketTaskDuePreset, string> = {
  none: "No due",
  today: "Today",
  tomorrow: "Tomorrow",
  "this-week": "This week",
}

export const ticketTaskStatusTextClassName: Record<TicketTaskStatus, string> = {
  todo: "text-muted-foreground",
  "in-progress": "text-amber-600",
  done: "text-emerald-600",
}

export const DEFAULT_TICKET_TASK_TITLE = "Untitled task"

const ticketTaskStoragePrefix = "gray-ui-csm:ticket-tasks"

export function getTicketTaskStorageKey(ticketId: string) {
  return `${ticketTaskStoragePrefix}:${ticketId}`
}

export function createTicketTaskId(ticketId: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${ticketId}-task-${crypto.randomUUID()}`
  }

  return `${ticketId}-task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createTicketTask({
  id,
  title,
  assignee,
}: {
  id: string
  title: string
  assignee?: TicketPerson
}): TicketTask {
  return {
    id,
    title,
    status: "todo",
    due: "none",
    assignee,
  }
}

export function isTicketTaskStatus(value: unknown): value is TicketTaskStatus {
  return value === "todo" || value === "in-progress" || value === "done"
}

export function isTicketTaskDuePreset(
  value: unknown
): value is TicketTaskDuePreset {
  return (
    value === "none" ||
    value === "today" ||
    value === "tomorrow" ||
    value === "this-week"
  )
}

function isPersistedTaskShape(value: unknown): value is TicketTask {
  if (!value || typeof value !== "object") return false

  const candidate = value as Record<string, unknown>

  return typeof candidate.id === "string" && typeof candidate.title === "string"
}

function toTicketPerson(value: unknown): TicketPerson | undefined {
  if (!value || typeof value !== "object") return undefined

  const candidate = value as Record<string, unknown>
  if (typeof candidate.name !== "string" || candidate.name.trim().length === 0) {
    return undefined
  }

  return {
    name: candidate.name,
    email: typeof candidate.email === "string" ? candidate.email : undefined,
    avatarUrl:
      typeof candidate.avatarUrl === "string" ? candidate.avatarUrl : undefined,
  }
}

function normalizePersistedTask(value: unknown): TicketTask | null {
  if (!isPersistedTaskShape(value)) return null

  const candidate = value as {
    id: string
    title: string
    status?: unknown
    due?: unknown
    assignee?: unknown
    completed?: unknown
  }
  const legacyCompleted = candidate.completed === true

  return {
    id: candidate.id,
    title: candidate.title,
    status: isTicketTaskStatus(candidate.status)
      ? candidate.status
      : legacyCompleted
        ? "done"
        : "todo",
    due: isTicketTaskDuePreset(candidate.due) ? candidate.due : "none",
    assignee: toTicketPerson(candidate.assignee),
  }
}

export function parsePersistedTicketTasks(
  rawValue: string | null
): TicketTask[] | null {
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as unknown
    if (!Array.isArray(parsed)) return null

    return parsed
      .map((entry) => normalizePersistedTask(entry))
      .filter((entry): entry is TicketTask => entry !== null)
  } catch {
    return null
  }
}
