import { IconBrandSlack, IconMail, IconMessage2 } from "@tabler/icons-react"

import { TicketPriorityIndicator } from "@/components/tickets/ticket-priority-indicator"
import { TicketTag } from "@/components/tickets/ticket-tag"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { currentUser } from "@/lib/current-user"
import type { Ticket } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketCardProps = {
  ticket: Ticket
  isDragging?: boolean
  isRecentlyMoved?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

function TicketChannelIcon({ channel }: { channel: Ticket["channel"] }) {
  if (channel === "email") {
    return <IconMail className="size-4 text-muted-foreground" />
  }

  if (channel === "slack") {
    return <IconBrandSlack className="size-4 text-muted-foreground" />
  }

  return <IconMessage2 className="size-4 text-muted-foreground" />
}

export function TicketCard({
  ticket,
  isDragging,
  isRecentlyMoved,
  onClick,
}: TicketCardProps) {
  const initials = ticket.assignee?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const avatarUrl = ticket.mine
    ? currentUser.avatar
    : ticket.assignee?.avatarUrl

  return (
    <Card
      onClick={onClick}
      className={cn(
        "gap-0 rounded-2xl border bg-card py-0 shadow-none ring-0 transition-[transform,opacity,box-shadow,border-color,background-color] duration-200",
        onClick ? "cursor-pointer" : "",
        isDragging
          ? "scale-[0.98] rotate-1 border-primary/25 opacity-35 shadow-xl"
          : "",
        isRecentlyMoved ? "border-primary/35 bg-primary/5 shadow-sm" : ""
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TicketChannelIcon channel={ticket.channel} />
            <TicketPriorityIndicator priority={ticket.priority} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {ticket.ticketNumber}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-6 font-medium text-card-foreground">
          {ticket.subject}
        </p>

        <div className="flex items-center justify-between">
          <Avatar className="size-6 border bg-background">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={ticket.assignee?.name ?? "Assignee"} />
            ) : null}
            <AvatarFallback className="text-xs">
              {initials || "--"}
            </AvatarFallback>
          </Avatar>
          <TicketTag tone={ticket.health} />
        </div>
      </CardContent>
    </Card>
  )
}
