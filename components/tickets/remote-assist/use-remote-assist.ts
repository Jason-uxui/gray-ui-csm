"use client"

import { useEffect, useReducer, useState } from "react"
import type { Ticket, TicketPerson } from "@/lib/tickets/types"
import type {
  InviteDraft,
  RemoteSession,
  SessionAction,
} from "@/lib/tickets/remote-assist/types"
import {
  createDemoSession,
  welcomeMessages,
} from "@/lib/tickets/remote-assist/mock-data"
import {
  decodeSessions,
  encodeSessions,
  sessionStorageKey,
} from "@/lib/tickets/remote-assist/storage"
import {
  isActiveSession,
  isValidInvite,
  transitionSession,
} from "@/lib/tickets/remote-assist/state"
import { sampleRecordingAction } from "@/lib/tickets/remote-assist/sample-customer"

type Store = { hydrated: boolean; sessions: RemoteSession[]; error: string }
type Action =
  | { type: "hydrate"; sessions: RemoteSession[]; error: string }
  | { type: "create"; session: RemoteSession }
  | { type: "update"; id: string; action: SessionAction }
  | { type: "tick"; at: number }
  | { type: "reset" }
function reducer(state: Store, action: Action): Store {
  switch (action.type) {
    case "hydrate":
      return { hydrated: true, sessions: action.sessions, error: action.error }
    case "create":
      if (state.sessions.some(isActiveSession)) return state
      return { ...state, sessions: [...state.sessions, action.session] }
    case "update":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id ? transitionSession(s, action.action) : s
        ),
      }
    case "tick": {
      const sessions = state.sessions.map((session) => {
        if (
          isActiveSession(session) &&
          session.startedAt === undefined &&
          session.expiresAt <= action.at
        )
          return transitionSession(session, { type: "expire", at: action.at })
        const recordingAction = sampleRecordingAction(session, action.at)
        return recordingAction
          ? transitionSession(session, recordingAction)
          : session
      })
      return sessions.some(
        (session, index) => session !== state.sessions[index]
      )
        ? { ...state, sessions }
        : state
    }
    case "reset":
      return { hydrated: true, sessions: [], error: "" }
  }
}
export function useRemoteAssist(
  ticket: Ticket,
  customer: TicketPerson,
  agent: TicketPerson
) {
  const [state, dispatch] = useReducer(reducer, {
    hydrated: false,
    sessions: [],
    error: "",
  })
  const [now, setNow] = useState(() => Date.now())
  const [storageError, setStorageError] = useState("")
  useEffect(() => {
    try {
      dispatch({
        type: "hydrate",
        sessions: decodeSessions(
          sessionStorage.getItem(sessionStorageKey(ticket.id)),
          ticket.id
        ),
        error: "",
      })
    } catch {
      dispatch({
        type: "hydrate",
        sessions: [],
        error:
          "The saved demo history could not be loaded. Reset this demo to continue.",
      })
    }
  }, [ticket.id])
  useEffect(() => {
    if (!state.hydrated || state.error) return
    try {
      sessionStorage.setItem(
        sessionStorageKey(ticket.id),
        encodeSessions(state.sessions)
      )
    } catch {
      queueMicrotask(() =>
        setStorageError(
          "Browser storage is full or unavailable. This session will only be kept while the page stays open."
        )
      )
    }
  }, [state, ticket.id])
  useEffect(() => {
    const timer = window.setInterval(() => {
      const at = Date.now()
      setNow(at)
      dispatch({ type: "tick", at })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])
  const active = state.sessions.find(isActiveSession)
  function create(draft: InviteDraft, kind: RemoteSession["kind"] = "remote") {
    if (
      !state.hydrated ||
      state.error ||
      active ||
      (kind === "remote" &&
        !isValidInvite(
          draft.recipients ?? draft.email,
          draft.subject,
          draft.message
        ))
    )
      return null
    const session = createDemoSession(
      ticket,
      customer,
      agent,
      draft,
      kind,
      Date.now()
    )
    dispatch({ type: "create", session })
    return session.id
  }
  return {
    sessions: state.sessions,
    hydrated: state.hydrated,
    active,
    now,
    error: state.error || storageError,
    create,
    update: (id: string, action: SessionAction) => {
      const session = state.sessions.find((s) => s.id === id)
      dispatch({
        type: "update",
        id,
        action:
          action.type === "join" && session
            ? { ...action, welcome: welcomeMessages(session, action.at) }
            : action,
      })
    },
    reset: () => {
      try {
        sessionStorage.removeItem(sessionStorageKey(ticket.id))
      } catch {}
      dispatch({ type: "reset" })
      setStorageError("")
    },
  }
}
export type RemoteAssistController = ReturnType<typeof useRemoteAssist>
