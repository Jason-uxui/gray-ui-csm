import { getNextTicketSequence, sortTicketsByBoardOrder } from "@/components/tickets/tickets-page-helpers"
import type {
  Ticket,
  TicketQueueStatus,
  TicketSubmitAction,
} from "@/lib/tickets/types"

export function mergeVisibleTicketUpdates(
  sourceTickets: Ticket[],
  nextVisibleTickets: Ticket[]
) {
  const updates = new Map(nextVisibleTickets.map((ticket) => [ticket.id, ticket] as const))

  return sourceTickets.map((ticket) => updates.get(ticket.id) ?? ticket)
}

export function patchTicketById(
  sourceTickets: Ticket[],
  ticketId: string,
  updater: (ticket: Ticket) => Ticket
) {
  return sourceTickets.map((ticket) =>
    ticket.id === ticketId ? updater(ticket) : ticket
  )
}

export function patchTicketsByIds(
  sourceTickets: Ticket[],
  ticketIds: string[],
  updater: (ticket: Ticket) => Ticket
) {
  if (ticketIds.length === 0) return sourceTickets
  const selectedIds = new Set(ticketIds)

  return sourceTickets.map((ticket) =>
    selectedIds.has(ticket.id) ? updater(ticket) : ticket
  )
}

export function moveTicketToQueue(
  sourceTickets: Ticket[],
  ticketId: string,
  queueStatus: TicketQueueStatus,
  insertBeforeTicketId?: string | null
) {
  const movingTicket = sourceTickets.find((ticket) => ticket.id === ticketId)
  if (!movingTicket) return sourceTickets

  const sourceQueueStatus = movingTicket.queueStatus
  const sourceColumnTickets = sortTicketsByBoardOrder(
    sourceTickets.filter(
      (ticket) =>
        ticket.queueStatus === sourceQueueStatus && ticket.id !== ticketId
    )
  )
  const targetColumnTickets = sortTicketsByBoardOrder(
    sourceTickets.filter(
      (ticket) => ticket.queueStatus === queueStatus && ticket.id !== ticketId
    )
  )
  const nextTargetColumnTickets =
    sourceQueueStatus === queueStatus
      ? [...sourceColumnTickets]
      : [...targetColumnTickets]
  const insertIndex = insertBeforeTicketId
    ? nextTargetColumnTickets.findIndex(
        (ticket) => ticket.id === insertBeforeTicketId
      )
    : nextTargetColumnTickets.length

  nextTargetColumnTickets.splice(
    insertIndex === -1 ? nextTargetColumnTickets.length : insertIndex,
    0,
    {
      ...movingTicket,
      queueStatus,
    }
  )

  const nextSourceColumnTickets =
    sourceQueueStatus === queueStatus
      ? nextTargetColumnTickets
      : sourceColumnTickets
  const orderUpdates = new Map<
    string,
    Pick<Ticket, "queueStatus" | "boardOrder">
  >()

  nextSourceColumnTickets.forEach((ticket, index) => {
    orderUpdates.set(ticket.id, {
      queueStatus:
        sourceQueueStatus === queueStatus ? queueStatus : sourceQueueStatus,
      boardOrder: index,
    })
  })

  if (sourceQueueStatus !== queueStatus) {
    nextTargetColumnTickets.forEach((ticket, index) => {
      orderUpdates.set(ticket.id, {
        queueStatus,
        boardOrder: index,
      })
    })
  }

  return sourceTickets.map((ticket) => {
    const update = orderUpdates.get(ticket.id)

    if (!update) return ticket

    return {
      ...ticket,
      queueStatus: update.queueStatus,
      boardOrder: update.boardOrder,
    }
  })
}

export function createSubmittedTicket(
  sourceTickets: Ticket[],
  draftTicket: Ticket,
  subject: string
) {
  const nextSequence = getNextTicketSequence(sourceTickets)
  const paddedIndex = String(nextSequence).padStart(3, "0")
  const openTicketCount = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "open"
  ).length

  return [
    {
      ...draftTicket,
      id: `t-${paddedIndex}`,
      ticketNumber: `#-${paddedIndex}`,
      subject,
      boardOrder: openTicketCount,
    },
    ...sourceTickets,
  ]
}

export function getQueueStatusAfterSubmit(
  currentStatus: TicketQueueStatus,
  action: TicketSubmitAction
): TicketQueueStatus {
  if (action === "resolved") return "resolved"
  if (action === "pending") return "pending"
  return currentStatus === "open" ? "pending" : currentStatus
}

export function omitRecordKey<TValue>(
  sourceRecord: Record<string, TValue>,
  keyToDelete: string
) {
  if (!(keyToDelete in sourceRecord)) return sourceRecord

  const nextRecord = { ...sourceRecord }
  delete nextRecord[keyToDelete]
  return nextRecord
}
