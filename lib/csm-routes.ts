export type CsmRouteIconKey =
  | "inbox"
  | "tickets"
  | "customers"
  | "accounts"
  | "internal-notes"
  | "knowledge-base"
  | "macros"
  | "automation"
  | "settings"

export type CsmTemplateMetricTone = "default" | "positive" | "warning"

export type CsmTemplateMetric = {
  label: string
  value: string
  tone?: CsmTemplateMetricTone
}

export type CsmSidebarPreviewItem = {
  title: string
  subject: string
  date: string
  teaser: string
}

export type CsmRoute = {
  title: string
  path: string
  description: string
  icon: CsmRouteIconKey
  templateMetrics: CsmTemplateMetric[]
  sidebarPreview: CsmSidebarPreviewItem[]
}

export const csmRoutes: CsmRoute[] = [
  {
    title: "Inbox",
    path: "/inbox",
    description: "Unified channels and thread triage for inbound conversations.",
    icon: "inbox",
    templateMetrics: [
      { label: "Inbound Threads", value: "124" },
      { label: "First Response < 15m", value: "89%" },
      { label: "SLA Risk", value: "8", tone: "warning" },
    ],
    sidebarPreview: [
      {
        title: "Unified channels",
        subject: "Conversations from all channels",
        date: "Now",
        teaser: "Email, chat, in-app, and form messages flow into one queue.",
      },
      {
        title: "Thread statuses",
        subject: "Triage workflow",
        date: "Today",
        teaser:
          "Filter and triage by New, Open, Pending, Resolved, and Closed states.",
      },
    ],
  },
  {
    title: "Tickets",
    path: "/tickets",
    description: "Track ownership, priorities, SLA, and escalations.",
    icon: "tickets",
    templateMetrics: [
      { label: "Open Tickets", value: "32" },
      { label: "Escalations", value: "5", tone: "warning" },
      { label: "Resolution Rate", value: "92%", tone: "positive" },
    ],
    sidebarPreview: [
      {
        title: "Queue by urgency",
        subject: "Prioritize SLA risk",
        date: "Now",
        teaser:
          "Sort by priority and due state to reduce SLA breaches quickly.",
      },
      {
        title: "Escalation handoff",
        subject: "Cross-team visibility",
        date: "Today",
        teaser:
          "Escalated tickets remain visible for Product and Engineering follow-up.",
      },
    ],
  },
  {
    title: "Customer Profiles",
    path: "/customers",
    description: "Customer 360 with lifecycle context and support history.",
    icon: "customers",
    templateMetrics: [
      { label: "At-Risk Accounts", value: "14", tone: "warning" },
      { label: "CSAT (30d)", value: "4.6/5", tone: "positive" },
      { label: "Profile Coverage", value: "97%" },
    ],
    sidebarPreview: [
      {
        title: "Customer 360",
        subject: "Lifecycle context",
        date: "Today",
        teaser:
          "Profile timeline combines support history, sentiment, and value context.",
      },
    ],
  },
  {
    title: "Accounts",
    path: "/accounts",
    description: "B2B account-level health and ownership visibility.",
    icon: "accounts",
    templateMetrics: [
      { label: "Managed Accounts", value: "286" },
      { label: "Renewals This Month", value: "22" },
      { label: "Expansion Signals", value: "31", tone: "positive" },
    ],
    sidebarPreview: [
      {
        title: "Account-level signals",
        subject: "B2B ownership view",
        date: "Today",
        teaser:
          "Usage, risk, and ownership signals are grouped by account for CSM teams.",
      },
    ],
  },
  {
    title: "Internal Notes",
    path: "/internal-notes",
    description: "Private collaboration and internal handoff context.",
    icon: "internal-notes",
    templateMetrics: [
      { label: "Handoffs Today", value: "18" },
      { label: "Notes Linked to Tickets", value: "76%" },
      { label: "Untriaged Mentions", value: "4", tone: "warning" },
    ],
    sidebarPreview: [
      {
        title: "Private collaboration",
        subject: "Internal-only thread",
        date: "Today",
        teaser:
          "Keep agent-to-agent handoff context private and separate from customer chat.",
      },
    ],
  },
  {
    title: "Knowledge Base",
    path: "/knowledge-base",
    description: "Article operations and deflection effectiveness tracking.",
    icon: "knowledge-base",
    templateMetrics: [
      { label: "Published Articles", value: "148" },
      { label: "Deflection Rate", value: "41%", tone: "positive" },
      { label: "Needs Review", value: "11", tone: "warning" },
    ],
    sidebarPreview: [
      {
        title: "Deflection quality",
        subject: "Article performance",
        date: "Today",
        teaser:
          "Track which support articles actually reduce ticket inflow over time.",
      },
    ],
  },
  {
    title: "Macros",
    path: "/macros",
    description: "Reusable responses for consistent agent operations.",
    icon: "macros",
    templateMetrics: [
      { label: "Saved Macros", value: "64" },
      { label: "Adoption Rate", value: "73%", tone: "positive" },
      { label: "Needs Update", value: "9", tone: "warning" },
    ],
    sidebarPreview: [
      {
        title: "Response templates",
        subject: "Consistent communication",
        date: "Today",
        teaser:
          "Use one-click macro templates for repetitive requests and policy consistency.",
      },
    ],
  },
  {
    title: "Automation Rules",
    path: "/automation",
    description: "Rule-based routing, tagging, and workflow automation.",
    icon: "automation",
    templateMetrics: [
      { label: "Active Rules", value: "27" },
      { label: "Auto-Routed Tickets", value: "68%", tone: "positive" },
      { label: "Rule Conflicts", value: "2", tone: "warning" },
    ],
    sidebarPreview: [
      {
        title: "Auto assign and tag",
        subject: "Workflow routing",
        date: "Today",
        teaser:
          "Route tickets by plan, language, and intent with rule automation.",
      },
    ],
  },
  {
    title: "Settings",
    path: "/settings",
    description: "Workspace policies, SLA, and platform configuration.",
    icon: "settings",
    templateMetrics: [
      { label: "Teams Configured", value: "6" },
      { label: "SLA Policies", value: "12" },
      { label: "Pending Changes", value: "3", tone: "warning" },
    ],
    sidebarPreview: [
      {
        title: "SLA configuration",
        subject: "Workspace policy",
        date: "Today",
        teaser:
          "Define business hours, response targets, and escalation policies globally.",
      },
    ],
  },
]

function normalizePath(path: string) {
  return path.replace(/\/$/, "") || "/"
}

export function getRouteByPath(path: string) {
  const normalizedPath = normalizePath(path)
  return csmRoutes.find((route) => route.path === normalizedPath) ?? null
}

export function getRouteByPathOrThrow(path: string) {
  const route = getRouteByPath(path)
  if (!route) {
    throw new Error(`Unknown CSM route path: ${path}`)
  }
  return route
}

export function getRouteByPathname(pathname: string) {
  const normalizedPath = normalizePath(pathname)

  return (
    csmRoutes.find(
      (route) =>
        route.path === normalizedPath ||
        (route.path !== "/" && normalizedPath.startsWith(`${route.path}/`))
    ) ?? null
  )
}
