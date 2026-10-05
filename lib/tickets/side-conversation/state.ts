import type {
  SideConversationState,
  ThreadAttachment,
  ThreadMessage,
  ThreadReply,
} from "./types"

export type SideConversationAction =
  | { type: "draft"; personId: string; value: string }
  | { type: "attachments-added"; personId: string; files: ThreadAttachment[] }
  | { type: "attachment-removed"; personId: string; id: string }
  | { type: "reply"; personId: string; value?: ThreadReply }
  | { type: "message-sent"; personId: string; message: ThreadMessage }
  | {
      type: "message-forwarded"
      personId: string
      message: ThreadMessage
      recipientName: string
    }
  | { type: "reaction"; personId: string; messageId: string; emoji: string }
  | { type: "email-draft"; field: "to" | "subject" | "body"; value: string }
  | { type: "email-forward"; to: string; body: string }
  | { type: "email-sent"; id: string }
  | { type: "child-linked" | "child-unlinked"; id: string }
  | { type: "upload-started" | "upload-finished"; personId: string }
  | { type: "notice"; value: string }

export function createSideConversationState(
  subject: string,
  messages: Record<string, ThreadMessage[]>
): SideConversationState {
  return {
    messages,
    drafts: {},
    attachments: {},
    replies: {},
    reactions: {},
    childIds: [],
    email: { to: "", subject, body: "" },
    emails: [],
    pendingUploads: {},
    notice: "",
  }
}
export function sideConversationReducer(
  state: SideConversationState,
  action: SideConversationAction
): SideConversationState {
  switch (action.type) {
    case "draft":
      return {
        ...state,
        drafts: { ...state.drafts, [action.personId]: action.value },
      }
    case "attachments-added":
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [action.personId]: [
            ...(state.attachments[action.personId] ?? []),
            ...action.files,
          ],
        },
      }
    case "attachment-removed":
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [action.personId]: (state.attachments[action.personId] ?? []).filter(
            (file) => file.id !== action.id
          ),
        },
      }
    case "reply":
      return {
        ...state,
        replies: { ...state.replies, [action.personId]: action.value },
      }
    case "message-sent": {
      if (
        state.pendingUploads[action.personId] ||
        (!action.message.body.trim() && !action.message.attachments?.length)
      )
        return state
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.personId]: [
            ...(state.messages[action.personId] ?? []),
            action.message,
          ],
        },
        drafts: { ...state.drafts, [action.personId]: "" },
        attachments: { ...state.attachments, [action.personId]: [] },
        replies: { ...state.replies, [action.personId]: undefined },
        notice: "",
      }
    }
    case "message-forwarded":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.personId]: [
            ...(state.messages[action.personId] ?? []),
            action.message,
          ],
        },
        notice: `Forwarded to ${action.recipientName}`,
      }
    case "reaction": {
      if (
        !state.messages[action.personId]?.some(
          (message) => message.id === action.messageId
        )
      )
        return state
      const key = `${action.personId}:${action.messageId}`
      const selected = state.reactions[key] ?? []
      return {
        ...state,
        reactions: {
          ...state.reactions,
          [key]: selected.includes(action.emoji)
            ? selected.filter((emoji) => emoji !== action.emoji)
            : [...selected, action.emoji],
        },
      }
    }
    case "email-draft":
      return {
        ...state,
        email: { ...state.email, [action.field]: action.value },
      }
    case "email-forward":
      return {
        ...state,
        email: { ...state.email, to: action.to, body: action.body },
        notice: "",
      }
    case "email-sent": {
      if (
        !state.email.to.trim() ||
        !state.email.subject.trim() ||
        !state.email.body.trim()
      )
        return state
      return {
        ...state,
        emails: [...state.emails, { ...state.email, id: action.id }],
        email: { ...state.email, body: "" },
        notice: "Email sent in demo",
      }
    }
    case "child-linked":
      return state.childIds.includes(action.id)
        ? state
        : { ...state, childIds: [...state.childIds, action.id] }
    case "child-unlinked":
      return {
        ...state,
        childIds: state.childIds.filter((id) => id !== action.id),
      }
    case "upload-started":
      return {
        ...state,
        pendingUploads: {
          ...state.pendingUploads,
          [action.personId]: (state.pendingUploads[action.personId] ?? 0) + 1,
        },
      }
    case "upload-finished":
      return {
        ...state,
        pendingUploads: {
          ...state.pendingUploads,
          [action.personId]: Math.max(
            0,
            (state.pendingUploads[action.personId] ?? 0) - 1
          ),
        },
      }
    case "notice":
      return { ...state, notice: action.value }
  }
}
