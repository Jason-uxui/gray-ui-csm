"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import {
  IconArrowBackUp,
  IconPaperclip,
  IconPhoto,
  IconSend,
  IconX,
} from "@tabler/icons-react"
import { EmojiPicker } from "./side-conversation/emoji-picker"
import { Popover } from "@base-ui/react/popover"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import type {
  ThreadAttachment,
  ThreadReply,
} from "@/lib/tickets/side-conversation/types"

export function ThreadComposer({
  name,
  draft,
  onDraftChange,
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  pending,
  onSend,
  replyTo,
  onCancelReply,
}: {
  replyTo?: ThreadReply
  onCancelReply: () => void
  name: string
  draft: string
  onDraftChange: (value: string) => void
  attachments: ThreadAttachment[]
  onAddAttachments: (files: File[]) => void
  onRemoveAttachment: (id: string) => void
  pending: boolean
  onSend: () => void
}) {
  const textarea = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (replyTo) textarea.current?.focus()
  }, [replyTo])
  const fileInput = useRef<HTMLInputElement>(null)
  const imageInput = useRef<HTMLInputElement>(null)
  function insert(text: string, wrap = false) {
    const start = textarea.current?.selectionStart ?? draft.length
    const end = textarea.current?.selectionEnd ?? draft.length
    const value =
      draft.slice(0, start) +
      (wrap ? text + (draft.slice(start, end) || "text") + text : text) +
      draft.slice(end)
    onDraftChange(value)
    requestAnimationFrame(() => {
      textarea.current?.focus()
      textarea.current?.setSelectionRange(
        start + text.length,
        wrap ? end + text.length + (end === start ? 4 : 0) : start + text.length
      )
    })
  }
  return (
    <form
      className="min-w-0 shrink-0 overflow-hidden rounded-xl border bg-background"
      onSubmit={(e) => {
        e.preventDefault()
        if (!pending) onSend()
      }}
    >
      {replyTo && (
        <div className="flex items-start gap-2 border-b px-3 py-2.5">
          <IconArrowBackUp className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium">Replying to {replyTo.author}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {replyTo.body}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-6 shrink-0"
            aria-label="Cancel reply"
            onClick={onCancelReply}
          >
            <IconX className="size-3.5" />
          </Button>
        </div>
      )}
      <textarea
        ref={textarea}
        aria-label={`Message ${name}`}
        placeholder={replyTo ? "Write a reply…" : "Write an internal message…"}
        className="block min-h-24 w-full resize-none bg-transparent px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            if (!pending) onSend()
          }
        }}
      />
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pb-3">
          {attachments.map((file) => (
            <span
              key={file.id}
              className="inline-flex max-w-full items-center gap-1 rounded-lg border bg-muted/40 px-2 py-1 text-xs"
            >
              {file.image ? (
                <Image
                  src={file.url}
                  unoptimized
                  width={28}
                  height={28}
                  alt={file.name}
                  className="size-7 rounded object-cover"
                />
              ) : (
                <IconPaperclip className="size-3 shrink-0" />
              )}
              <span className="truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-5"
                aria-label={`Remove ${file.name}`}
                onClick={() => onRemoveAttachment(file.id)}
              >
                <IconX className="size-3" />
              </Button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-1 border-t px-2 py-2">
        <div className="flex items-center gap-0.5">
          <Popover.Root>
            <Popover.Trigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Text formatting"
                  title="Text formatting"
                />
              }
            >
              T
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner side="top" sideOffset={8} className="z-[70]">
                <Popover.Popup className="flex gap-1 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
                  <Popover.Title className="sr-only">
                    Text formatting
                  </Popover.Title>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insert("**", true)}
                  >
                    <strong>Bold</strong>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insert("*", true)}
                  >
                    <em>Italic</em>
                  </Button>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
          <EmojiPicker label="Add emoji" onSelect={insert} />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Attach file"
                  onClick={() => fileInput.current?.click()}
                />
              }
            >
              <IconPaperclip className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Attach file</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Add image"
                  onClick={() => imageInput.current?.click()}
                />
              }
            >
              <IconPhoto className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Add image</TooltipContent>
          </Tooltip>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="submit"
                size="icon-sm"
                aria-label="Send internal message"
                disabled={pending || (!draft.trim() && !attachments.length)}
              />
            }
          >
            <IconSend className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Send · Enter</TooltipContent>
        </Tooltip>
      </div>
      <input
        ref={fileInput}
        type="file"
        multiple
        className="hidden"
        aria-label="Choose attachments"
        onChange={(e) => {
          onAddAttachments(Array.from(e.target.files ?? []))
          e.target.value = ""
        }}
      />
      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-label="Choose images"
        onChange={(e) => {
          onAddAttachments(Array.from(e.target.files ?? []))
          e.target.value = ""
        }}
      />
    </form>
  )
}
