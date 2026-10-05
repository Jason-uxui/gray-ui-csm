"use client"
import { useEffect, useRef, useState } from "react"
import { IconArrowLeft } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DiscussionAvatar } from "@/components/detail-tabs/shared-discussion-tab-content"
import { ThreadComposer } from "../thread-composer"
import { useSideConversation } from "./context"
import { teammates } from "@/lib/tickets/side-conversation/mock-data"
import { filterTeammates } from "@/lib/tickets/side-conversation/helpers"
import { ThreadMessage } from "./thread-message"
import { Presence } from "./presence"
export function ThreadPanel() {
  const side = useSideConversation()
  const messageScrollRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const person = teammates.find((p) => p.id === side.target)
  const messages = person ? (side.messages[person.id] ?? []) : []
  const people = filterTeammates(query)
  useEffect(() => {
    const container = messageScrollRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [side.target, messages.length])
  return !person ? (
    <>
      <Input
        aria-label="Search teammates"
        placeholder="Search teammates…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="min-h-0 min-w-0 space-y-1 overflow-y-auto">
        {people.map((p) => (
          <Button
            variant="ghost"
            key={p.id}
            className="grid h-auto w-full min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-3 rounded-xl px-2 py-3"
            onClick={() => side.setTarget(p.id)}
          >
            <DiscussionAvatar person={p} />
            <span className="min-w-0 flex-1 text-left">
              <span className="block font-medium">{p.name}</span>
              <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                {side.messages[p.id]?.at(-1)?.body ||
                  (side.messages[p.id]?.at(-1)?.attachments?.length
                    ? "Attachment"
                    : p.role)}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1.5">
              <Presence online={p.online} />
              {side.messages[p.id]?.at(-1) && (
                <span className="text-[11px] font-normal text-muted-foreground">
                  {side.messages[p.id]?.at(-1)?.time}
                </span>
              )}
            </span>
          </Button>
        ))}
        {!people.length && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No teammates found.
          </p>
        )}
      </div>
    </>
  ) : (
    <>
      <div className="flex items-center gap-2 pb-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back to teammates"
          onClick={() => side.setTarget(null)}
        >
          <IconArrowLeft />
        </Button>
        <DiscussionAvatar person={person} />
        <div>
          <p className="text-sm font-semibold">{person.name}</p>
          <Presence online={person.online} />
        </div>
      </div>
      <div
        ref={messageScrollRef}
        data-thread-messages
        className="min-h-0 flex-1 space-y-4 overflow-y-auto"
      >
        <div className="flex items-center gap-3 py-1 text-[11px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Today
          <span className="h-px flex-1 bg-border" />
        </div>
        {(side.messages[person.id] ?? []).length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Start a conversation with {person.name.split(" ")[0]} or forward a
            ticket message to share context.
          </p>
        )}
        {(side.messages[person.id] ?? []).map((message, index, all) => (
          <ThreadMessage
            key={message.id}
            message={message}
            person={person}
            grouped={index > 0 && all[index - 1].author === message.author}
          />
        ))}
      </div>
      <ThreadComposer
        key={person.id}
        name={person.name}
        replyTo={side.replyTargets[person.id]}
        onCancelReply={() => side.cancelReply(person.id)}
        draft={side.drafts[person.id] ?? ""}
        onDraftChange={(value) => side.setDraft(person.id, value)}
        attachments={side.draftAttachments[person.id] ?? []}
        pending={!!side.pendingUploads[person.id]}
        onAddAttachments={(files) => {
          void side.addAttachments(person.id, files)
        }}
        onRemoveAttachment={(id) => side.removeAttachment(person.id, id)}
        onSend={() => side.sendMessage(person.id)}
      />
    </>
  )
}
