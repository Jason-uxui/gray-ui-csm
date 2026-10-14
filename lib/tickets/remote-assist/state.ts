import type { RemoteSession, SessionAction, SessionStatus } from "./types"

export const INVITATION_TTL_MS = 5 * 60 * 1000
export const TERMINAL_STATUSES: SessionStatus[] = [
  "expired",
  "canceled",
  "ended",
  "unanswered",
]
export function isActiveSession(session: RemoteSession) {
  return !TERMINAL_STATUSES.includes(session.status)
}
export function parseRecipientEmails(value: string) {
  return value
    .split(/[,;\n]+/)
    .map((email) => email.trim())
    .filter(Boolean)
}
export function uniqueRecipientEmails(emails: string[]) {
  const seen = new Set<string>()
  return emails
    .map((email) => email.trim())
    .filter((email) => {
      const key = email.toLowerCase()
      if (!email || seen.has(key)) return false
      seen.add(key)
      return true
    })
}
export function isValidRecipientEmail(email: string) {
  return /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email.trim())
}
export function isValidInvite(
  email: string | string[],
  subject: string,
  message: string
) {
  const recipients = typeof email === "string" ? [email] : email
  return (
    recipients.length > 0 &&
    recipients.every(isValidRecipientEmail) &&
    !!subject.trim() &&
    !!message.trim()
  )
}
export function durationSeconds(session: RemoteSession, now: number) {
  return session.startedAt === undefined
    ? 0
    : Math.max(
        0,
        Math.floor(((session.endedAt ?? now) - session.startedAt) / 1000)
      )
}
export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
}
export function formatSessionDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes} min ${seconds % 60} sec`
}
export function remainingSeconds(session: RemoteSession, now: number) {
  return Math.max(0, Math.ceil((session.expiresAt - now) / 1000))
}
export function transitionSession(
  session: RemoteSession,
  action: SessionAction
): RemoteSession {
  let next = session
  let title = ""
  let detail = ""
  const live = session.status === "live"
  const active = isActiveSession(session)
  switch (action.type) {
    case "connecting":
      if (
        !active ||
        !["waiting", "dialing"].includes(session.status) ||
        action.at >= session.expiresAt
      )
        return session
      next = { ...session, status: "connecting" }
      break
    case "join":
      if (
        !active ||
        !["waiting", "dialing", "connecting", "reconnecting"].includes(
          session.status
        )
      )
        return session
      if (session.startedAt === undefined && action.at >= session.expiresAt)
        return transitionSession(session, { type: "expire", at: action.at })
      next = {
        ...session,
        status: "live",
        startedAt: session.startedAt ?? action.at,
        messages:
          session.startedAt === undefined && !session.messages.length
            ? (action.welcome ?? [])
            : session.messages,
      }
      title =
        session.startedAt === undefined
          ? session.kind === "phone"
            ? "Call connected"
            : "Session started"
          : "Connection restored"
      detail = `${session.customer.name} joined the ${session.kind === "phone" ? "call" : "screen-sharing session"}.`
      break
    case "expire":
      if (!active || session.startedAt !== undefined) return session
      next = {
        ...session,
        status: session.kind === "phone" ? "unanswered" : "expired",
        endedAt: action.at,
      }
      title =
        session.kind === "phone" ? "Call unanswered" : "Invitation expired"
      detail =
        session.kind === "phone"
          ? "The customer did not answer. Try calling again."
          : "Send a new invitation to continue."
      break
    case "cancel":
    case "unanswered":
      if (!active || session.startedAt !== undefined) return session
      next = {
        ...session,
        status: action.type === "cancel" ? "canceled" : "unanswered",
        endedAt: action.at,
      }
      title =
        action.type === "cancel"
          ? session.kind === "phone"
            ? "Call canceled"
            : "Invitation canceled"
          : "Call unanswered"
      detail = "No support session was started."
      break
    case "end":
      if (!active) return session
      next = {
        ...session,
        status: session.startedAt === undefined ? "canceled" : "ended",
        endedAt: action.at,
        control: "none",
        onHold: false,
        recording: session.recording === "recording" ? "processing" : "none",
      }
      title =
        session.startedAt === undefined
          ? session.kind === "phone"
            ? "Call canceled"
            : "Invitation canceled"
          : session.kind === "phone"
            ? "Call ended"
            : "Session ended"
      detail =
        session.startedAt === undefined
          ? "The customer did not join."
          : `Duration ${formatDuration(durationSeconds(next, action.at))}.`
      break
    case "disconnect":
      if (!live) return session
      next = { ...session, status: "disconnected", control: "none" }
      title = "Connection lost"
      detail =
        session.kind === "phone"
          ? "Call disconnected. Waiting to reconnect."
          : "Remote control released. Waiting to reconnect."
      break
    case "reconnect":
      if (session.status !== "disconnected") return session
      next = { ...session, status: "reconnecting" }
      title = "Reconnecting"
      detail = "Trying to restore the session."
      break
    case "control":
      if (
        !live ||
        session.kind !== "remote" ||
        action.value === session.control
      )
        return session
      if (
        ["granted", "denied"].includes(action.value) &&
        session.control !== "requested"
      )
        return session
      next = { ...session, control: action.value }
      title = "Remote control permission"
      detail =
        action.value === "none"
          ? "View only. Control released."
          : `Customer permission: ${action.value}.`
      break
    case "recording-permission":
      if (!live || action.value === session.recordingPermission) return session
      if (
        ["granted", "denied"].includes(action.value) &&
        session.recordingPermission !== "requested"
      )
        return session
      next = {
        ...session,
        recordingPermission: action.value,
        recording: action.value === "granted" ? "recording" : "none",
      }
      title = "Recording permission"
      detail = `Customer permission: ${action.value}.`
      break
    case "recording-result":
      if (
        session.status !== "ended" ||
        !["processing", "failed", "ready"].includes(session.recording) ||
        session.recordingPermission !== "granted" ||
        session.recording === action.value
      )
        return session
      next = { ...session, recording: action.value }
      title =
        action.value === "ready"
          ? "Demo recording ready"
          : "Recording processing failed"
      detail = "Demo scenario; no real call was recorded."
      break
    case "media":
      if (
        !active ||
        (action.field === "onHold" && (!live || session.kind !== "phone"))
      )
        return session
      next = { ...session, [action.field]: !session[action.field] }
      break
    case "digit":
      if (
        !live ||
        session.kind !== "phone" ||
        !/^[0-9*#]$/.test(action.digit) ||
        session.dialedDigits.length >= 32
      )
        return session
      next = { ...session, dialedDigits: session.dialedDigits + action.digit }
      break
    case "message":
    case "note": {
      if (
        !live ||
        (!action.message.body.trim() && !action.message.attachments?.length)
      )
        return session
      const key = action.type === "message" ? "messages" : "notes"
      if (session[key].some((m) => m.id === action.message.id)) return session
      next = { ...session, [key]: [...session[key], action.message] }
      break
    }
    case "outcome":
      if (session.outcome === action.value) return session
      next = { ...session, outcome: action.value }
      break
    case "screenshot":
      if (!live || session.kind !== "remote") return session
      next = { ...session }
      title = "Screenshot captured"
      detail = "A screenshot of the demo screen was downloaded."
      break
  }
  return title
    ? {
        ...next,
        events: [
          ...next.events,
          {
            id: `${session.id}-event-${session.events.length}`,
            at: action.at,
            title,
            detail,
          },
        ],
      }
    : next
}
