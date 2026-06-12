import type { KnowledgeArticle } from "@/lib/knowledge-base/types"

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

export type KnowledgeInsightSignal = {
  id: string
  signal: string
  source: KnowledgeInsightSignalSource
  matches30d: number
  openRate: number | null
  status: string
}

export type KnowledgeLinkedTicketContext =
  | "read-still-filed"
  | "linked-by-agent"

export type KnowledgeLinkedTicket = {
  id: string
  ticketNumber: string
  subject: string
  type: "problem" | "question" | "incident" | "task"
  context: KnowledgeLinkedTicketContext
  customer: string
}

export type KnowledgeFeedbackComment = {
  id: string
  vote: "helpful" | "not-helpful"
  age: string
  body: string
  source: string
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
    helpfulVotes: number
    notHelpfulVotes: number
    negativeComments: KnowledgeFeedbackComment[]
    helpfulComments: KnowledgeFeedbackComment[]
  }
}

const categoryLabels: Record<KnowledgeArticle["category"], string> = {
  billing: "Billing",
  technical: "Technical",
  "account-login": "Account login",
  subscription: "Subscription",
  other: "Other",
}

const articleInsightFixtures: Record<
  string,
  Partial<
    Pick<
      KnowledgeArticleInsightsViewModel,
      "matching" | "linkedTickets" | "feedback"
    >
  >
> = {
  "kb-billing-seat-update": {
    matching: {
      categoryLabel: "Subscription",
      testQuery: "how do i add a user to my plan",
      testResult: "Matches via seat",
      signals: [
        {
          id: "seat",
          signal: "seat",
          source: "manual",
          matches30d: 140,
          openRate: 71,
          status: "Strong match",
        },
        {
          id: "subscription",
          signal: "subscription",
          source: "manual",
          matches30d: 88,
          openRate: 64,
          status: "Healthy",
        },
        {
          id: "add-team-member",
          signal: "add team member",
          source: "auto",
          matches30d: 54,
          openRate: 74,
          status: "Emerging phrase",
        },
        {
          id: "billing",
          signal: "billing",
          source: "manual",
          matches30d: 19,
          openRate: 31,
          status: "Low intent",
        },
        {
          id: "how-to-add-user",
          signal: "how to add user",
          source: "suggested",
          matches30d: 31,
          openRate: null,
          status: "Missed search",
        },
      ],
    },
    linkedTickets: {
      summary: "21 tickets - latest 12 days ago",
      rows: [
        {
          id: "kb-ticket-192",
          ticketNumber: "#TC-192",
          subject: "Charged twice after adding 3 seats",
          type: "problem",
          context: "read-still-filed",
          customer: "Santi Cazorla",
        },
        {
          id: "kb-ticket-188",
          ticketNumber: "#TC-188",
          subject: "Can't find where to add a seat",
          type: "question",
          context: "read-still-filed",
          customer: "Jerome Bell",
        },
        {
          id: "kb-ticket-186",
          ticketNumber: "#TC-186",
          subject: "Seat price prorated incorrectly",
          type: "incident",
          context: "linked-by-agent",
          customer: "Courtney Henry",
        },
        {
          id: "kb-ticket-181",
          ticketNumber: "#TC-181",
          subject: "Invoice missing new seats",
          type: "question",
          context: "linked-by-agent",
          customer: "Esther Howard",
        },
      ],
    },
    feedback: {
      helpfulVotes: 188,
      notHelpfulVotes: 22,
      negativeComments: [
        {
          id: "neg-billing-cycle",
          vote: "not-helpful",
          age: "8 days ago",
          body: "Doesn't explain what happens to billing mid-cycle. I still don't know if I get charged now or next month.",
          source: "Help center",
        },
        {
          id: "neg-old-ui",
          vote: "not-helpful",
          age: "12 days ago",
          body: "Screenshots are from the old UI, the Seats button isn't where the article says.",
          source: "In-ticket suggestion",
        },
      ],
      helpfulComments: [
        {
          id: "pos-clear",
          vote: "helpful",
          age: "15 days ago",
          body: "Clear and quick, solved it in 2 minutes.",
          source: "Widget",
        },
      ],
    },
  },
  "kb-card-charge-failed": {
    feedback: {
      helpfulVotes: 125,
      notHelpfulVotes: 42,
      negativeComments: [
        {
          id: "neg-retry-window",
          vote: "not-helpful",
          age: "3 days ago",
          body: "The retry timing is still unclear. I need to know exactly when the next card attempt happens.",
          source: "Help center",
        },
        {
          id: "neg-grace-period",
          vote: "not-helpful",
          age: "6 days ago",
          body: "It mentions grace periods but does not say what customers see when access is limited.",
          source: "In-ticket suggestion",
        },
      ],
      helpfulComments: [
        {
          id: "pos-card-fix",
          vote: "helpful",
          age: "5 days ago",
          body: "The card decline checklist helped me fix the renewal before support had to step in.",
          source: "Widget",
        },
      ],
    },
  },
}

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
    }
  })
}

function getFallbackLinkedTickets(
  article: KnowledgeArticle
): KnowledgeLinkedTicket[] {
  const ticketCount = Math.min(Math.max(article.linkedTickets, 2), 4)

  return Array.from({ length: ticketCount }, (_, index) => ({
    id: `${article.id}-ticket-${index + 1}`,
    ticketNumber: `#KB-${String(index + 1).padStart(3, "0")}`,
    subject:
      index % 2 === 0
        ? article.summary
        : `Follow-up question about ${article.matchReasons[index % article.matchReasons.length] ?? article.title}`,
    type: index % 3 === 0 ? "question" : index % 3 === 1 ? "problem" : "task",
    context: index % 2 === 0 ? "read-still-filed" : "linked-by-agent",
    customer: ["Arlene McCoy", "Liam Chen", "Amina Rahman", "Lam Tran"][index],
  }))
}

function getFallbackFeedback(
  article: KnowledgeArticle
): KnowledgeArticleInsightsViewModel["feedback"] {
  const totalVotes = Math.max(24, Math.round(article.views * 0.3))
  const helpfulVotes = Math.round(totalVotes * (article.helpfulRate / 100))
  const notHelpfulVotes = Math.max(totalVotes - helpfulVotes, 0)

  return {
    helpfulVotes,
    notHelpfulVotes,
    negativeComments: [
      {
        id: `${article.id}-negative-clarity`,
        vote: "not-helpful",
        age: "6 days ago",
        body: "The answer points in the right direction, but I needed one more concrete next step before contacting support.",
        source: "Help center",
      },
      {
        id: `${article.id}-negative-context`,
        vote: "not-helpful",
        age: "10 days ago",
        body: "The article did not match my exact account state, so I still opened a ticket.",
        source: "In-ticket suggestion",
      },
    ],
    helpfulComments: [
      {
        id: `${article.id}-helpful-fast`,
        vote: "helpful",
        age: "14 days ago",
        body: "Short, clear, and easy to share with my admin.",
        source: "Widget",
      },
    ],
  }
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
  const fixture = articleInsightFixtures[article.id]
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
  }
}
