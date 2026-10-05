"use client"

import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { useSearchParams } from "next/navigation"
import { currentUser } from "@/lib/current-user"
import { tickets } from "@/lib/tickets/mock-data"
import type { Ticket } from "@/lib/tickets/types"
import type { TicketTimelineMessage } from "@/lib/tickets/detail-data"
import type {
  SideConversationMode,
  ThreadMessage,
} from "@/lib/tickets/side-conversation/types"
import {
  createSideConversationState,
  sideConversationReducer,
} from "@/lib/tickets/side-conversation/state"
import { createAttachmentQueue } from "@/lib/tickets/side-conversation/attachments"
import {
  createDemoMessages,
  teammates,
} from "@/lib/tickets/side-conversation/mock-data"
import {
  getChildTicketCandidates,
  messageTime,
  readSideConversationLocation,
} from "@/lib/tickets/side-conversation/helpers"
import { getTicketNumberLabel } from "../ticket-detail-helpers"

// Matches the existing detail-panel shell's xl breakpoint.
const DESKTOP_PANEL_QUERY = "(min-width: 1280px)"
function subscribeToViewport(callback: () => void) {
  const query = window.matchMedia(DESKTOP_PANEL_QUERY)
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}
const desktopSnapshot = () => window.matchMedia(DESKTOP_PANEL_QUERY).matches
const serverSnapshot = () => true

export function useSideConversationState(ticket: Ticket) {
  const params = useSearchParams()
  const { mode, target, active } = readSideConversationLocation(params)
  const isDesktop = useSyncExternalStore(
    subscribeToViewport,
    desktopSnapshot,
    serverSnapshot
  )
  const [state, dispatch] = useReducer(sideConversationReducer, undefined, () =>
    createSideConversationState(
      `Re: ${getTicketNumberLabel(ticket)} — ${ticket.subject}`,
      createDemoMessages()
    )
  )
  const [forward, setForward] = useState<TicketTimelineMessage | null>(null)
  const uploads = useRef<ReturnType<typeof createAttachmentQueue> | null>(null)
  useEffect(
    () => () => {
      uploads.current?.dispose()
      uploads.current = null
    },
    []
  )
  const linked = useMemo(
    () => getChildTicketCandidates(ticket, tickets),
    [ticket]
  )

  function navigate(
    nextMode: SideConversationMode | null,
    personId?: string | null
  ) {
    const url = new URL(window.location.href)
    if (nextMode) url.searchParams.set("side", nextMode)
    else url.searchParams.delete("side")
    if (nextMode === "thread" && personId)
      url.searchParams.set("teammate", personId)
    else url.searchParams.delete("teammate")
    window.history.replaceState(null, "", url)
  }
  function setDesktopActive(value: boolean) {
    navigate(value ? mode : null, value ? target : null)
  }
  function setMode(value: SideConversationMode) {
    navigate(value)
    dispatch({ type: "notice", value: "" })
  }
  function setTarget(personId: string | null) {
    navigate("thread", personId)
  }
  function setNotice(value: string) {
    dispatch({ type: "notice", value })
  }
  function addAttachments(personId: string, files: File[]) {
    if (!uploads.current)
      uploads.current = createAttachmentQueue({
        start: (owner) => dispatch({ type: "upload-started", personId: owner }),
        complete: (owner, added) =>
          dispatch({
            type: "attachments-added",
            personId: owner,
            files: added,
          }),
        error: (_owner, value) => dispatch({ type: "notice", value }),
        finish: (owner) =>
          dispatch({ type: "upload-finished", personId: owner }),
      })
    return uploads.current.add(personId, files)
  }
  function sendMessage(personId: string) {
    if (uploads.current?.isPending(personId)) return
    dispatch({
      type: "message-sent",
      personId,
      message: {
        id: crypto.randomUUID(),
        body: state.drafts[personId]?.trim() ?? "",
        attachments: state.attachments[personId] ?? [],
        replyTo: state.replies[personId],
        author: currentUser.name,
        time: messageTime(),
      },
    })
  }
  function sendTo(personId: string) {
    const recipient = teammates.find((person) => person.id === personId)
    if (!forward || !recipient) return
    dispatch({
      type: "message-forwarded",
      personId,
      recipientName: recipient.name,
      message: {
        id: crypto.randomUUID(),
        body: forward.body,
        forwarded: forward,
        author: currentUser.name,
        time: messageTime(),
      },
    })
    setForward(null)
    navigate("thread", personId)
  }
  function forwardToEmail(personId: string) {
    const recipient = teammates.find((person) => person.id === personId)
    if (!forward || !recipient) return
    dispatch({ type: "email-forward", to: recipient.email, body: forward.body })
    setForward(null)
    navigate("email")
  }
  function viewMessage(id: string) {
    if (!isDesktop) navigate(null)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", "conversation")
    window.history.replaceState(null, "", url)
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document
          .getElementsByClassName(`ticket-message-${id}`)[0]
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      )
    )
  }
  return {
    ticket,
    mode,
    target,
    setMode,
    setTarget,
    desktopActive: active,
    isDesktop,
    setDesktopActive,
    mobileOpen: active && !isDesktop,
    setMobileOpen: setDesktopActive,
    open: () => setDesktopActive(true),
    forward,
    setForward,
    sendTo,
    forwardToEmail,
    viewMessage,
    messages: state.messages,
    drafts: state.drafts,
    draftAttachments: state.attachments,
    replyTargets: state.replies,
    reactions: state.reactions,
    pendingUploads: state.pendingUploads,
    notice: state.notice,
    setNotice,
    emailTo: state.email.to,
    emailSubject: state.email.subject,
    emailBody: state.email.body,
    emails: state.emails,
    setEmailTo: (value: string) =>
      dispatch({ type: "email-draft", field: "to", value }),
    setEmailSubject: (value: string) =>
      dispatch({ type: "email-draft", field: "subject", value }),
    setEmailBody: (value: string) =>
      dispatch({ type: "email-draft", field: "body", value }),
    sendEmail: () => dispatch({ type: "email-sent", id: crypto.randomUUID() }),
    childIds: state.childIds,
    linked,
    childTickets: linked.filter((child) => state.childIds.includes(child.id)),
    linkChild: (id: string) => {
      if (linked.some((child) => child.id === id))
        dispatch({ type: "child-linked", id })
    },
    unlinkChild: (id: string) => dispatch({ type: "child-unlinked", id }),
    setDraft: (personId: string, value: string) =>
      dispatch({ type: "draft", personId, value }),
    addAttachments,
    removeAttachment: (personId: string, id: string) =>
      dispatch({ type: "attachment-removed", personId, id }),
    reply: (personId: string, message: ThreadMessage) =>
      dispatch({
        type: "reply",
        personId,
        value: {
          id: message.id,
          author: message.author,
          body:
            message.body ||
            message.attachments?.map((file) => file.name).join(", ") ||
            "Attachment",
        },
      }),
    cancelReply: (personId: string) => dispatch({ type: "reply", personId }),
    toggleReaction: (personId: string, messageId: string, emoji: string) =>
      dispatch({ type: "reaction", personId, messageId, emoji }),
    sendMessage,
  }
}
