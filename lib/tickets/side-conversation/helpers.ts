import { teammates } from "./mock-data"
import type { SideConversationMode } from "./types"
import type { Ticket } from "../types"

export function filterTeammates(query: string) {
  const value = query.trim().toLowerCase()
  return teammates.filter((person) =>
    `${person.name} ${person.email} ${person.role}`
      .toLowerCase()
      .includes(value)
  )
}
export function getChildTicketCandidates(ticket: Ticket, available: Ticket[]) {
  return available
    .filter(
      (candidate) =>
        candidate.id !== ticket.id && candidate.category === ticket.category
    )
    .slice(0, 2)
}
export function readSideConversationLocation(params: {
  get: (key: string) => string | null
}) {
  const side = params.get("side")
  const active = side === "thread" || side === "email" || side === "children"
  const mode: SideConversationMode = active ? side : "thread"
  const personId = params.get("teammate")
  return {
    active,
    mode,
    target:
      mode === "thread" && teammates.some((person) => person.id === personId)
        ? personId
        : null,
  }
}
export function messageTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}
