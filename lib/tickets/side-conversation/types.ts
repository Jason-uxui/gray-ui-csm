import type { TicketTimelineMessage } from "../detail-data"

export type SideConversationMode = "thread" | "email" | "children"
export type ThreadAttachment = {
  id: string
  name: string
  url: string
  image: boolean
}
export type ThreadReply = { id: string; author: string; body: string }
export type ThreadMessage = {
  replyTo?: ThreadReply
  attachments?: ThreadAttachment[]
  id: string
  body: string
  time: string
  author: string
  forwarded?: TicketTimelineMessage
}

export type Teammate = {
  id: string
  name: string
  email: string
  online: boolean
  role: string
}
export type SideConversationState = {
  messages: Record<string, ThreadMessage[]>
  drafts: Record<string, string>
  attachments: Record<string, ThreadAttachment[]>
  replies: Record<string, ThreadReply | undefined>
  reactions: Record<string, string[]>
  childIds: string[]
  email: { to: string; subject: string; body: string }
  emails: Array<{ id: string; to: string; subject: string; body: string }>
  pendingUploads: Record<string, number>
  notice: string
}
