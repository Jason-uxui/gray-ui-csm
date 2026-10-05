"use client"

import type { Dispatch, SetStateAction } from "react"
import { currentUser } from "@/lib/current-user"
import type { Ticket, TicketPerson } from "@/lib/tickets/types"
import type { TicketTimelineItem } from "@/lib/tickets/detail-data"

export function useTicketAssignment({
  ticket,
  setTicket,
  setTimeline,
  notify,
}: {
  ticket: Ticket
  setTicket: Dispatch<SetStateAction<Ticket>>
  setTimeline: Dispatch<SetStateAction<TicketTimelineItem[]>>
  notify: (message: string) => void
}) {
  const handleTransfer = (nextAgent: TicketPerson) => {
    if (nextAgent.name === ticket.assignee?.name) return
    const previousName = ticket.assignee?.name ?? "Unassigned"
    setTicket((current) => ({
      ...current,
      assignee: nextAgent,
      mine: nextAgent.name === currentUser.name,
    }))
    setTimeline((current) => [
      ...current,
      {
        id: `transfer-${crypto.randomUUID()}`,
        kind: "event",
        timestamp: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
        title: `${currentUser.name} transferred this ticket`,
        detail: `From ${previousName} to ${nextAgent.name}`,
        tone: "success",
      },
    ])
    notify(`Ticket transferred to ${nextAgent.name}`)
  }
  const handleFollowersChange = (followers: TicketPerson[]) => {
    setTicket((current) => ({ ...current, followers }))
  }
  return { handleTransfer, handleFollowersChange }
}
