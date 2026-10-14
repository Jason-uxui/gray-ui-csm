import type { Ticket, TicketPerson } from "../types"
import type { InviteDraft, RemoteSession } from "./types"
import { INVITATION_TTL_MS, uniqueRecipientEmails } from "./state"

export const SUPPORT_ASSETS = {
  desktop: "/remote-assist/desktop@3x.png",
  consent: "/remote-assist/consent.png",
  studio: "/remote-assist/studio.svg",
}
export const SUPPORT_STUDIO_LABEL = "MonoGray Studio"
export function invitationMessagePlaceholder(customer: TicketPerson) {
  return `Hi ${customer.name.split(" ")[0]}, open the invitation below to share your screen. I will guide you through this issue. You can stop sharing at any time.`
}
export function defaultInvitation(
  customer: TicketPerson,
  ticket: Ticket
): InviteDraft {
  return {
    email: customer.email ?? "",
    recipients: customer.email ? [customer.email] : [],
    subject: `Remote assistance · ${ticket.subject}`,
    message: "",
  }
}
export function createDemoSession(
  ticket: Ticket,
  customer: TicketPerson,
  agent: TicketPerson,
  draft: InviteDraft,
  kind: RemoteSession["kind"],
  at: number
): RemoteSession {
  const id = `${kind === "remote" ? "RA" : "CALL"}-${crypto.randomUUID().slice(0, 8)}`
  const code = Array.from(crypto.getRandomValues(new Uint32Array(3)), (n) =>
    (n % 1000).toString().padStart(3, "0")
  ).join(" ")
  const recipients = uniqueRecipientEmails(draft.recipients ?? [draft.email])
  return {
    id,
    ticketId: ticket.id,
    kind,
    customer: { ...customer, email: recipients[0] ?? draft.email },
    recipientEmails: recipients,
    agent,
    subject:
      kind === "phone" ? `Phone support · ${ticket.subject}` : draft.subject,
    invitationMessage:
      kind === "phone"
        ? `Phone support with ${customer.name} · ${ticket.subject}`
        : draft.message,
    accessCode: code,
    status: kind === "remote" ? "waiting" : "dialing",
    createdAt: at,
    expiresAt: at + INVITATION_TTL_MS,
    control: "none",
    recordingPermission: "none",
    recording: "none",
    muted: false,
    cameraOn: false,
    onHold: false,
    dialedDigits: "",
    outcome: "",
    notes: [],
    messages: [],
    events: [
      {
        id: `${id}-event-0`,
        title: kind === "remote" ? "Invitation sent" : "Call started",
        detail:
          kind === "remote"
            ? `Demo invitation prepared for ${customer.name}.`
            : `Calling ${customer.name} in the demo.`,
        at,
      },
    ],
  }
}
export function welcomeMessages(session: RemoteSession, at: number) {
  return session.kind === "remote"
    ? [
        {
          id: `${session.id}-welcome-1`,
          author: session.customer,
          body: "I can see the issue on this page.",
          at,
        },
        {
          id: `${session.id}-welcome-2`,
          author: session.agent,
          body: "Thanks. Please open your browser settings; I will guide you.",
          at,
        },
      ]
    : []
}
