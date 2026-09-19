export type AnalyticsTrend = "positive" | "negative" | "neutral"
export type AnalyticsRange = "7d" | "30d" | "90d"
export type AnalyticsComparison = "previous-period" | "previous-month" | "none"

export type AnalyticsMetric = {
  key: string
  label: string
  value: string
  change: string | null
  comparisonLabel: string | null
  trend: AnalyticsTrend
  direction: "up" | "down" | "flat"
  definition: string
  sparkline: number[]
}

export type AnalyticsFilterKey =
  | "team"
  | "agent"
  | "channel"
  | "category"
  | "segment"
export type AnalyticsFilters = Record<AnalyticsFilterKey, string>

export type AnalyticsViewModel = {
  metrics: AnalyticsMetric[]
  ticketVolume: Array<{
    day: string
    axisLabel: string
    newTickets: number
    resolved: number
  }>
  slaStatuses: Array<{
    label: string
    count: string
    percent: number
    tone: "primary" | "secondary" | "destructive"
  }>
  teamResolution: Array<{ label: string; value: number; percent: number }>
  qualitySignals: Array<{
    label: string
    value: string
    change: string | null
    tone: AnalyticsTrend
  }>
  issueSignals: Array<{
    label: string
    count: number
    change: string | null
    tone: AnalyticsTrend
  }>
  unassigned: {
    total: number
    change: string | null
    highPriority: number
    standard: number
  }
  repeatAccounts: Array<{ account: string; tickets: number; category: string }>
}
