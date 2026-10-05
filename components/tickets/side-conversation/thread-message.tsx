"use client"
import Image from "next/image"
import { IconArrowBackUp } from "@tabler/icons-react"
import { EmojiPicker } from "./emoji-picker"
import { Button } from "@/components/ui/button"
import { DiscussionAvatar } from "@/components/detail-tabs/shared-discussion-tab-content"
import { currentUser } from "@/lib/current-user"
import { cn } from "@/lib/utils"
import type {
  ThreadMessage as ThreadMessageData,
  Teammate,
} from "@/lib/tickets/side-conversation/types"
import { getTicketNumberLabel } from "../ticket-detail-helpers"
import { useSideConversation } from "./context"
function MessageText({ body }: { body: string }) {
  return (
    <>
      {body
        .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
        .map((part, i) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={i}>{part.slice(2, -2)}</strong>
          ) : part.startsWith("*") && part.endsWith("*") ? (
            <em key={i}>{part.slice(1, -1)}</em>
          ) : (
            part
          )
        )}
    </>
  )
}
export function ThreadMessage({
  message,
  person,
  grouped,
}: {
  message: ThreadMessageData
  person: Teammate
  grouped: boolean
}) {
  const side = useSideConversation()
  const own = message.author === currentUser.name
  const author = own
    ? { name: currentUser.name, avatarUrl: currentUser.avatar }
    : person
  const reactionKey = `${person.id}:${message.id}`
  const selectedReactions = side.reactions[reactionKey] ?? []
  function toggleReaction(emoji: string) {
    side.toggleReaction(person.id, message.id, emoji)
  }
  return (
    <div
      data-message-id={message.id}
      tabIndex={-1}
      className={cn(
        "grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-2.5",
        grouped && "-mt-2"
      )}
    >
      {grouped ? (
        <span aria-hidden className="w-8" />
      ) : (
        <DiscussionAvatar person={author} className="size-8!" />
      )}
      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-xs font-semibold">
              {own ? "You" : message.author}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {message.time}
            </span>
          </div>
        )}
        {message.forwarded ? (
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-[11px] text-muted-foreground">
              Forwarded ticket · {getTicketNumberLabel(side.ticket)}
            </p>
            <p className="mt-2 text-sm leading-5 font-medium">
              {side.ticket.subject}
            </p>
            <p className="mt-2 line-clamp-3 text-xs leading-5 break-words text-muted-foreground">
              {message.body}
            </p>
            <Button
              variant="link"
              className="mt-2 h-auto p-0 text-xs"
              onClick={() => side.viewMessage(message.forwarded!.id)}
            >
              View ticket
            </Button>
          </div>
        ) : (
          <div className="rounded-xl bg-secondary p-3 text-sm leading-6">
            {message.replyTo && (
              <button
                type="button"
                className="mb-2 block w-full rounded-lg border-l-2 border-muted-foreground/40 bg-background/60 px-2.5 py-2 text-left"
                aria-label={`View original message from ${message.replyTo.author}`}
                onClick={(event) => {
                  const original = event.currentTarget
                    .closest("[data-thread-messages]")
                    ?.querySelector<HTMLElement>(
                      `[data-message-id="${message.replyTo!.id}"]`
                    )
                  original?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                  original?.focus({ preventScroll: true })
                }}
              >
                <span className="block text-xs font-semibold">
                  {message.replyTo.author}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                  {message.replyTo.body}
                </span>
              </button>
            )}
            {message.body && (
              <p className="break-words whitespace-pre-wrap">
                <MessageText body={message.body} />
              </p>
            )}
            {message.attachments?.map((file) => (
              <a
                key={file.id}
                href={file.url}
                download={file.name}
                className="mt-2 block overflow-hidden rounded-lg border bg-background text-xs text-primary"
              >
                {file.image && (
                  <Image
                    src={file.url}
                    unoptimized
                    width={280}
                    height={160}
                    alt={file.name}
                    className="h-auto max-h-40 w-full object-contain"
                  />
                )}
                <span className="block truncate p-2">{file.name}</span>
              </a>
            ))}
          </div>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {selectedReactions.map((emoji) => (
            <Button
              key={emoji}
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 gap-1 rounded-full px-2 text-xs"
              aria-label={`Remove ${emoji} reaction`}
              aria-pressed={true}
              onClick={() => toggleReaction(emoji)}
            >
              {emoji}
              <span>1</span>
            </Button>
          ))}
          <EmojiPicker
            label={`React to message from ${message.author}`}
            reaction
            selected={selectedReactions}
            onSelect={toggleReaction}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={() => side.reply(person.id, message)}
          >
            <IconArrowBackUp className="size-3.5" />
            Reply
          </Button>
        </div>
      </div>
    </div>
  )
}
