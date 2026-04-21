import { useEffect, useState } from "react"

import { ticketBoardColumns } from "@/lib/tickets/mock-data"
import type { Ticket, TicketQueueStatus } from "@/lib/tickets/types"
import { TicketColumn } from "@/components/tickets/ticket-column"

type TicketBoardProps = {
  tickets: Ticket[]
  onMoveTicket: (
    ticketId: string,
    queueStatus: TicketQueueStatus,
    insertBeforeTicketId?: string | null
  ) => void
}

type TicketDropTarget = {
  columnKey: TicketQueueStatus
  index: number
}

function sortTicketsForBoard(sourceTickets: Ticket[]) {
  return [...sourceTickets].sort((leftTicket, rightTicket) => {
    if (leftTicket.boardOrder === rightTicket.boardOrder) {
      return leftTicket.id.localeCompare(rightTicket.id)
    }

    return leftTicket.boardOrder - rightTicket.boardOrder
  })
}

export function TicketBoard({ tickets, onMoveTicket }: TicketBoardProps) {
  const [draggingTicketId, setDraggingTicketId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<TicketDropTarget | null>(null)
  const [recentlyMovedTicketId, setRecentlyMovedTicketId] =
    useState<string | null>(null)

  useEffect(() => {
    if (!recentlyMovedTicketId) return

    const timeout = window.setTimeout(() => {
      setRecentlyMovedTicketId(null)
    }, 1200)

    return () => window.clearTimeout(timeout)
  }, [recentlyMovedTicketId])

  const handleTicketDragStart = (
    ticketId: string,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/ticket-id", ticketId)
    setDraggingTicketId(ticketId)
  }

  const handleTicketDragEnd = () => {
    setDraggingTicketId(null)
    setDropTarget(null)
  }

  const handleDropTargetChange =
    (columnKey: TicketQueueStatus, index: number) =>
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = "move"
      setDropTarget((currentTarget) => {
        if (
          currentTarget?.columnKey === columnKey &&
          currentTarget.index === index
        ) {
          return currentTarget
        }

        return { columnKey, index }
      })
    }

  const handleDropAtIndex =
    (columnKey: TicketQueueStatus, index: number) =>
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()
      const ticketId = event.dataTransfer.getData("text/ticket-id")
      if (!ticketId) return

      const targetColumnTickets = tickets.filter(
        (ticket) => ticket.queueStatus === columnKey
      )
      const orderedTargetColumnTickets = sortTicketsForBoard(targetColumnTickets)
      const sourceIndex = orderedTargetColumnTickets.findIndex(
        (ticket) => ticket.id === ticketId
      )
      const targetIndex =
        sourceIndex !== -1 && sourceIndex < index ? index - 1 : index
      const insertBeforeTicketId =
        orderedTargetColumnTickets.filter((ticket) => ticket.id !== ticketId)[
          targetIndex
        ]?.id ?? null

      onMoveTicket(ticketId, columnKey, insertBeforeTicketId)
      setRecentlyMovedTicketId(ticketId)
      setDraggingTicketId(null)
      setDropTarget(null)
    }

  const ticketsByColumn = ticketBoardColumns.map((column) => ({
    ...column,
    tickets: sortTicketsForBoard(
      tickets.filter((ticket) => ticket.queueStatus === column.key)
    ),
  }))

  return (
    <div className="pb-2">
      <div className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ticketsByColumn.map((column) => (
          <TicketColumn
            key={column.key}
            columnKey={column.key}
            title={column.label}
            tickets={column.tickets}
            draggingTicketId={draggingTicketId}
            recentlyMovedTicketId={recentlyMovedTicketId}
            dropTargetIndex={
              dropTarget?.columnKey === column.key ? dropTarget.index : null
            }
            onTicketDragStart={handleTicketDragStart}
            onTicketDragEnd={handleTicketDragEnd}
            onDropTargetChange={handleDropTargetChange}
            onDropAtIndex={handleDropAtIndex}
          />
        ))}
      </div>
    </div>
  )
}
