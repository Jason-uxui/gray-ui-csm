export type CustomerHealth = "healthy" | "watch" | "at_risk"

export type CustomerLifecycle =
  | "onboarding"
  | "active"
  | "renewal"
  | "paused"
  | "archived"

export type CustomerPlan = "Starter" | "Growth" | "Scale" | "Enterprise"

export type CustomerViewKey =
  | "all"
  | "mine"
  | "at-risk"
  | "renewal"
  | "high-touch"

export type CustomerLayoutMode = "table" | "card"

export type CustomerOwner = {
  name: string
  email: string
  avatarUrl?: string
}

export type CustomerTicketStatus = "open" | "pending" | "resolved"

export type CustomerTicketPriority = "high" | "medium" | "low"

export type CustomerResponseTone = "slow" | "steady" | "healthy"

export type CustomerActivityTone = "neutral" | "warning" | "positive"

export type CustomerAttachmentType =
  | "pdf"
  | "image"
  | "doc"
  | "sheet"
  | "slide"
  | "zip"
  | "link"
  | "other"

export type CustomerAttachmentSource = {
  kind: "ticket" | "manual"
  ticketId?: string
}

export type CustomerRecentTicket = {
  id: string
  subject: string
  status: CustomerTicketStatus
  priority: CustomerTicketPriority
  assigneeLabel: string
  requestDate: string
}

export type CustomerActivityEvent = {
  id: string
  title: string
  detail?: string
  timestamp: string
  tone: CustomerActivityTone
}

export type CustomerAttachment = {
  id: string
  name: string
  type: CustomerAttachmentType
  sizeMB: number
  url: string
  addedBy: CustomerOwner
  addedAt: string
  source: CustomerAttachmentSource
  isLinkAsset?: boolean
  attachments?: Array<{
    id: string
    name: string
    type: CustomerAttachmentType
    sizeMB: number
    url: string
  }>
}

export type CustomerCompanyProfile = {
  companyDisplayName: string
  contactsCount: number
  tier: string
  accountManager: string
  renewalDate: string
  revenue: number
}

export type CustomerDrawerSectionState = {
  tickets: boolean
  activity: boolean
  notes: boolean
  companyExpanded: boolean
}

export type Customer = {
  id: string
  companyName: string
  primaryContactName: string
  primaryContactEmail: string
  alternateEmails: string[]
  phoneNumber: string
  website: string
  region: string
  source: string
  responseTimeLabel: string
  languagesSpoken: string[]
  timezone: string
  firstContactDate: string
  segment: string
  plan: CustomerPlan
  lifecycle: CustomerLifecycle
  health: CustomerHealth
  owner: CustomerOwner
  openTickets: number
  csat: number
  annualValue: number
  seats: number
  lastTouchLabel: string
  lastTouchDate: string
  lastTouchSortValue: number
  nextRenewalLabel: string
  summary: string
  notes: string
  productAreas: string[]
  riskSignals: string[]
  recentTickets: CustomerRecentTicket[]
  attachments: CustomerAttachment[]
  activityEvents: CustomerActivityEvent[]
  companyProfile: CustomerCompanyProfile
}

export interface CustomerSidebarItem {
  key: string
  label: string
  count: number
}

export interface CustomerSidebarGroup {
  key: "views" | "segment" | "lifecycle"
  label: string
  items: CustomerSidebarItem[]
}

export const customerHealthLabels: Record<CustomerHealth, string> = {
  healthy: "Healthy",
  watch: "Watch",
  at_risk: "At risk",
}

export const customerLifecycleLabels: Record<CustomerLifecycle, string> = {
  onboarding: "Onboarding",
  active: "Active",
  renewal: "Renewal",
  paused: "Paused",
  archived: "Archived",
}

export const customerHealthOptions: CustomerHealth[] = [
  "healthy",
  "watch",
  "at_risk",
]

export const customerLifecycleOptions: CustomerLifecycle[] = [
  "onboarding",
  "active",
  "renewal",
  "paused",
  "archived",
]
