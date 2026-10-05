"use client"
import Link from "next/link"
import { IconMessages } from "@tabler/icons-react"
import { getTicketNumberLabel, statusLabel } from "../ticket-detail-helpers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSideConversation } from "./context"
export function ChildTicketsPanel() {
  const side = useSideConversation()
  const { childIds, childTickets, linked } = side
  return (
    <div className="min-h-0 space-y-3 overflow-y-auto">
      <p className="text-xs text-muted-foreground">
        Linked work for {getTicketNumberLabel(side.ticket)} · Demo
      </p>
      {childTickets.length ? (
        childTickets.map((t) => (
          <div key={t.id} className="rounded-xl border p-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{getTicketNumberLabel(t)}</Badge>
              <Badge variant="secondary">{statusLabel[t.queueStatus]}</Badge>
            </div>
            <p className="mt-2 text-sm font-medium">{t.subject}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.assignee?.name ?? "Unassigned"}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                className="text-xs text-primary underline"
                href={`/tickets/${t.id}`}
              >
                View ticket
              </Link>
              <Button
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => side.unlinkChild(t.id)}
              >
                Unlink
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <IconMessages className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No child tickets yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Link related work to keep the next steps together.
          </p>
        </div>
      )}
      {linked
        .filter((t) => !childIds.includes(t.id))
        .map((t) => (
          <Button
            key={t.id}
            variant="outline"
            className="h-auto w-full justify-start py-3 text-left whitespace-normal"
            onClick={() => side.linkChild(t.id)}
          >
            Link {getTicketNumberLabel(t)} — {t.subject}
          </Button>
        ))}
    </div>
  )
}
