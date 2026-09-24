"use client"

import * as React from "react"
import Image from "next/image"
import {
  IconArrowLeft,
  IconArrowsMaximize,
  IconCheck,
  IconClock,
  IconDots,
  IconTicket,
  IconUser,
} from "@tabler/icons-react"

import { ContactAvatar } from "@/components/inbox/contact-avatar"
import { InboxReplyComposer } from "@/components/inbox/inbox-reply-composer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { InboxEvent, InboxItem, InboxMessage } from "@/lib/inbox/types"
import { cn } from "@/lib/utils"

function TimelineEvent({ event }: { event: InboxEvent }) {
  return (
    <div className="flex gap-3 py-2">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground">
        <IconTicket className="size-4" />
      </span>
      <div className="min-w-0 pt-0.5 text-sm">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold">{event.title}</span>
          <time className="text-muted-foreground">{event.time}</time>
        </div>
        <p className="mt-1 leading-6 text-muted-foreground">{event.body}</p>
      </div>
    </div>
  )
}

function TimelineMessage({ message }: { message: InboxMessage }) {
  return (
    <article className="flex gap-3 py-2">
      {message.role === "agent" ? (
        <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image
            src="/avatars/avatar-profile.jpg"
            alt=""
            fill
            sizes="40px"
            className="object-cover"
          />
        </span>
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-xs text-muted-foreground">
          {message.author
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </span>
      )}
      <div className="min-w-0 flex-1 pt-0.5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{message.author}</span>
          <time className="text-muted-foreground">{message.sentAt}</time>
          <Badge variant="outline" className="hidden lg:inline-flex">
            Email
          </Badge>
          {message.role === "agent" ? (
            <Badge variant="secondary" className="hidden lg:inline-flex">
              Reply
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 max-w-[76ch] leading-6 break-words text-foreground-secondary md:text-foreground">
          {message.body}
        </p>
      </div>
    </article>
  )
}

function HeaderAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-xl"
            aria-label={label}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function ConversationDetail({
  item,
  reply,
  feedback,
  mobileOpen,
  onReplyChange,
  onSend,
  onAssign,
  onSnooze,
  onResolve,
  onOpenFullTicket,
  onBack,
}: {
  item: InboxItem
  reply: string
  feedback: string | null
  mobileOpen: boolean
  onReplyChange: (value: string) => void
  onSend: () => void
  onAssign: () => void
  onSnooze: () => void
  onResolve: () => void
  onOpenFullTicket: () => void
  onBack: () => void
}) {
  const timelineRef = React.useRef<HTMLDivElement>(null)
  const beforeEvents =
    item.events?.filter((event) => event.position === "before") ?? []
  const afterEvents =
    item.events?.filter((event) => event.position === "after") ?? []
  const historicalMessages = item.messages.filter((message) => !message.isNew)
  const newMessages = item.messages.filter((message) => message.isNew)

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const timeline = timelineRef.current
      timeline?.scrollTo({ top: timeline.scrollHeight, behavior: "smooth" })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [item.id, item.messages.length, mobileOpen])

  return (
    <section
      className={cn(
        "min-h-0 min-w-0 flex-1 flex-col bg-background",
        mobileOpen ? "flex" : "hidden md:flex"
      )}
      aria-label={`Conversation with ${item.contact}`}
    >
      <header className="flex h-[72px] shrink-0 items-center gap-3 border-b px-4 lg:h-25 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 md:hidden"
          onClick={onBack}
          aria-label="Back to inbox"
        >
          <IconArrowLeft className="size-4" />
        </Button>
        <ContactAvatar size="detail" className="hidden lg:block" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{item.customer}</h2>
            <Badge
              variant={item.priority === "urgent" ? "destructive" : "outline"}
              className="hidden lowercase lg:inline-flex"
            >
              {item.priority}
            </Badge>
            {item.slaLabel ? (
              <Badge variant="outline" className="hidden lg:inline-flex">
                {item.slaLabel}
              </Badge>
            ) : null}
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground md:text-sm">
            <span className="lg:hidden">
              {item.ticketNumber}
              {item.slaLabel ? ` · ${item.slaLabel}` : ""}
            </span>
            <span className="hidden items-center gap-3 lg:inline-flex">
              <span className="inline-flex items-center gap-1.5">
                Ticket
                <strong className="font-medium text-foreground">
                  {item.ticketNumber}
                </strong>
              </span>
              <span aria-hidden="true">│</span>
              <span className="inline-flex items-center gap-1.5">
                Company
                <strong className="font-medium text-foreground">
                  {item.accountName}
                </strong>
              </span>
              <span aria-hidden="true">│</span>
              <span className="inline-flex items-center gap-1.5">
                Owner
                <strong className="font-medium text-foreground">
                  {item.owner?.split(" ")[0] ?? "Unassigned"}
                </strong>
              </span>
            </span>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <HeaderAction
            label={item.owner ? "Reassign" : "Assign"}
            onClick={onAssign}
          >
            <IconUser className="size-4" />
          </HeaderAction>
          <HeaderAction label="Snooze" onClick={onSnooze}>
            <IconClock className="size-4" />
          </HeaderAction>
          <HeaderAction label="Resolve" onClick={onResolve}>
            <IconCheck className="size-4" />
          </HeaderAction>
          <HeaderAction
            label="Open full ticket (preview only)"
            onClick={onOpenFullTicket}
          >
            <IconArrowsMaximize className="size-4" />
          </HeaderAction>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 lg:hidden"
                aria-label="More conversation actions"
              />
            }
          >
            <IconDots className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="lg:hidden">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onAssign}>
                <IconUser className="size-4" />
                {item.owner ? "Reassign" : "Assign"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSnooze}>
                <IconClock className="size-4" />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onResolve}>
                <IconCheck className="size-4" />
                Resolve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenFullTicket}>
                <IconArrowsMaximize className="size-4" />
                Open full ticket (preview only)
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div
        ref={timelineRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-5 md:px-6 md:py-4"
      >
        {beforeEvents.map((event) => (
          <TimelineEvent key={event.id} event={event} />
        ))}
        {historicalMessages.map((message) => (
          <TimelineMessage key={message.id} message={message} />
        ))}
        {afterEvents.map((event) => (
          <TimelineEvent key={event.id} event={event} />
        ))}
        {newMessages.map((message) => (
          <TimelineMessage key={message.id} message={message} />
        ))}
      </div>

      <InboxReplyComposer
        key={item.id}
        reply={reply}
        feedback={feedback}
        onReplyChange={onReplyChange}
        onSend={onSend}
      />
    </section>
  )
}
