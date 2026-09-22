export type NotificationKind =
  | "assignment"
  | "mention"
  | "customer-reply"
  | "sla-risk"
  | "ticket-update"
  | "automation-failure"
  | "knowledge-review"

export type NotificationDateGroup = "Today" | "Yesterday" | "Earlier"

export type AppNotification = {
  id: string
  kind: NotificationKind
  source: string
  action: string
  objectLabel: string
  detail?: string
  timestampLabel: string
  dateGroup: NotificationDateGroup
  destination: string
  isRead: boolean
}
