"use client"

import { TicketPriorityIndicator } from "@/components/ticket-priority-indicator"
import { ticketPriorityLabel } from "@/lib/tickets/presentation"
import type { TicketPriority } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketPriorityLabelProps = {
  priority: TicketPriority
  className?: string
}

export function TicketPriorityLabel({
  priority,
  className,
}: TicketPriorityLabelProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-foreground", className)}
    >
      <TicketPriorityIndicator priority={priority} />
      <span>{ticketPriorityLabel[priority]}</span>
    </span>
  )
}
