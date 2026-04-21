import { useEffect, useMemo, useRef, useState } from "react"
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { TicketCard } from "@/components/tickets/ticket-card"
import { TicketColumn } from "@/components/tickets/ticket-column"
import { ticketBoardColumns } from "@/lib/tickets/mock-data"
import type {
  Ticket,
  TicketDrawerOrigin,
  TicketQueueStatus,
} from "@/lib/tickets/types"

type TicketBoardProps = {
  tickets: Ticket[]
  onOpenTicket?: (ticketId: string, origin?: TicketDrawerOrigin) => void
  onMoveTicket: (
    ticketId: string,
    queueStatus: TicketQueueStatus,
    insertBeforeTicketId?: string | null
  ) => void
}

type DragTarget =
  | {
      type: "column"
      queueStatus: TicketQueueStatus
    }
  | {
      type: "ticket"
      ticketId: string
    }

type DragPlacement = {
  queueStatus: TicketQueueStatus
  insertBeforeTicketId: string | null
}

type DragPreview = {
  queueStatus: TicketQueueStatus
  index: number
}

function areDragPreviewsEqual(
  left: DragPreview | null,
  right: DragPreview | null
) {
  if (left === right) return true
  if (!left || !right) return false

  return left.queueStatus === right.queueStatus && left.index === right.index
}

function sortTicketsForBoard(sourceTickets: Ticket[]) {
  return [...sourceTickets].sort((leftTicket, rightTicket) => {
    if (leftTicket.boardOrder === rightTicket.boardOrder) {
      return leftTicket.id.localeCompare(rightTicket.id)
    }

    return leftTicket.boardOrder - rightTicket.boardOrder
  })
}

function getColumnDropId(queueStatus: TicketQueueStatus) {
  return `column:${queueStatus}`
}

function getTicketDropId(ticketId: string) {
  return `ticket:${ticketId}`
}

function parseDragTarget(id: string): DragTarget | null {
  if (id.startsWith("column:")) {
    return {
      type: "column",
      queueStatus: id.replace("column:", "") as TicketQueueStatus,
    }
  }

  if (id.startsWith("ticket:")) {
    return {
      type: "ticket",
      ticketId: id.replace("ticket:", ""),
    }
  }

  return null
}

function isTicketDropId(id: string) {
  return id.startsWith("ticket:")
}

function isColumnDropId(id: string) {
  return id.startsWith("column:")
}

function applyTicketMove(
  sourceTickets: Ticket[],
  ticketId: string,
  queueStatus: TicketQueueStatus,
  insertBeforeTicketId?: string | null
) {
  const movingTicket = sourceTickets.find((ticket) => ticket.id === ticketId)
  if (!movingTicket) return sourceTickets

  const sourceQueueStatus = movingTicket.queueStatus
  const sourceColumnTickets = sortTicketsForBoard(
    sourceTickets.filter(
      (ticket) =>
        ticket.queueStatus === sourceQueueStatus && ticket.id !== ticketId
    )
  )
  const targetColumnTickets = sortTicketsForBoard(
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
  const nextMovingTicket = {
    ...movingTicket,
    queueStatus,
  }

  nextTargetColumnTickets.splice(
    insertIndex === -1 ? nextTargetColumnTickets.length : insertIndex,
    0,
    nextMovingTicket
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

function getDragPlacement(
  sourceTickets: Ticket[],
  activeTicketId: string,
  overTarget: DragTarget | null,
  activeRect: { top: number; height: number } | null,
  overRect: { top: number; height: number } | null
): DragPlacement | null {
  if (!overTarget) return null

  if (overTarget.type === "column") {
    return {
      queueStatus: overTarget.queueStatus,
      insertBeforeTicketId: null,
    }
  }

  const overTicket = sourceTickets.find(
    (ticket) => ticket.id === overTarget.ticketId
  )
  if (!overTicket) return null

  const targetColumnTickets = sortTicketsForBoard(
    sourceTickets.filter(
      (ticket) =>
        ticket.queueStatus === overTicket.queueStatus &&
        ticket.id !== activeTicketId
    )
  )
  const overIndex = targetColumnTickets.findIndex(
    (ticket) => ticket.id === overTicket.id
  )

  if (overTicket.id === activeTicketId) {
    const sourceTicket = sourceTickets.find(
      (ticket) => ticket.id === activeTicketId
    )
    if (!sourceTicket) return null

    const indicatorIndex = Math.min(
      sourceTicket.boardOrder,
      targetColumnTickets.length
    )

    return {
      queueStatus: sourceTicket.queueStatus,
      insertBeforeTicketId: targetColumnTickets[indicatorIndex]?.id ?? null,
    }
  }

  const activeCenter = activeRect
    ? activeRect.top + activeRect.height / 2
    : null
  const overCenter = overRect ? overRect.top + overRect.height / 2 : null
  const shouldInsertAfter =
    activeCenter !== null && overCenter !== null
      ? activeCenter > overCenter
      : false
  const indicatorIndex =
    overIndex === -1
      ? targetColumnTickets.length
      : overIndex + (shouldInsertAfter ? 1 : 0)

  return {
    queueStatus: overTicket.queueStatus,
    insertBeforeTicketId: targetColumnTickets[indicatorIndex]?.id ?? null,
  }
}

function getDragPreview(
  sourceTickets: Ticket[],
  activeTicketId: string,
  overTarget: DragTarget | null,
  activeRect: { top: number; height: number } | null,
  overRect: { top: number; height: number } | null,
  previousPreview: DragPreview | null
): DragPreview | null {
  if (!overTarget) return null

  if (overTarget.type === "column") {
    return {
      queueStatus: overTarget.queueStatus,
      index: sortTicketsForBoard(
        sourceTickets.filter(
          (ticket) => ticket.queueStatus === overTarget.queueStatus
        )
      ).length,
    }
  }

  const overTicket = sourceTickets.find(
    (ticket) => ticket.id === overTarget.ticketId
  )
  if (!overTicket) return null

  const targetColumnTickets = sortTicketsForBoard(
    sourceTickets.filter(
      (ticket) => ticket.queueStatus === overTicket.queueStatus
    )
  )
  const overIndex = targetColumnTickets.findIndex(
    (ticket) => ticket.id === overTarget.ticketId
  )

  if (overIndex === -1) {
    return {
      queueStatus: overTicket.queueStatus,
      index: targetColumnTickets.length,
    }
  }

  if (overTarget.ticketId === activeTicketId) {
    return {
      queueStatus: overTicket.queueStatus,
      index: overIndex,
    }
  }

  const activeCenter = activeRect
    ? activeRect.top + activeRect.height / 2
    : null
  const overCenter = overRect ? overRect.top + overRect.height / 2 : null
  const offsetFromCenter =
    activeCenter !== null && overCenter !== null
      ? activeCenter - overCenter
      : null
  const deadZone =
    overRect !== null ? Math.max(6, Math.min(14, overRect.height * 0.12)) : 10

  if (
    offsetFromCenter !== null &&
    Math.abs(offsetFromCenter) <= deadZone &&
    previousPreview?.queueStatus === overTicket.queueStatus &&
    (previousPreview.index === overIndex ||
      previousPreview.index === overIndex + 1)
  ) {
    return previousPreview
  }

  const shouldInsertAfter =
    offsetFromCenter !== null ? offsetFromCenter > deadZone : false

  return {
    queueStatus: overTicket.queueStatus,
    index: overIndex + (shouldInsertAfter ? 1 : 0),
  }
}

function SortableTicketCard({
  ticket,
  isRecentlyMoved,
  onOpen,
}: {
  ticket: Ticket
  isRecentlyMoved: boolean
  onOpen?: (ticketId: string, origin?: TicketDrawerOrigin) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getTicketDropId(ticket.id),
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="mb-2 touch-none select-none"
      {...attributes}
      {...listeners}
    >
      <TicketCard
        ticket={ticket}
        isDragging={isDragging}
        isRecentlyMoved={isRecentlyMoved}
        onClick={(event) =>
          onOpen?.(ticket.id, {
            x: event.currentTarget.getBoundingClientRect().x,
            y: event.currentTarget.getBoundingClientRect().y,
            width: event.currentTarget.getBoundingClientRect().width,
            height: event.currentTarget.getBoundingClientRect().height,
          })
        }
      />
    </div>
  )
}

function StaticTicketCard({
  ticket,
  isRecentlyMoved,
  onOpen,
}: {
  ticket: Ticket
  isRecentlyMoved: boolean
  onOpen?: (ticketId: string, origin?: TicketDrawerOrigin) => void
}) {
  return (
    <div className="mb-2">
      <TicketCard
        ticket={ticket}
        isRecentlyMoved={isRecentlyMoved}
        onClick={(event) =>
          onOpen?.(ticket.id, {
            x: event.currentTarget.getBoundingClientRect().x,
            y: event.currentTarget.getBoundingClientRect().y,
            width: event.currentTarget.getBoundingClientRect().width,
            height: event.currentTarget.getBoundingClientRect().height,
          })
        }
      />
    </div>
  )
}

export function TicketBoard({
  tickets,
  onOpenTicket,
  onMoveTicket,
}: TicketBoardProps) {
  const unlockClickTimeoutRef = useRef<number | null>(null)
  const lastOverTargetRef = useRef<DragTarget | null>(null)
  const suppressClickRef = useRef(false)
  const [isClientReady, setIsClientReady] = useState(false)
  const [draggingTicketId, setDraggingTicketId] = useState<string | null>(null)
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null)
  const [recentlyMovedTicketId, setRecentlyMovedTicketId] = useState<
    string | null
  >(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsClientReady(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    if (!recentlyMovedTicketId) return

    const timeout = window.setTimeout(() => {
      setRecentlyMovedTicketId(null)
    }, 1200)

    return () => window.clearTimeout(timeout)
  }, [recentlyMovedTicketId])

  useEffect(() => {
    return () => {
      if (unlockClickTimeoutRef.current) {
        window.clearTimeout(unlockClickTimeoutRef.current)
      }
    }
  }, [])

  const ticketsByColumn = useMemo(
    () =>
      ticketBoardColumns.map((column) => ({
        ...column,
        tickets: sortTicketsForBoard(
          tickets.filter((ticket) => ticket.queueStatus === column.key)
        ),
      })),
    [tickets]
  )

  const activeTicket = draggingTicketId
    ? (tickets.find((ticket) => ticket.id === draggingTicketId) ?? null)
    : null

  const handleOpenTicket = (ticketId: string, origin?: TicketDrawerOrigin) => {
    if (suppressClickRef.current) return
    onOpenTicket?.(ticketId, origin)
  }

  if (!isClientReady) {
    return (
      <div className="pb-2">
        <div className="mx-auto grid w-full snap-x snap-mandatory auto-cols-[minmax(17.5rem,88vw)] grid-flow-col gap-4 overflow-x-auto pr-1 pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pr-0 sm:pb-0 xl:grid-cols-4">
          {ticketsByColumn.map((column) => (
            <TicketColumn
              key={column.key}
              columnKey={column.key}
              title={column.label}
              tickets={column.tickets}
              dropId={getColumnDropId(column.key)}
              renderTicket={(ticket) => (
                <StaticTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isRecentlyMoved={recentlyMovedTicketId === ticket.id}
                  onOpen={handleOpenTicket}
                />
              )}
            />
          ))}
        </div>
      </div>
    )
  }

  const resetDragState = () => {
    setDraggingTicketId(null)
    setDragPreview(null)
    lastOverTargetRef.current = null

    if (unlockClickTimeoutRef.current) {
      window.clearTimeout(unlockClickTimeoutRef.current)
    }

    unlockClickTimeoutRef.current = window.setTimeout(() => {
      suppressClickRef.current = false
      unlockClickTimeoutRef.current = null
    }, 0)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const activeTarget = parseDragTarget(String(event.active.id))
    if (!activeTarget || activeTarget.type !== "ticket") return

    lastOverTargetRef.current = activeTarget
    suppressClickRef.current = true
    setDraggingTicketId(activeTarget.ticketId)
  }

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) return

    const activeTarget = parseDragTarget(String(event.active.id))
    const overTarget = parseDragTarget(String(event.over.id))
    const overRect = event.over.rect

    if (!activeTarget || activeTarget.type !== "ticket" || !overTarget) return

    lastOverTargetRef.current = overTarget

    setDragPreview((currentPreview) => {
      const nextPreview = getDragPreview(
        tickets,
        activeTarget.ticketId,
        overTarget,
        event.active.rect.current.translated ??
          event.active.rect.current.initial,
        overRect,
        currentPreview
      )

      return areDragPreviewsEqual(currentPreview, nextPreview)
        ? currentPreview
        : nextPreview
    })
  }

  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args)
    const ticketPointerCollisions = pointerCollisions.filter((collision) =>
      isTicketDropId(String(collision.id))
    )

    if (ticketPointerCollisions.length > 0) {
      return ticketPointerCollisions
    }

    const cornerCollisions = closestCorners(args)
    const ticketCornerCollisions = cornerCollisions.filter((collision) =>
      isTicketDropId(String(collision.id))
    )

    if (ticketCornerCollisions.length > 0) {
      return ticketCornerCollisions
    }

    const columnPointerCollisions = pointerCollisions.filter((collision) =>
      isColumnDropId(String(collision.id))
    )

    if (columnPointerCollisions.length > 0) {
      return columnPointerCollisions
    }

    return cornerCollisions.filter((collision) =>
      isColumnDropId(String(collision.id))
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const activeTarget = parseDragTarget(String(event.active.id))
    const overTarget = event.over
      ? parseDragTarget(String(event.over.id))
      : lastOverTargetRef.current

    if (!activeTarget || activeTarget.type !== "ticket") {
      resetDragState()
      return
    }

    const finalPlacement = getDragPlacement(
      tickets,
      activeTarget.ticketId,
      overTarget,
      event.active.rect.current.translated ?? event.active.rect.current.initial,
      event.over?.rect ?? null
    )

    if (!finalPlacement) {
      resetDragState()
      return
    }

    const finalTickets = applyTicketMove(
      tickets,
      activeTarget.ticketId,
      finalPlacement.queueStatus,
      finalPlacement.insertBeforeTicketId
    )
    const finalTicket = finalTickets.find(
      (ticket) => ticket.id === activeTarget.ticketId
    )
    const originalTicket = tickets.find(
      (ticket) => ticket.id === activeTarget.ticketId
    )

    if (!finalTicket || !originalTicket) {
      resetDragState()
      return
    }

    if (
      finalTicket.queueStatus === originalTicket.queueStatus &&
      finalTicket.boardOrder === originalTicket.boardOrder
    ) {
      resetDragState()
      return
    }

    onMoveTicket(
      finalTicket.id,
      finalPlacement.queueStatus,
      finalPlacement.insertBeforeTicketId
    )
    setRecentlyMovedTicketId(finalTicket.id)
    resetDragState()
  }

  return (
    <div className="pb-2">
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={resetDragState}
      >
        <div className="mx-auto grid w-full snap-x snap-mandatory auto-cols-[minmax(17.5rem,88vw)] grid-flow-col gap-4 overflow-x-auto pr-1 pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pr-0 sm:pb-0 xl:grid-cols-4">
          {ticketsByColumn.map((column) => (
            <SortableContext
              key={column.key}
              items={column.tickets.map((ticket) => getTicketDropId(ticket.id))}
              strategy={verticalListSortingStrategy}
            >
              <TicketColumn
                columnKey={column.key}
                title={column.label}
                tickets={column.tickets}
                draggingTicketId={draggingTicketId}
                dropId={getColumnDropId(column.key)}
                previewIndex={
                  dragPreview?.queueStatus === column.key
                    ? dragPreview.index
                    : undefined
                }
                renderTicket={(ticket) => (
                  <SortableTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    isRecentlyMoved={recentlyMovedTicketId === ticket.id}
                    onOpen={handleOpenTicket}
                  />
                )}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTicket ? (
            <div className="w-[var(--ticket-overlay-width,auto)] max-w-sm">
              <TicketCard ticket={activeTicket} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
