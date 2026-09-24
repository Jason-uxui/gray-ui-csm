import type { ReactNode } from "react"

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
        "h-5 shrink-0 rounded-full border-[0.625px] px-2 text-[10px] leading-4 font-semibold",
        ticketStatusToneClassName[status]
      )}
    >
      {ticketStatusLabel[status]}
    </Badge>
  )
}

/** Decorative relationship only: intentionally not focusable or clickable. */
export function MergeRelationshipConnector({
  continues = false,
}: {
  continues?: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative min-h-[100px] w-[47px] shrink-0 self-stretch"
    >
      {/* The exported branch is 65.682px tall, bends at y=55 and has 50% alpha.
          Preserve its geometry; match that alpha on the continuing spine. */}
      {continues ? (
        <span className="absolute top-[55px] bottom-0 left-[22px] w-px bg-muted-foreground/50" />
      ) : null}
      <span className="absolute top-0 left-[22px] h-[65.682px] w-[25px] bg-muted-foreground [mask:url('/tickets/merge-connector-line.svg')_center/100%_100%_no-repeat]" />
      <span className="absolute top-[13px] left-1.5 flex size-8 items-center justify-center rounded-xl border border-[var(--status-merge-border)] bg-[var(--status-merge-background)] text-[var(--status-merge-foreground)] shadow-raised-control">
        <span className="size-4 bg-current [mask:url('/tickets/merge-relationship.svg')_center/contain_no-repeat]" />
      </span>
    </div>
  )
}

export function TicketMergeCard({
  label,
  subject,
  status,
  current = false,
  transparent = false,
  action,
}: {
  label: string
  subject: string
  status?: TicketQueueStatus
  current?: boolean
  transparent?: boolean
  action?: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex h-[76px] min-w-0 items-center justify-between gap-3 rounded-[18px] border-[0.625px] border-border p-3.5",
        transparent ? "bg-transparent" : "bg-sidebar-accent"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm leading-5",
              current
                ? "text-muted-foreground"
                : "font-semibold text-foreground"
            )}
          >
            {label}
          </span>
          {status ? <TicketStatusBadge status={status} /> : null}
        </div>
        <p
          title={subject}
          className="mt-1.5 truncate text-sm leading-5 font-medium text-foreground"
        >
          {subject}
        </p>
      </div>
      {action}
    </div>
  )
}
