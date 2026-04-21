import { useRef } from "react"
import {
  IconCheck,
  IconCircleDot,
  IconClock,
  IconDots,
  IconLock,
  IconPlus,
} from "@tabler/icons-react"

import { TicketCard } from "@/components/tickets/ticket-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Ticket, TicketQueueStatus } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketColumnProps = {
  columnKey: TicketQueueStatus
  title: string
  tickets: Ticket[]
  draggingTicketId?: string | null
  recentlyMovedTicketId?: string | null
  dropTargetIndex?: number | null
  onTicketDragStart?: (
    ticketId: string,
    event: React.DragEvent<HTMLDivElement>
  ) => void
  onTicketDragEnd?: () => void
  onDropTargetChange?: (
    columnKey: TicketQueueStatus,
    index: number
  ) => (event: React.DragEvent<HTMLElement>) => void
  onDropAtIndex?: (
    columnKey: TicketQueueStatus,
    index: number
  ) => (event: React.DragEvent<HTMLElement>) => void
}

function getColumnIcon(columnKey: TicketQueueStatus) {
  if (columnKey === "open") {
    return <IconCircleDot className="size-4 text-muted-foreground" />
  }

  if (columnKey === "pending") {
    return <IconClock className="size-4 text-muted-foreground" />
  }

  if (columnKey === "resolved") {
    return <IconCheck className="size-4 text-muted-foreground" />
  }

  return <IconLock className="size-4 text-muted-foreground" />
}

export function TicketColumn({
  columnKey,
  title,
  tickets,
  draggingTicketId,
  recentlyMovedTicketId,
  dropTargetIndex,
  onTicketDragStart,
  onTicketDragEnd,
  onDropTargetChange,
  onDropAtIndex,
}: TicketColumnProps) {
  const isDropTarget = dropTargetIndex !== null && dropTargetIndex !== undefined
  const isDraggingAny = Boolean(draggingTicketId)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])

  const handleColumnDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (!isDraggingAny) return

    let nextIndex = tickets.length

    for (const [index, cardElement] of cardRefs.current.entries()) {
      if (!cardElement) continue

      const bounds = cardElement.getBoundingClientRect()

      if (event.clientY < bounds.top) {
        nextIndex = index
        break
      }

      if (event.clientY <= bounds.bottom) {
        nextIndex = index + 1
        break
      }
    }

    onDropTargetChange?.(columnKey, nextIndex)(event)
  }

  const handleColumnDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const targetIndex = dropTargetIndex ?? tickets.length

    onDropAtIndex?.(columnKey, targetIndex)(event)
  }

  return (
    <section
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-transparent bg-muted/40 p-2 transition-[background-color,border-color,box-shadow] dark:border dark:border-border/50 dark:bg-muted/25",
        isDropTarget ? "border-primary/50 bg-primary/5 shadow-sm" : ""
      )}
      data-column-key={columnKey}
    >
      <header className="flex h-9 items-center justify-between">
        <div className="flex items-center gap-1.5">
          {getColumnIcon(columnKey)}
          <span className="text-xs font-medium text-foreground">{title}</span>
          <Badge
            variant="ghost"
            className={cn(
              "h-4 px-0 text-xs text-muted-foreground transition-colors",
              isDropTarget ? "text-primary" : ""
            )}
          >
            {tickets.length}
          </Badge>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon-sm" className="size-7 rounded-xl">
            <IconPlus className="size-4" />
            <span className="sr-only">Create ticket in {title}</span>
          </Button>
          <Button variant="ghost" size="icon-sm" className="size-7 rounded-xl">
            <IconDots className="size-4" />
            <span className="sr-only">Column options for {title}</span>
          </Button>
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col pb-2"
        onDragOver={handleColumnDragOver}
        onDrop={handleColumnDrop}
      >
        {Array.from({ length: tickets.length + 1 }).map((_, index) => {
          const isActive = dropTargetIndex === index

          return (
            <div key={`${columnKey}-drop-slot-${index}`}>
              <div
                className={cn(
                  "relative flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-150",
                  tickets.length === 0
                    ? "h-24 border border-dashed border-border/70 bg-background/45"
                    : "h-2",
                  isActive
                    ? tickets.length === 0
                      ? "my-0 h-24"
                      : "my-1 h-[4.5rem]"
                    : ""
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 rounded-2xl border-2 border-dashed border-primary/45 bg-primary/5 opacity-0 transition-opacity",
                    isActive ? "inset-y-0 opacity-100" : ""
                  )}
                />
                <span
                  className={cn(
                    "pointer-events-none relative text-[11px] font-medium transition-opacity",
                    tickets.length === 0 && isDraggingAny
                      ? "text-muted-foreground opacity-100"
                      : "text-primary opacity-0",
                    isActive ? "text-primary opacity-100" : ""
                  )}
                >
                  {isDraggingAny ? "Insert here" : ""}
                </span>
              </div>

              {index < tickets.length ? (
                <div
                  ref={(element) => {
                    cardRefs.current[index] = element
                  }}
                  className={cn(
                    "mb-2 transition-transform duration-150",
                    isDropTarget && dropTargetIndex !== null && index >= dropTargetIndex
                      ? "translate-y-1"
                      : ""
                    )}
                >
                  <TicketCard
                    ticket={tickets[index]}
                    draggable
                    isDragging={draggingTicketId === tickets[index].id}
                    isRecentlyMoved={recentlyMovedTicketId === tickets[index].id}
                    onDragStart={(event) =>
                      onTicketDragStart?.(tickets[index].id, event)
                    }
                    onDragEnd={onTicketDragEnd}
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
