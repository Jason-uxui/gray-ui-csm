import type { TicketPerson } from "../types"
import type { ThreadAttachment, ThreadReply } from "../side-conversation/types"

export type SessionStatus =
  | "waiting"
  | "connecting"
  | "live"
  | "disconnected"
  | "reconnecting"
  | "expired"
  | "canceled"
  | "ended"
  | "dialing"
  | "unanswered"
export type Permission = "none" | "requested" | "granted" | "denied"
export type RecordingStatus =
  | "none"
  | "recording"
  | "processing"
  | "ready"
  | "failed"
export type SessionMessage = {
  id: string
  author: TicketPerson
  body: string
  at: number
  attachments?: ThreadAttachment[]
  replyTo?: ThreadReply
}
export type SessionEvent = {
  id: string
  title: string
  detail: string
  at: number
}
export type RemoteSession = {
  id: string
  ticketId: string
  kind: "remote" | "phone"
  customer: TicketPerson
  recipientEmails?: string[]
  agent: TicketPerson
  subject: string
  invitationMessage: string
  accessCode: string
  status: SessionStatus
  createdAt: number
  expiresAt: number
  startedAt?: number
  endedAt?: number
  control: Permission
  recordingPermission: Permission
  recording: RecordingStatus
  muted: boolean
  cameraOn: boolean
  onHold: boolean
  dialedDigits: string
  messages: SessionMessage[]
  notes: SessionMessage[]
  events: SessionEvent[]
  outcome: string
}
export type SessionAction =
  | {
      type:
        | "join"
        | "connecting"
        | "disconnect"
        | "reconnect"
        | "expire"
        | "cancel"
        | "unanswered"
        | "end"
      at: number
      welcome?: SessionMessage[]
    }
  | { type: "control" | "recording-permission"; value: Permission; at: number }
  | { type: "recording-result"; value: "ready" | "failed"; at: number }
  | { type: "media"; field: "muted" | "cameraOn" | "onHold"; at: number }
  | { type: "digit"; digit: string; at: number }
  | { type: "message" | "note"; message: SessionMessage; at: number }
  | { type: "outcome"; value: string; at: number }
  | { type: "screenshot"; at: number }
export type InviteDraft = {
  email: string
  recipients?: string[]
  subject: string
  message: string
}
