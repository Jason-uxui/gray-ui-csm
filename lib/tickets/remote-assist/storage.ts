import type { RemoteSession } from "./types"

const STORAGE_VERSION = 1
const MAX_HISTORY = 20
export const sessionStorageKey = (ticketId: string) =>
  `gray-csm-remote-assist:${ticketId}`
export function decodeSessions(
  raw: string | null,
  ticketId: string
): RemoteSession[] {
  if (!raw) return []
  const parsed: unknown = JSON.parse(raw)
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("version" in parsed) ||
    parsed.version !== STORAGE_VERSION ||
    !("sessions" in parsed) ||
    !Array.isArray(parsed.sessions)
  )
    throw new Error("Unsupported demo history")
  const statuses = [
    "waiting",
    "connecting",
    "live",
    "disconnected",
    "reconnecting",
    "expired",
    "canceled",
    "ended",
    "dialing",
    "unanswered",
  ]
  const permission = ["none", "requested", "granted", "denied"]
  return parsed.sessions.slice(-MAX_HISTORY).map((s: unknown) => {
    if (!s || typeof s !== "object") throw new Error("Invalid session")
    const v = s as RemoteSession
    if (
      v.ticketId !== ticketId ||
      typeof v.id !== "string" ||
      !["remote", "phone"].includes(v.kind) ||
      !statuses.includes(v.status) ||
      !Number.isFinite(v.createdAt) ||
      !Number.isFinite(v.expiresAt) ||
      (v.startedAt !== undefined && !Number.isFinite(v.startedAt)) ||
      (v.endedAt !== undefined && !Number.isFinite(v.endedAt)) ||
      !v.customer ||
      typeof v.customer.name !== "string" ||
      !v.agent ||
      typeof v.agent.name !== "string" ||
      typeof v.subject !== "string" ||
      typeof v.invitationMessage !== "string" ||
      (v.recipientEmails !== undefined &&
        (!Array.isArray(v.recipientEmails) ||
          v.recipientEmails.some((email) => typeof email !== "string"))) ||
      typeof v.accessCode !== "string" ||
      !permission.includes(v.control) ||
      !permission.includes(v.recordingPermission) ||
      !["none", "recording", "processing", "ready", "failed"].includes(
        v.recording
      ) ||
      typeof v.muted !== "boolean" ||
      typeof v.cameraOn !== "boolean" ||
      typeof v.onHold !== "boolean" ||
      typeof v.dialedDigits !== "string" ||
      typeof v.outcome !== "string" ||
      !Array.isArray(v.messages) ||
      !Array.isArray(v.notes) ||
      !Array.isArray(v.events) ||
      [...v.messages, ...v.notes].some(
        (m) =>
          !m ||
          typeof m.id !== "string" ||
          typeof m.body !== "string" ||
          !m.author ||
          typeof m.author.name !== "string" ||
          !Number.isFinite(m.at) ||
          (m.attachments !== undefined &&
            (!Array.isArray(m.attachments) ||
              m.attachments.some(
                (a) =>
                  !a ||
                  typeof a.id !== "string" ||
                  typeof a.name !== "string" ||
                  typeof a.url !== "string" ||
                  !/^data:[^;]+;base64,/.test(a.url)
              )))
      ) ||
      v.events.some(
        (e) =>
          !e ||
          typeof e.id !== "string" ||
          typeof e.title !== "string" ||
          typeof e.detail !== "string" ||
          !Number.isFinite(e.at)
      )
    )
      throw new Error("Invalid demo history")
    return v
  })
}
export function encodeSessions(sessions: RemoteSession[]) {
  return JSON.stringify({
    version: STORAGE_VERSION,
    sessions: sessions.slice(-MAX_HISTORY),
  })
}
