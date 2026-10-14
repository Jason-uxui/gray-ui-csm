"use client"

import { useEffect, useRef, useState } from "react"
import { createAttachmentQueue } from "@/lib/tickets/side-conversation/attachments"
import type {
  ThreadAttachment,
  ThreadReply,
} from "@/lib/tickets/side-conversation/types"
import type {
  RemoteSession,
  SessionAction,
} from "@/lib/tickets/remote-assist/types"

export function useSessionComposer(
  session: RemoteSession,
  onAction: (action: SessionAction) => void
) {
  const [draft, setDraft] = useState("")
  const [attachments, setAttachments] = useState<ThreadAttachment[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [replyTo, setReplyTo] = useState<ThreadReply | undefined>()
  const [error, setError] = useState("")
  const queue = useRef<ReturnType<typeof createAttachmentQueue> | null>(null)
  useEffect(() => {
    const instance = createAttachmentQueue({
      start: () => setPendingCount((n) => n + 1),
      complete: (_, files) =>
        setAttachments((current) => [...current, ...files]),
      error: (_, message) => setError(message),
      finish: () => setPendingCount((n) => Math.max(0, n - 1)),
    })
    queue.current = instance
    return () => {
      instance.dispose()
      queue.current = null
    }
  }, [])
  function send() {
    if (
      session.status !== "live" ||
      pendingCount > 0 ||
      (!draft.trim() && !attachments.length)
    )
      return
    const at = Date.now()
    onAction({
      type: "message",
      at,
      message: {
        id: crypto.randomUUID(),
        author: session.agent,
        body: draft.trim(),
        at,
        attachments,
        replyTo,
      },
    })
    setDraft("")
    setAttachments([])
    setReplyTo(undefined)
  }
  return {
    draft,
    setDraft,
    attachments,
    replyTo,
    setReplyTo,
    error,
    pending: pendingCount > 0,
    send,
    add: (files: File[]) => {
      setError("")
      void queue.current?.add(session.id, files)
    },
    remove: (id: string) =>
      setAttachments((current) => current.filter((a) => a.id !== id)),
  }
}
