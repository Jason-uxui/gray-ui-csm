import type {
  AnalyticsComparison,
  AnalyticsFilters,
  AnalyticsMetric,
  AnalyticsRange,
  AnalyticsTrend,
  AnalyticsViewModel,
} from "@/lib/analytics/types"

export const analyticsRangeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] satisfies Array<{ value: AnalyticsRange; label: string }>

export const analyticsComparisonOptions = [
  { value: "previous-period", label: "vs previous period" },
  { value: "previous-month", label: "vs previous month" },
  { value: "none", label: "No comparison" },
] satisfies Array<{ value: AnalyticsComparison; label: string }>

export function getAnalyticsRange(value: string | null): AnalyticsRange {
  return value === "7d" || value === "90d" ? value : "30d"
}

export function getAnalyticsComparison(
  value: string | null
): AnalyticsComparison {
  return value === "previous-month" || value === "none"
    ? value
    : "previous-period"
}

export const defaultAnalyticsFilters: AnalyticsFilters = {
  team: "all-teams",
  agent: "all-agents",
  channel: "all-channels",
  category: "all-categories",
  segment: "all-segments",
}

export const analyticsFilterOptions = {
  team: [
    { value: "all-teams", label: "All teams" },
    { value: "support", label: "Support" },
    { value: "success", label: "Success" },
    { value: "technical", label: "Technical" },
  ],
  agent: [
    { value: "all-agents", label: "All agents" },
    { value: "js", label: "Jamie Smith" },
    { value: "mk", label: "Morgan Kim" },
    { value: "al", label: "Alex Lee" },
  ],
  channel: [
    { value: "all-channels", label: "All channels" },
    { value: "email", label: "Email" },
    { value: "chat", label: "Chat" },
    { value: "form", label: "Form" },
  ],
  category: [
    { value: "all-categories", label: "All categories" },
    { value: "billing", label: "Billing" },
    { value: "integration", label: "Integration" },
    { value: "login", label: "Login" },
  ],
  segment: [
    { value: "all-segments", label: "All segments" },
    { value: "enterprise", label: "Enterprise" },
    { value: "growth", label: "Growth" },
    { value: "startup", label: "Startup" },
  ],
} as const

export const breachedTickets = [
  {
    id: "10421",
    customer: "Acme Company — Enterprise North America",
    priority: "High",
    owner: "JS",
    overdue: "2d 4h",
  },
  {
    id: "10418",
    customer: "Globex",
    priority: "High",
    owner: "MK",
    overdue: "1d 12h",
  },
  {
    id: "10403",
    customer: "Initech",
    priority: "Medium",
    owner: "AL",
    overdue: "1d 3h",
  },
  {
    id: "10387",
    customer: "Umbrella Corporation",
    priority: "High",
    owner: "PR",
    overdue: "18h",
  },
  {
    id: "10376",
    customer: "Soylent",
    priority: "Medium",
    owner: "JS",
    overdue: "12h",
  },
]

const rangeScale: Record<AnalyticsRange, number> = {
  "7d": 0.28,
  "30d": 1,
  "90d": 2.72,
}
const thirtyDayNewTickets = [
  88, 94, 101, 108, 112, 107, 98, 104, 109, 110, 116, 121, 127, 139, 151, 168,
  160, 142, 108, 103, 111, 116, 113, 118, 127, 138, 151, 163, 159, 148,
]
const thirtyDayResolved = [
  64, 67, 69, 71, 74, 78, 80, 82, 84, 88, 94, 99, 105, 114, 128, 142, 135, 118,
  96, 102, 109, 112, 107, 102, 105, 113, 122, 129, 121, 108,
]

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function formatChartDate(date: Date) {
  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`
}

function makeDatedSeries(
  start: Date,
  newTickets: number[],
  resolved: number[],
  tickEvery: number
) {
  return newTickets.map((value, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    const day = formatChartDate(date)
    return {
      day,
      axisLabel:
        index % tickEvery === 0 || index === newTickets.length - 1 ? day : "",
      newTickets: value,
      resolved: resolved[index],
    }
  })
}

function getTicketVolumeSeries(range: AnalyticsRange) {
  if (range === "7d") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const newTickets = [91, 108, 99, 126, 114, 139, 128]
    const resolved = [68, 76, 82, 101, 93, 116, 109]
    return days.map((day, index) => ({
      day,
      axisLabel: day,
      newTickets: newTickets[index],
      resolved: resolved[index],
    }))
  }

  if (range === "30d") {
    return makeDatedSeries(
      new Date(Date.UTC(2026, 3, 1)),
      thirtyDayNewTickets,
      thirtyDayResolved,
      3
    )
  }

  const newTickets = Array.from({ length: 90 }, (_, index) =>
    Math.round(
      138 +
        Math.sin(index / 2.7) * 17 +
        Math.sin(index / 7.5) * 25 +
        (index % 13 === 0 ? 16 : 0)
    )
  )
  const resolved = Array.from({ length: 90 }, (_, index) =>
    Math.round(
      112 + Math.sin((index - 2) / 3.2) * 14 + Math.sin(index / 8) * 19
    )
  )
  return makeDatedSeries(
    new Date(Date.UTC(2026, 6, 4)),
    newTickets,
    resolved,
    10
  )
}

function getComparisonLabel(comparison: AnalyticsComparison) {
  if (comparison === "previous-month") return "vs previous month"
  if (comparison === "previous-period") return "vs previous period"
  return null
}

function scaleNumber(value: number, range: AnalyticsRange) {
  return Math.round(value * rangeScale[range])
}

function formatChange(value: number, comparison: AnalyticsComparison) {
  if (comparison === "none") return null
  const adjusted = comparison === "previous-month" ? value * 0.78 : value
  return `${adjusted > 0 ? "+" : ""}${adjusted.toFixed(1).replace(".0", "")}%`
}

function makeMetric(
  input: Omit<AnalyticsMetric, "change" | "comparisonLabel"> & {
    delta: number
  },
  comparison: AnalyticsComparison
): AnalyticsMetric {
  return {
    ...input,
    change: formatChange(input.delta, comparison),
    comparisonLabel: getComparisonLabel(comparison),
  }
}

function signalTone(value: number): AnalyticsTrend {
  return value > 0 ? "negative" : "positive"
}

export function getAnalyticsViewModel(
  range: AnalyticsRange,
  comparison: AnalyticsComparison
): AnalyticsViewModel {
  const scale = rangeScale[range]
  const newTickets = scaleNumber(1284, range)
  const backlog = Math.round(
    326 * (range === "7d" ? 0.92 : range === "90d" ? 1.16 : 1)
  )
  const responseMinutes = range === "7d" ? 36 : range === "90d" ? 47 : 42
  const sla = range === "7d" ? 93.1 : range === "90d" ? 89.8 : 91.4

  const metrics = [
    makeMetric(
      {
        key: "new-tickets",
        label: "New tickets",
        value: newTickets.toLocaleString("en-US"),
        delta: 12,
        trend: "positive",
        direction: "up",
        definition: "Tickets created during the selected period.",
        sparkline: [42, 48, 57, 51, 62, 55, 58, 70, 63, 76, 67, 81, 72].map(
          (value) => Math.round(value * scale)
        ),
      },
      comparison
    ),
    makeMetric(
      {
        key: "open-backlog",
        label: "Open backlog",
        value: backlog.toLocaleString("en-US"),
        delta: 8,
        trend: "positive",
        direction: "up",
        definition: "Tickets still open at the end of the selected period.",
        sparkline: [38, 42, 43, 39, 45, 48, 46, 50, 49, 54, 47],
      },
      comparison
    ),
    makeMetric(
      {
        key: "first-response",
        label: "First response time",
        value: `${responseMinutes}m`,
        delta: -15,
        trend: "positive",
        direction: "down",
        definition:
          "Median time from ticket creation to the first agent response.",
        sparkline: [72, 68, 63, 66, 58, 61, 54, 55, 51, 50, 49, 57],
      },
      comparison
    ),
    makeMetric(
      {
        key: "sla-attainment",
        label: "SLA attainment",
        value: `${sla}%`,
        delta: -2.6,
        trend: "negative",
        direction: "down",
        definition:
          "Percentage of resolved tickets that met the active SLA policy.",
        sparkline: [66, 72, 68, 78, 70, 75, 69, 79, 73, 80, 72],
      },
      comparison
    ),
  ]

  const metPercent = sla > 92 ? 74.8 : sla < 91 ? 69.6 : 72.1
  const riskPercent = sla > 92 ? 16.2 : sla < 91 ? 19.8 : 18
  const breachPercent = Number((100 - metPercent - riskPercent).toFixed(1))

  return {
    metrics,
    ticketVolume: getTicketVolumeSeries(range),
    slaStatuses: [
      {
        label: "Met",
        count: scaleNumber(2417, range).toLocaleString("en-US"),
        percent: metPercent,
        tone: "primary",
      },
      {
        label: "At risk",
        count: scaleNumber(603, range).toLocaleString("en-US"),
        percent: riskPercent,
        tone: "secondary",
      },
      {
        label: "Breached",
        count: scaleNumber(331, range).toLocaleString("en-US"),
        percent: breachPercent,
        tone: "destructive",
      },
    ],
    teamResolution: [
      {
        label: "Support",
        value: range === "7d" ? 24 : range === "90d" ? 31 : 28,
        percent: 45,
      },
      {
        label: "Success",
        value: range === "7d" ? 39 : range === "90d" ? 50 : 46,
        percent: 70,
      },
      {
        label: "Technical",
        value: range === "7d" ? 55 : range === "90d" ? 68 : 62,
        percent: 94,
      },
    ],
    qualitySignals: [
      {
        label: "CSAT",
        value: range === "7d" ? "4.7 / 5.0" : "4.6 / 5.0",
        change: formatChange(6, comparison),
        tone: "positive",
      },
      {
        label: "Reopen rate",
        value: range === "90d" ? "5.8%" : "5.2%",
        change: formatChange(-18, comparison),
        tone: "positive",
      },
      {
        label: "Escalation rate",
        value: range === "7d" ? "1.8%" : "2.1%",
        change: formatChange(-22, comparison),
        tone: "positive",
      },
      {
        label: "Replies before resolution",
        value: "3.4",
        change: comparison === "none" ? null : "Partial data",
        tone: "neutral",
      },
    ],
    issueSignals: [
      {
        label: "Billing",
        count: scaleNumber(284, range),
        change: formatChange(24, comparison),
        tone: signalTone(24),
      },
      {
        label: "Integration",
        count: scaleNumber(192, range),
        change: formatChange(12, comparison),
        tone: signalTone(12),
      },
      {
        label: "Login",
        count: scaleNumber(176, range),
        change: formatChange(8, comparison),
        tone: signalTone(8),
      },
      {
        label: "Data sync",
        count: scaleNumber(98, range),
        change: formatChange(-20, comparison),
        tone: signalTone(-20),
      },
    ],
    unassigned: {
      total: scaleNumber(47, range),
      change: formatChange(9, comparison),
      highPriority: scaleNumber(12, range),
      standard: scaleNumber(35, range),
    },
    repeatAccounts: [
      {
        account: "Acme Co",
        tickets: Math.max(3, scaleNumber(8, range)),
        category: "Billing",
      },
      {
        account: "Globex",
        tickets: Math.max(3, scaleNumber(6, range)),
        category: "Integration",
      },
      {
        account: "Initech",
        tickets: Math.max(3, scaleNumber(5, range)),
        category: "Login",
      },
    ],
  }
}
