"use client"
import { useState } from "react"
import { IconDots } from "@tabler/icons-react"
import { Popover } from "@base-ui/react/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiscussionAvatar } from "@/components/detail-tabs/shared-discussion-tab-content"
import type { TicketTimelineMessage } from "@/lib/tickets/detail-data"
import { filterTeammates } from "@/lib/tickets/side-conversation/helpers"
import { useSideConversation } from "./context"
import { getTicketNumberLabel } from "../ticket-detail-helpers"
export function ForwardMessageAction({
  message,
}: {
  message: TicketTimelineMessage
}) {
  const side = useSideConversation()
  const [open, setOpen] = useState(false)
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next && side.forward?.id === message.id) side.setForward(null)
      }}
    >
      <Popover.Trigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for message from ${message.author.name}`}
          />
        }
      >
        <IconDots className="size-4" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start" className="z-50">
          <Popover.Popup className="max-h-[75vh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border bg-popover p-3 text-popover-foreground shadow-xl">
            {side.forward?.id === message.id ? (
              <ForwardRecipients onSelect={() => setOpen(false)} />
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => side.setForward(message)}
              >
                Send via Thread
              </Button>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
function ForwardRecipients({ onSelect }: { onSelect: () => void }) {
  const side = useSideConversation()
  const [query, setQuery] = useState("")
  const [channel, setChannel] = useState("thread")
  const people = filterTeammates(query)
  return (
    <div className="space-y-3">
      <Popover.Title className="text-sm font-semibold">
        Forward ticket context
      </Popover.Title>
      <Popover.Description className="text-xs text-muted-foreground">
        Choose who receives this message from{" "}
        {getTicketNumberLabel(side.ticket)}.
      </Popover.Description>
      <div className="rounded-xl border bg-muted/40 p-3">
        <p className="text-sm font-semibold">{side.ticket.subject}</p>
        <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
          {side.forward?.body}
        </p>
      </div>
      <Tabs value={channel} onValueChange={setChannel}>
        <TabsList className="w-full">
          <TabsTrigger value="thread">Thread</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
      </Tabs>
      <Input
        aria-label="Find recipient"
        placeholder="Search teammates…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {people.map((p) => (
        <Button
          key={p.id}
          variant="ghost"
          className="h-auto w-full justify-start py-3"
          onClick={() => {
            onSelect()
            if (channel === "thread") side.sendTo(p.id)
            else side.forwardToEmail(p.id)
          }}
        >
          <DiscussionAvatar person={p} />
          <span className="min-w-0 text-left">
            <span className="block">{p.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {channel === "email" ? p.email : p.role}
            </span>
          </span>
        </Button>
      ))}
      {!people.length && (
        <p className="text-sm text-muted-foreground">
          No teammates found. Try another name.
        </p>
      )}
    </div>
  )
}
