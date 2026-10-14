import type { Ticket, TicketQueueStatus } from "@/lib/tickets/types"
import type { TicketDetail } from "@/lib/tickets/detail-data"
import { TicketPriorityIndicator } from "@/components/ticket-priority-indicator"
import { TicketTag } from "./ticket-tag"
import {
  channelLabel,
  priorityLabel,
  statusLabel,
} from "./ticket-detail-helpers"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type TicketDetailsContentProps = {
  queueStatus: TicketQueueStatus
  ticket: Ticket
  detail: TicketDetail
  assignee: { name: string }
}
function DetailStat({
  label,
  value,
  className,
}: {
  label: string
  value: ReactNode
  className?: string
}) {
  return (
    <div className={cn(className)}>
      <div className="text-xs font-medium tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
    </div>
  )
}
export function TicketDetailsContent({
  queueStatus,
  ticket,
  detail,
  assignee,
}: TicketDetailsContentProps) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <DetailStat
        label="Queue status"
        value={
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full",
                queueStatus === "closed"
                  ? "bg-muted-foreground"
                  : queueStatus === "resolved"
                    ? "bg-status-success"
                    : queueStatus === "pending"
                      ? "bg-status-warning"
                      : "bg-status-in-review-foreground"
              )}
            />
            {statusLabel[queueStatus]}
          </span>
        }
      />
      <DetailStat
        label="Priority"
        value={
          <span className="inline-flex items-center gap-2">
            <TicketPriorityIndicator priority={ticket.priority} />
            {priorityLabel[ticket.priority]}
          </span>
        }
      />
      <DetailStat label="Health" value={<TicketTag tone={ticket.health} />} />
      <DetailStat label="Channel" value={channelLabel[ticket.channel]} />
      <DetailStat label="Opened" value={detail.openedAt} />
      <DetailStat
        label="SLA"
        value={detail.responseSla}
        className="sm:col-span-2"
      />
      <DetailStat
        label="Next due"
        value={detail.nextDue}
        className="sm:col-span-2"
      />
      <DetailStat label="Assigned to" value={assignee.name} />
    </div>
  )
}
