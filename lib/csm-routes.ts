export type CsmRoute = {
  title: string
  path: string
  description: string
}

export const csmRoutes: CsmRoute[] = [
  {
    title: "Inbox",
    path: "/inbox",
    description: "Unified channels and thread triage for inbound conversations.",
  },
  {
    title: "Tickets",
    path: "/tickets",
    description: "Track ownership, priorities, SLA, and escalations.",
  },
  {
    title: "Customer Profiles",
    path: "/customers",
    description: "Customer 360 with lifecycle context and support history.",
  },
  {
    title: "Accounts",
    path: "/accounts",
    description: "B2B account-level health and ownership visibility.",
  },
  {
    title: "Internal Notes",
    path: "/internal-notes",
    description: "Private collaboration and internal handoff context.",
  },
  {
    title: "Knowledge Base",
    path: "/knowledge-base",
    description: "Article operations and deflection effectiveness tracking.",
  },
  {
    title: "Macros",
    path: "/macros",
    description: "Reusable responses for consistent agent operations.",
  },
  {
    title: "Automation Rules",
    path: "/automation",
    description: "Rule-based routing, tagging, and workflow automation.",
  },
  {
    title: "Settings",
    path: "/settings",
    description: "Workspace policies, SLA, and platform configuration.",
  },
]

export function getRouteByPathname(pathname: string) {
  const normalizedPath = pathname.replace(/\/$/, "") || "/"

  return (
    csmRoutes.find(
      (route) =>
        route.path === normalizedPath ||
        (route.path !== "/" && normalizedPath.startsWith(`${route.path}/`))
    ) ?? null
  )
}
