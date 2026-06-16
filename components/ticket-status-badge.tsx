import { Badge } from "@/components/ui/badge"
import {
  ticketStatusLabel,
  ticketStatusToneClassName,
} from "@/lib/tickets/presentation"
import type { TicketQueueStatus } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

export function TicketStatusBadge({ status }: { status: TicketQueueStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-full px-2 text-xs font-medium",
        ticketStatusToneClassName[status]
      )}
    >
      {ticketStatusLabel[status]}
    </Badge>
  )
}
