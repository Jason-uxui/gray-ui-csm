import type { KnowledgeArticle } from "@/lib/knowledge-base/types"
import { knowledgeArticleInsightFixtures } from "@/lib/knowledge-base/insight-mock-data"
import { tickets } from "@/lib/tickets/mock-data"
import type {
  Ticket,
  TicketPriority,
  TicketQueueStatus,
  TicketType,
} from "@/lib/tickets/types"

export type KnowledgeInsightTrend = "up" | "down" | "flat"

export type KnowledgeInsightMetric = {
  key: "deflection" | "linkedTickets" | "avgReadTime"
  label: string
  value: string
  trend: KnowledgeInsightTrend
  deltaLabel: string
  helper: string
}

export type KnowledgeInsightPerformanceRange = "7d" | "30d" | "1m"

export type KnowledgeInsightChartPoint = {
  date: string
  views: number
}

export type KnowledgeInsightSignalSource = "manual" | "auto" | "suggested"
export type KnowledgeInsightSignalAction = "mute" | "remove" | "add"

export type KnowledgeInsightSignal = {
  id: string
  signal: string
  source: KnowledgeInsightSignalSource
  matches30d: number
  openRate: number | null
  status: string
  action?: KnowledgeInsightSignalAction
  isMuted?: boolean
  matchTerms?: string[]
  missedSearchesLabel?: string
}

export type KnowledgeLinkedTicketContext =
  | "read-still-filed"
  | "linked-by-agent"

export type KnowledgeLinkedTicket = {
  id: string
  ticketId: string
  ticketNumber: string
  subject: string
  type: TicketType
  status: TicketQueueStatus
  priority: TicketPriority
  context: KnowledgeLinkedTicketContext
  customer: string
}

export type KnowledgeFeedbackComment = {
  id: string
  vote: "helpful" | "not-helpful"
  age: string
  body: string
  source: string
  authorName: string
  authorInitials: string
  rating: number
}

export type KnowledgeSearchDiscoveryQuery = {
  id: string
  query: string
  ctr: number
  views: number
}

export type KnowledgeArticleInsightsViewModel = {
  periodLabel: string
  performanceOverview: {
    rangeLabels: Record<KnowledgeInsightPerformanceRange, string>
    defaultRange: KnowledgeInsightPerformanceRange
    totalViews: number
    totalViewsDeltaLabel: string
    helpfulRate: number
    helpfulRateDeltaLabel: string
    helpfulVotes: number
    notHelpfulVotes: number
    unreviewedViews: number
    deflectionRate: number
    linkedTickets: number
    averageReadTime: string
    seriesByRange: Record<
      KnowledgeInsightPerformanceRange,
      KnowledgeInsightChartPoint[]
    >
  }
  performance: KnowledgeInsightMetric[]
  matching: {
    categoryLabel: string
    testQuery: string
    testResult: string
    signals: KnowledgeInsightSignal[]
  }
  linkedTickets: {
    summary: string
    rows: KnowledgeLinkedTicket[]
  }
  feedback: {
    averageRating: number
    reviewCount: number
    helpfulVotes: number
    notHelpfulVotes: number
    negativeComments: KnowledgeFeedbackComment[]
    helpfulComments: KnowledgeFeedbackComment[]
  }
  searchDiscovery: {
    queries: KnowledgeSearchDiscoveryQuery[]
  }
}

export type KnowledgeArticleInsightFixture = Partial<
  Pick<
    KnowledgeArticleInsightsViewModel,
    "matching" | "linkedTickets" | "feedback" | "searchDiscovery"
  >
>

const categoryLabels: Record<KnowledgeArticle["category"], string> = {
  billing: "Billing",
  technical: "Technical",
  "account-login": "Account login",
  subscription: "Subscription",
  other: "Other",
}

const ticketsById = new Map(tickets.map((ticket) => [ticket.id, ticket]))

const fallbackLinkedTicketCustomers = [
  "Arlene McCoy",
  "Liam Chen",
  "Amina Rahman",
  "Lam Tran",
]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function formatSignedPercent(value: number) {
  if (value === 0) return "No change"
  return `${value > 0 ? "+" : ""}${value}%`
}

function formatSignedPoints(value: number) {
  if (value === 0) return "No change"
  return `${value > 0 ? "+" : ""}${value}pp`
}

function getTicketNumberLabel(ticket: Ticket) {
  return ticket.ticketNumber.startsWith("#-")
    ? `#TC-${ticket.ticketNumber.slice(2)}`
    : ticket.ticketNumber
}

function getTicketType(ticket: Ticket): TicketType {
  if (ticket.ticketType) return ticket.ticketType
  if (ticket.category === "billing" || ticket.category === "subscription") {
    return "question"
  }
  if (ticket.category === "technical") return "incident"
  return "task"
}

function createLinkedTicketRow(
  ticketId: string,
  context: KnowledgeLinkedTicketContext,
  customer?: string
): KnowledgeLinkedTicket {
  const ticket = ticketsById.get(ticketId)

  if (!ticket) {
    throw new Error(`Unknown linked ticket id: ${ticketId}`)
  }

  return {
    id: `${ticketId}-${context}`,
    ticketId: ticket.id,
    ticketNumber: getTicketNumberLabel(ticket),
    subject: ticket.subject,
    type: getTicketType(ticket),
    status: ticket.queueStatus,
    priority: ticket.priority,
    context,
    customer: customer ?? ticket.requester?.name ?? "Unassigned account",
  }
}

function getFallbackTicketPool(article: KnowledgeArticle) {
  const categoryMatches = tickets.filter(
    (ticket) => ticket.category === article.category
  )

  return categoryMatches.length > 0 ? categoryMatches : tickets
}

function getArticleStableIndex(article: KnowledgeArticle, modulo: number) {
  if (modulo <= 0) return 0

  return (
    Array.from(article.id).reduce(
      (total, character) => total + character.charCodeAt(0),
      0
    ) % modulo
  )
}

function scaleSeries(
  article: KnowledgeArticle,
  range: KnowledgeInsightPerformanceRange,
  pattern: number[]
): KnowledgeInsightChartPoint[] {
  const labels: Record<KnowledgeInsightPerformanceRange, string[]> = {
    "7d": [
      "Jun 03",
      "Jun 04",
      "Jun 05",
      "Jun 06",
      "Jun 07",
      "Jun 08",
      "Jun 09",
    ],
    "30d": [
      "May 12",
      "May 14",
      "May 16",
      "May 18",
      "May 20",
      "May 22",
      "May 24",
      "May 26",
      "May 28",
      "May 30",
      "Jun 01",
      "Jun 03",
      "Jun 05",
      "Jun 07",
      "Jun 09",
    ],
    "1m": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
  }
  const seriesLabels = labels[range]
  const patternTotal = pattern.reduce((total, value) => total + value, 0)
  const scale = article.views / Math.max(patternTotal, 1)

  return seriesLabels.map((date, index) => {
    const views = Math.max(1, Math.round(pattern[index] * scale))

    return {
      date,
      views,
    }
  })
}

function getFallbackSignals(
  article: KnowledgeArticle
): KnowledgeInsightSignal[] {
  const baseMatches = Math.max(article.views, 1)

  return article.matchReasons.slice(0, 5).map((reason, index) => {
    const source: KnowledgeInsightSignalSource = index < 2 ? "manual" : "auto"
    const matches30d = Math.max(
      4,
      Math.round(baseMatches / (index + 2) + article.linkedTickets)
    )

    return {
      id: `${article.id}-${reason}`,
      signal: reason,
      source,
      matches30d,
      openRate: clamp(article.helpfulRate - index * 6, 18, 86),
      status: index === 0 ? "Primary signal" : "Healthy",
      action: "mute",
    }
  })
}

function getFallbackLinkedTickets(
  article: KnowledgeArticle
): KnowledgeLinkedTicket[] {
  const ticketCount = Math.min(Math.max(article.linkedTickets, 2), 4)
  const pool = getFallbackTicketPool(article)
  const startIndex = getArticleStableIndex(article, pool.length)

  return Array.from({ length: ticketCount }, (_, index) => ({
    ...createLinkedTicketRow(
      pool[(startIndex + index) % pool.length].id,
      index % 2 === 0 ? "read-still-filed" : "linked-by-agent",
      fallbackLinkedTicketCustomers[index]
    ),
    id: `${article.id}-ticket-${index + 1}`,
  }))
}

function getFallbackFeedback(
  article: KnowledgeArticle
): KnowledgeArticleInsightsViewModel["feedback"] {
  const totalVotes = Math.max(24, Math.round(article.views * 0.3))
  const helpfulVotes = Math.round(totalVotes * (article.helpfulRate / 100))
  const notHelpfulVotes = Math.max(totalVotes - helpfulVotes, 0)

  return {
    averageRating: clamp(Math.round((article.helpfulRate / 20) * 10) / 10, 2.4, 4.9),
    reviewCount: 3,
    helpfulVotes,
    notHelpfulVotes,
    negativeComments: [
      {
        id: `${article.id}-negative-clarity`,
        vote: "not-helpful",
        age: "6 days ago",
        body: "The answer points in the right direction, but I needed one more concrete next step before contacting support.",
        source: "Help center",
        authorName: "Maya Chen",
        authorInitials: "MC",
        rating: 2,
      },
      {
        id: `${article.id}-negative-context`,
        vote: "not-helpful",
        age: "10 days ago",
        body: "The article did not match my exact account state, so I still opened a ticket.",
        source: "In-ticket suggestion",
        authorName: "Ethan Park",
        authorInitials: "EP",
        rating: 3,
      },
    ],
    helpfulComments: [
      {
        id: `${article.id}-helpful-fast`,
        vote: "helpful",
        age: "14 days ago",
        body: "Short, clear, and easy to share with my admin.",
        source: "Widget",
        authorName: "Nina Ross",
        authorInitials: "NR",
        rating: 4,
      },
    ],
  }
}

function getFallbackSearchDiscovery(
  article: KnowledgeArticle
): KnowledgeSearchDiscoveryQuery[] {
  const baseViews = Math.max(article.views, 24)

  return article.matchReasons.slice(0, 5).map((reason, index) => ({
    id: `${article.id}-query-${index + 1}`,
    query:
      index === 0
        ? `how to ${reason}`
        : index === 1
          ? `${reason} ${categoryLabels[article.category].toLowerCase()}`
          : `${reason} ${article.title.toLowerCase().split(" ").slice(0, 2).join(" ")}`,
    ctr: clamp(article.helpfulRate - index * 7, 18, 54),
    views: Math.max(18, Math.round(baseViews / (index + 1.6))),
  }))
}

export function getKnowledgeArticleInsights(
  article: KnowledgeArticle
): KnowledgeArticleInsightsViewModel {
  const helpfulVotes = Math.max(
    1,
    Math.round(article.views * article.helpfulRate * 0.003)
  )
  const notHelpfulVotes = Math.max(
    0,
    Math.round(
      helpfulVotes * ((100 - article.helpfulRate) / article.helpfulRate)
    )
  )
  const deflectionRate = clamp(Math.round(article.helpfulRate * 0.8), 28, 82)
  const ticketAfterReading = Math.max(
    1,
    Math.round(article.linkedTickets * 0.38)
  )
  const fixture = knowledgeArticleInsightFixtures[article.id]
  const feedback = fixture?.feedback ?? getFallbackFeedback(article)
  const matching = fixture?.matching ?? {
    categoryLabel: categoryLabels[article.category],
    testQuery: article.matchReasons.slice(0, 3).join(" "),
    testResult: `Matches via ${article.matchReasons[0] ?? "category"}`,
    signals: getFallbackSignals(article),
  }
  const linkedTickets = fixture?.linkedTickets ?? {
    summary: `${article.linkedTickets} tickets - latest 7 days ago`,
    rows: getFallbackLinkedTickets(article),
  }
  const searchDiscovery =
    fixture?.searchDiscovery ?? {
      queries: getFallbackSearchDiscovery(article),
    }
  const overviewHelpfulVotes = feedback.helpfulVotes ?? helpfulVotes
  const overviewNotHelpfulVotes = feedback.notHelpfulVotes ?? notHelpfulVotes
  const unreviewedViews = Math.max(
    article.views - overviewHelpfulVotes - overviewNotHelpfulVotes,
    0
  )
  const averageReadSeconds = clamp(
    88 +
      Math.round(
        article.summary.length * 0.18 + article.matchReasons.length * 11
      ),
    74,
    238
  )
  const averageReadTime = `${Math.floor(averageReadSeconds / 60)}m ${String(
    averageReadSeconds % 60
  ).padStart(2, "0")}s`

  return {
    periodLabel: "Last 30 days vs previous 30 days",
    performanceOverview: {
      rangeLabels: {
        "7d": "7d",
        "30d": "30d",
        "1m": "1m",
      },
      defaultRange: "30d",
      totalViews: article.views,
      totalViewsDeltaLabel: formatSignedPercent(18),
      helpfulRate: article.helpfulRate,
      helpfulRateDeltaLabel: formatSignedPoints(
        article.helpfulRate >= 75 ? 4 : -6
      ),
      helpfulVotes: overviewHelpfulVotes,
      notHelpfulVotes: overviewNotHelpfulVotes,
      unreviewedViews,
      deflectionRate,
      linkedTickets: article.linkedTickets,
      averageReadTime,
      seriesByRange: {
        "7d": scaleSeries(article, "7d", [31, 38, 44, 39, 47, 55, 70]),
        "30d": scaleSeries(
          article,
          "30d",
          [18, 23, 19, 34, 27, 41, 36, 52, 44, 38, 55, 47, 63, 58, 72]
        ),
        "1m": scaleSeries(article, "1m", [51, 62, 68, 75, 92]),
      },
    },
    performance: [
      {
        key: "deflection",
        label: "Deflection rate",
        value: `${deflectionRate}%`,
        trend: deflectionRate >= 60 ? "up" : "down",
        deltaLabel: formatSignedPercent(deflectionRate >= 60 ? 3 : -5),
        helper: `${Math.round(article.views * (deflectionRate / 100))} readers did not open a ticket`,
      },
      {
        key: "linkedTickets",
        label: "Linked tickets",
        value: article.linkedTickets.toLocaleString("en-US"),
        trend: ticketAfterReading > 5 ? "down" : "flat",
        deltaLabel:
          ticketAfterReading > 5 ? formatSignedPercent(-2) : "No change",
        helper: `${ticketAfterReading} created after reading`,
      },
      {
        key: "avgReadTime",
        label: "Avg. read time",
        value: averageReadTime,
        trend: "flat",
        deltaLabel: "Stable",
        helper: "Median engaged read",
      },
    ],
    matching,
    linkedTickets,
    feedback,
    searchDiscovery,
  }
}
