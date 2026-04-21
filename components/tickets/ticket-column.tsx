import {
  IconCheck,
  IconCircleDot,
  IconClock,
  IconDots,
  IconLock,
  IconPlus,
} from "@tabler/icons-react"
import { useDroppable } from "@dnd-kit/core"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Ticket, TicketQueueStatus } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketColumnProps = {
  columnKey: TicketQueueStatus
  title: string
  tickets: Ticket[]
  draggingTicketId?: string | null
  dropId: string
  previewIndex?: number
  renderTicket: (ticket: Ticket) => React.ReactNode
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
  dropId,
  previewIndex,
  renderTicket,
}: TicketColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
  })

  const isDraggingAny = Boolean(draggingTicketId)
  const showPreview = isDraggingAny && previewIndex !== undefined

  const renderPreviewSlot = (expanded = false) => (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-150 ease-out",
        expanded ? "my-1 h-10" : "my-0.5 h-6"
      )}
    >
      {expanded ? (
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-primary/45 bg-primary/5 transition-all duration-150 ease-out" />
      ) : (
        <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-primary/45" />
      )}
      {expanded ? (
        <span className="relative text-sm font-medium text-primary">
          Insert here
        </span>
      ) : (
        <span className="relative rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-primary">
          Insert here
        </span>
      )}
    </div>
  )

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-w-0 flex-1 snap-start flex-col gap-2 rounded-2xl border border-transparent bg-muted/40 p-2 transition-[background-color,border-color,box-shadow] dark:border dark:border-border/50 dark:bg-muted/25",
        isOver ? "border-primary/50 bg-primary/5 shadow-sm" : ""
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
              isOver ? "text-primary" : ""
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

      <div className="flex min-h-0 flex-1 flex-col pb-2">
        {showPreview && tickets.length === 0 ? (
          renderPreviewSlot(true)
        ) : isDraggingAny && tickets.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-primary/45 bg-primary/5 text-[11px] font-medium text-primary">
            Drop ticket here
          </div>
        ) : null}

        {showPreview && previewIndex === 0 && tickets.length > 0
          ? renderPreviewSlot(false)
          : null}

        {tickets.map((ticket, index) => (
          <div
            key={ticket.id}
            className={cn(
              "transition-transform duration-100 ease-out will-change-transform",
              showPreview && previewIndex !== undefined
                ? index >= previewIndex
                  ? "translate-y-2"
                  : ""
                : ""
            )}
          >
            {showPreview && previewIndex === index && index > 0
              ? renderPreviewSlot(false)
              : null}
            {renderTicket(ticket)}
          </div>
        ))}

        {showPreview && previewIndex === tickets.length && tickets.length > 0
          ? renderPreviewSlot(false)
          : null}
      </div>
    </section>
  )
}
