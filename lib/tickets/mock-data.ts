import type {
  Ticket,
  TicketBoardColumn,
  TicketCategoryKey,
  TicketPriority,
  TicketSidebarGroup,
  TicketStat,
  TicketViewKey,
} from "@/lib/tickets/types"

type TicketSeed = Omit<Ticket, "boardOrder">

export const ticketBoardColumns: TicketBoardColumn[] = [
  { key: "open", label: "Open" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
]

const ticketSeeds: TicketSeed[] = [
  {
    id: "t-001",
    ticketNumber: "#-001",
    subject: "Low activation in week-one onboarding cohort for Pine & Peak",
    queueStatus: "open",
    health: "warning",
    channel: "email",
    trend: "up",
    assignee: { name: "Jason Duong" },
    category: "technical",
    priority: "high",
    mine: true,
    escalated: false,
    pastDue: true,
  },
  {
    id: "t-002",
    ticketNumber: "#-002",
    subject: "Expansion review blocked by delayed Salesforce health sync",
    queueStatus: "open",
    health: "on-track",
    channel: "slack",
    trend: "up",
    assignee: { name: "Jason Duong" },
    category: "technical",
    priority: "urgent",
    mine: true,
    escalated: true,
    pastDue: false,
  },
  {
    id: "t-003",
    ticketNumber: "#-003",
    subject: "Need admin ownership model before enterprise rollout",
    queueStatus: "pending",
    health: "breached",
    channel: "email",
    trend: "flat",
    assignee: { name: "Jason Duong" },
    category: "account-login",
    priority: "high",
    mine: true,
    escalated: true,
    pastDue: true,
  },
  {
    id: "t-004",
    ticketNumber: "#-004",
    subject: "Executive business review needs clearer API export guidance",
    queueStatus: "open",
    health: "on-track",
    channel: "email",
    trend: "up",
    assignee: { name: "Annie Nguyen" },
    category: "technical",
    priority: "medium",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-005",
    ticketNumber: "#-005",
    subject: "Renewal prep needs invoice usage breakdown by workspace",
    queueStatus: "open",
    health: "warning",
    channel: "chat",
    trend: "flat",
    category: "billing",
    priority: "medium",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-006",
    ticketNumber: "#-006",
    subject: "Customer asks for a rollout plan for conditional workflows",
    queueStatus: "resolved",
    health: "on-track",
    channel: "chat",
    trend: "down",
    assignee: { name: "Jason Duong" },
    category: "subscription",
    priority: "low",
    mine: true,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-007",
    ticketNumber: "#-007",
    subject: "Close out unused seats after the regional team restructure",
    queueStatus: "closed",
    health: "on-track",
    channel: "chat",
    trend: "flat",
    assignee: { name: "Lam Tran" },
    category: "other",
    priority: "todo",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-008",
    ticketNumber: "#-008",
    subject: "Champion cannot reset admin access before the training session",
    queueStatus: "open",
    health: "warning",
    channel: "chat",
    trend: "up",
    category: "account-login",
    priority: "urgent",
    mine: false,
    escalated: true,
    pastDue: true,
  },
  {
    id: "t-009",
    ticketNumber: "#-009",
    subject:
      "CSV import adoption stalled for the multilingual customer segment",
    queueStatus: "pending",
    health: "warning",
    channel: "email",
    trend: "flat",
    assignee: { name: "Nhi Pham" },
    category: "technical",
    priority: "high",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-010",
    ticketNumber: "#-010",
    subject: "Need a credit summary for the canceled onboarding add-on",
    queueStatus: "resolved",
    health: "on-track",
    channel: "email",
    trend: "down",
    assignee: { name: "Minh Ho" },
    category: "billing",
    priority: "low",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-011",
    ticketNumber: "#-011",
    subject: "Finance review asks for invoice split by cost center",
    queueStatus: "pending",
    health: "warning",
    channel: "chat",
    trend: "up",
    assignee: { name: "Thanh Le" },
    category: "billing",
    priority: "medium",
    mine: false,
    escalated: false,
    pastDue: true,
  },
  {
    id: "t-012",
    ticketNumber: "#-012",
    subject: "Push notification drop is hurting mobile adoption metrics",
    queueStatus: "open",
    health: "breached",
    channel: "slack",
    trend: "up",
    assignee: { name: "Jason Duong" },
    category: "technical",
    priority: "urgent",
    mine: true,
    escalated: true,
    pastDue: true,
  },
  {
    id: "t-013",
    ticketNumber: "#-013",
    subject: "Seat transfer request between subsidiaries before renewal",
    queueStatus: "resolved",
    health: "on-track",
    channel: "email",
    trend: "flat",
    assignee: { name: "Annie Nguyen" },
    category: "subscription",
    priority: "medium",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-014",
    ticketNumber: "#-014",
    subject: "SLA export timezone mismatch is affecting QBR reporting",
    queueStatus: "open",
    health: "warning",
    channel: "email",
    trend: "up",
    assignee: { name: "Bao Truong" },
    category: "technical",
    priority: "high",
    mine: false,
    escalated: false,
    pastDue: true,
  },
  {
    id: "t-015",
    ticketNumber: "#-015",
    subject: "Plan phased seat expansion for the next quarter launch",
    queueStatus: "pending",
    health: "on-track",
    channel: "chat",
    trend: "flat",
    assignee: { name: "Lam Tran" },
    category: "subscription",
    priority: "medium",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-016",
    ticketNumber: "#-016",
    subject: "Domain migration left the new workspace owner unverified",
    queueStatus: "open",
    health: "breached",
    channel: "slack",
    trend: "up",
    category: "account-login",
    priority: "urgent",
    mine: false,
    escalated: true,
    pastDue: true,
  },
  {
    id: "t-017",
    ticketNumber: "#-017",
    subject: "Broken help article is slowing onboarding conversion",
    queueStatus: "closed",
    health: "on-track",
    channel: "chat",
    trend: "down",
    assignee: { name: "Nhi Pham" },
    category: "other",
    priority: "todo",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-018",
    ticketNumber: "#-018",
    subject: "Need audit log retention options for the enterprise rollout",
    queueStatus: "pending",
    health: "warning",
    channel: "email",
    trend: "up",
    assignee: { name: "Jason Duong" },
    category: "subscription",
    priority: "high",
    mine: true,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-019",
    ticketNumber: "#-019",
    subject: "Intercom sync duplicates are skewing lifecycle reporting",
    queueStatus: "resolved",
    health: "on-track",
    channel: "slack",
    trend: "down",
    assignee: { name: "Minh Ho" },
    category: "technical",
    priority: "low",
    mine: false,
    escalated: false,
    pastDue: false,
  },
  {
    id: "t-020",
    ticketNumber: "#-020",
    subject: "VAT breakdown per region is needed for the renewal review",
    queueStatus: "closed",
    health: "on-track",
    channel: "email",
    trend: "flat",
    assignee: { name: "Thanh Le" },
    category: "billing",
    priority: "todo",
    mine: false,
    escalated: false,
    pastDue: false,
  },
]

export const tickets: Ticket[] = ticketSeeds.map(
  (ticket, index, allTickets) => {
    const boardOrder = allTickets
      .slice(0, index)
      .filter(
        (currentTicket) => currentTicket.queueStatus === ticket.queueStatus
      ).length

    return {
      ...ticket,
      boardOrder,
    }
  }
)

export const ticketSidebarGroups: TicketSidebarGroup[] =
  buildTicketSidebarGroups(tickets)

export const ticketStats: TicketStat[] = [
  {
    key: "total",
    label: "Total Tickets",
    value: tickets.length,
    previousValue: Math.max(tickets.length - 4, 0),
    delta: 4,
    deltaPercent: 25,
    trend: "up",
    comparison: "vs last week",
  },
  {
    key: "open",
    label: "Open",
    value: tickets.filter((ticket) => ticket.queueStatus === "open").length,
    previousValue: 10,
    delta: -3,
    deltaPercent: -30,
    trend: "down",
    comparison: "vs last week",
  },
  {
    key: "pending",
    label: "Pending",
    value: tickets.filter((ticket) => ticket.queueStatus === "pending").length,
    previousValue: 6,
    delta: -2,
    deltaPercent: -33.3,
    trend: "down",
    comparison: "vs last week",
  },
  {
    key: "resolved",
    label: "Resolved",
    value: tickets.filter((ticket) => ticket.queueStatus === "resolved").length,
    previousValue: 3,
    delta: 1,
    deltaPercent: 33.3,
    trend: "up",
    comparison: "vs last week",
  },
]

export function buildTicketSidebarGroups(
  sourceTickets: Ticket[]
): TicketSidebarGroup[] {
  const categoryCounts: Record<TicketCategoryKey, number> = {
    billing: 0,
    technical: 0,
    "account-login": 0,
    subscription: 0,
    other: 0,
  }

  const priorityCounts: Record<TicketPriority, number> = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    todo: 0,
  }

  let mine = 0
  let unassigned = 0
  let pastDue = 0
  let escalated = 0

  for (const ticket of sourceTickets) {
    categoryCounts[ticket.category] += 1
    priorityCounts[ticket.priority] += 1

    if (ticket.mine) mine += 1
    if (!ticket.assignee) unassigned += 1
    if (ticket.pastDue) pastDue += 1
    if (ticket.escalated) escalated += 1
  }

  return [
    {
      key: "views",
      label: "Views",
      items: [
        { key: "all", label: "All Tickets", count: sourceTickets.length },
        { key: "mine", label: "My Tickets", count: mine },
        { key: "unassigned", label: "Unassigned", count: unassigned },
        { key: "past-due", label: "Past Due", count: pastDue },
        { key: "escalated", label: "Escalated", count: escalated },
      ],
    },
    {
      key: "categories",
      label: "Categories",
      items: [
        { key: "billing", label: "Billing", count: categoryCounts.billing },
        {
          key: "technical",
          label: "Technical Issue",
          count: categoryCounts.technical,
        },
        {
          key: "account-login",
          label: "Account & Login",
          count: categoryCounts["account-login"],
        },
        {
          key: "subscription",
          label: "Subscription",
          count: categoryCounts.subscription,
        },
        { key: "other", label: "Other", count: categoryCounts.other },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      items: [
        { key: "urgent", label: "Urgent", count: priorityCounts.urgent },
        { key: "high", label: "High", count: priorityCounts.high },
        { key: "medium", label: "Medium", count: priorityCounts.medium },
        { key: "low", label: "Low", count: priorityCounts.low },
        { key: "todo", label: "Todo", count: priorityCounts.todo },
      ],
    },
  ]
}

export function filterTicketsByView(allTickets: Ticket[], view: TicketViewKey) {
  switch (view) {
    case "mine":
      return allTickets.filter((ticket) => ticket.mine)
    case "unassigned":
      return allTickets.filter((ticket) => !ticket.assignee)
    case "past-due":
      return allTickets.filter((ticket) => ticket.pastDue)
    case "escalated":
      return allTickets.filter((ticket) => ticket.escalated)
    case "all":
    default:
      return allTickets
  }
}
