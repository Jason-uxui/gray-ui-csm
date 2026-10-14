import type { RemoteSession, SessionStatus } from "./types"
import type { TicketTimelineEvent } from "../detail-data"

export const sessionStatusLabel: Record<SessionStatus, string> = {
  waiting: "Waiting for customer",
  connecting: "Connecting",
  live: "Connected",
  disconnected: "Disconnected",
  reconnecting: "Reconnecting",
  expired: "Invitation expired",
  canceled: "Canceled",
  ended: "Completed",
  dialing: "Calling",
  unanswered: "Unanswered",
}
export const recordingLabel = {
  none: "Not recorded",
  recording: "Recording",
  processing: "Recording is processing",
  ready: "Demo recording ready",
  failed: "Recording failed",
}
export const timeLabel = (at: number) =>
  new Date(at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
export const dateLabel = (at: number) =>
  new Date(at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
export const shortDateLabel = (at: number) =>
  new Date(at).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
export function sessionTimeline(
  sessions: RemoteSession[]
): TicketTimelineEvent[] {
  return sessions.flatMap((session) => {
    const initial: TicketTimelineEvent = {
      id: `${session.id}-invitation`,
      kind: "event",
      timestamp: timeLabel(session.createdAt),
      title: session.kind === "remote" ? "Remote assistance" : "Call started",
      detail: session.invitationMessage,
      remoteAssist: { session, phase: "invitation" },
    }
    if (session.endedAt === undefined)
      return session.kind === "phone" ? [] : [initial]
    return [
      ...(session.kind === "phone" ? [] : [initial]),
      {
        id: `${session.id}-summary`,
        kind: "event",
        timestamp: timeLabel(session.endedAt),
        title: session.kind === "remote" ? "Session ended" : "Call ended",
        detail: session.outcome,
        remoteAssist: { session, phase: "summary" },
      } satisfies TicketTimelineEvent,
    ]
  })
}
