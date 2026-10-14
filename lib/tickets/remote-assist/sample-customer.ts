import type { RemoteSession, SessionAction } from "./types"

const CONNECT_DELAY_MS = 1800
const SHARE_DELAY_MS = 1200
const PERMISSION_DELAY_MS = 900
export const SAMPLE_RECORDING_DELAY_MS = 4000

// The UI-only customer's responses are isolated here so a real connection can
// replace them without changing the workspace or session state model.
export function sampleCustomerResponse(session: RemoteSession) {
  if (
    (session.kind === "remote" && session.status === "waiting") ||
    (session.kind === "phone" && session.status === "dialing")
  )
    return {
      delayMs: CONNECT_DELAY_MS,
      action: { type: "connecting" } as const,
    }
  if (session.status === "connecting" || session.status === "reconnecting")
    return { delayMs: SHARE_DELAY_MS, action: { type: "join" } as const }
  if (session.status !== "live") return null
  // Connected sample calls include supplied audio for the result-card demo.
  // Keep the same request/response transitions as real consent; this adapter
  // never records the microphone or connects to a calling service.
  if (session.kind === "phone" && session.recordingPermission === "none")
    return {
      delayMs: PERMISSION_DELAY_MS,
      action: { type: "recording-permission", value: "requested" } as const,
    }
  if (session.kind === "remote" && session.control === "requested")
    return {
      delayMs: PERMISSION_DELAY_MS,
      action: { type: "control", value: "granted" } as const,
    }
  if (session.recordingPermission === "requested")
    return {
      delayMs: PERMISSION_DELAY_MS,
      action: { type: "recording-permission", value: "granted" } as const,
    }
  return null
}

export function sampleCustomerAction(
  session: RemoteSession,
  at: number
): SessionAction | null {
  const response = sampleCustomerResponse(session)
  return response ? { ...response.action, at } : null
}
export function sampleRecordingAction(
  session: RemoteSession,
  at: number
): SessionAction | null {
  if (
    session.status !== "ended" ||
    session.recording !== "processing" ||
    session.recordingPermission !== "granted" ||
    session.endedAt === undefined ||
    at < session.endedAt + SAMPLE_RECORDING_DELAY_MS
  )
    return null
  return { type: "recording-result", value: "ready", at }
}
