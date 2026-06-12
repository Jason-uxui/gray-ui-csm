"use client"

import {
  useId,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconBook2,
  IconCircleCheck,
  IconClock,
  IconEye,
  IconMessageReport,
  IconMinus,
  IconSearch,
  IconTicket,
  IconThumbDown,
  IconThumbUp,
  IconTargetArrow,
} from "@tabler/icons-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import { StatCard } from "@/components/stats/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getKnowledgeArticleInsights,
  type KnowledgeArticleInsightsViewModel,
  type KnowledgeInsightMetric,
  type KnowledgeInsightPerformanceRange,
  type KnowledgeInsightSignal,
  type KnowledgeInsightSignalSource,
  type KnowledgeInsightTrend,
  type KnowledgeLinkedTicket,
  type KnowledgeLinkedTicketContext,
} from "@/lib/knowledge-base/insights"
import type { KnowledgeArticle } from "@/lib/knowledge-base/types"
import { cn } from "@/lib/utils"

type KnowledgeArticleInsightsProps = {
  article: KnowledgeArticle
}

const metricIconByKey: Record<
  KnowledgeInsightMetric["key"],
  ComponentType<{ className?: string }>
> = {
  avgReadTime: IconClock,
  deflection: IconTargetArrow,
  linkedTickets: IconTicket,
}

type PerformanceChartType = "bar" | "line"

const MIN_HELPFUL_RATE_SEGMENT_PERCENT = 24

const sourceLabel: Record<KnowledgeInsightSignalSource, string> = {
  manual: "Manual",
  auto: "Auto",
  suggested: "Suggested",
}

const sourceBadgeClassName: Record<KnowledgeInsightSignalSource, string> = {
  manual: "bg-secondary text-secondary-foreground",
  auto: "bg-muted text-muted-foreground",
  suggested: "border-dashed bg-primary/10 text-foreground",
}

const ticketContextLabel: Record<KnowledgeLinkedTicketContext, string> = {
  "read-still-filed": "Read, still filed",
  "linked-by-agent": "Linked by agent",
}

const ticketTypeLabel: Record<KnowledgeLinkedTicket["type"], string> = {
  incident: "Incident",
  problem: "Problem",
  question: "Question",
  task: "Task",
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-foreground">
      {title}
    </h2>
  )
}

function TrendIcon({ trend }: { trend: KnowledgeInsightTrend }) {
  if (trend === "up") return <IconArrowUpRight className="size-3.5" />
  if (trend === "down") return <IconArrowDownRight className="size-3.5" />
  return <IconMinus className="size-3.5" />
}

function getPerformanceComparisonLabel(
  range: KnowledgeInsightPerformanceRange
) {
  if (range === "7d") return "vs previous 7d"
  if (range === "1m") return "vs previous month"
  return "vs previous 30d"
}

function InsightTrendRow({
  className,
  comparison,
  isImproved,
  trend,
  value,
}: {
  className?: string
  comparison: string
  isImproved: boolean
  trend: KnowledgeInsightTrend
  value: string
}) {
  const trendClassName =
    trend === "flat"
      ? "text-muted-foreground"
      : isImproved
        ? "text-emerald-600"
        : "text-rose-600"

  return (
    <div
      className={cn("flex items-center gap-1 text-xs font-medium", className)}
    >
      <span className={cn("inline-flex items-center gap-1", trendClassName)}>
        <TrendIcon trend={trend} />
        <span>{value}</span>
      </span>
      <span className="text-muted-foreground">{comparison}</span>
    </div>
  )
}

function MetricFooter({
  comparison,
  metric,
}: {
  comparison: string
  metric: KnowledgeInsightMetric
}) {
  const preferredTrendByKey: Record<
    KnowledgeInsightMetric["key"],
    KnowledgeInsightTrend
  > = {
    avgReadTime: "flat",
    deflection: "up",
    linkedTickets: "down",
  }

  return (
    <InsightTrendRow
      comparison={comparison}
      isImproved={preferredTrendByKey[metric.key] === metric.trend}
      trend={metric.trend}
      value={metric.deltaLabel}
    />
  )
}

const viewsChartConfig = {
  views: {
    label: "Views",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const viewsXAxisTicksByRange: Record<
  KnowledgeInsightPerformanceRange,
  string[]
> = {
  "7d": ["Jun 03", "Jun 05", "Jun 07", "Jun 09"],
  "30d": ["May 12", "May 20", "May 28", "Jun 05", "Jun 09"],
  "1m": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
}

function PerformanceSection({
  insights,
}: {
  insights: KnowledgeArticleInsightsViewModel
}) {
  const overview = insights.performanceOverview
  const [selectedRange, setSelectedRange] =
    useState<KnowledgeInsightPerformanceRange>(overview.defaultRange)
  const [chartType, setChartType] = useState<PerformanceChartType>("line")
  const chartData = overview.seriesByRange[selectedRange]
  const comparisonLabel = getPerformanceComparisonLabel(selectedRange)

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading title="Performance" />
        <SegmentedControl
          ariaLabel="Performance range"
          options={Object.entries(overview.rangeLabels).map(
            ([value, label]) => ({
              label,
              value,
            })
          )}
          value={selectedRange}
          onChange={(value) =>
            setSelectedRange(value as KnowledgeInsightPerformanceRange)
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TotalViewsCard
          chartData={chartData}
          chartType={chartType}
          comparisonLabel={comparisonLabel}
          deltaLabel={overview.totalViewsDeltaLabel}
          onChartTypeChange={setChartType}
          range={selectedRange}
          totalViews={overview.totalViews}
        />
        <HelpfulRateCard
          comparisonLabel={comparisonLabel}
          deltaLabel={overview.helpfulRateDeltaLabel}
          helpfulRate={overview.helpfulRate}
          helpfulVotes={overview.helpfulVotes}
          notHelpfulVotes={overview.notHelpfulVotes}
          unreviewedViews={overview.unreviewedViews}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {insights.performance.map((metric) => {
          const MetricIcon = metricIconByKey[metric.key]

          return (
            <StatCard
              key={metric.key}
              icon={<MetricIcon className="size-3.5" />}
              label={metric.label}
              value={metric.value}
              footer={
                <MetricFooter comparison={comparisonLabel} metric={metric} />
              }
            />
          )
        })}
      </div>
    </section>
  )
}

function SegmentedControl({
  ariaLabel,
  options,
  value,
  onChange,
}: {
  ariaLabel: string
  options: Array<{ label: string; value: string }>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div
      aria-label={ariaLabel}
      className="inline-flex h-7 items-center rounded-full bg-muted p-0.5 text-xs text-muted-foreground"
      role="group"
    >
      {options.map((option) => (
        <Button
          key={option.value}
          aria-pressed={value === option.value}
          className={cn(
            "h-6 rounded-full px-2.5 shadow-none",
            value === option.value
              ? "bg-background text-foreground hover:bg-background dark:bg-input/30"
              : "bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground dark:hover:bg-input/20"
          )}
          size="xs"
          type="button"
          variant="ghost"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

function InsightMetricBlock({
  action,
  children,
  className,
  contentClassName,
  icon,
  label,
}: {
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  icon: ReactNode
  label: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-muted/40 p-1.5 shadow-none ring-0 dark:bg-muted/25",
        className
      )}
    >
      <div className="flex min-h-10 items-center justify-between gap-3 px-2 pt-1 pb-2">
        <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {icon}
          <span className="truncate">{label}</span>
        </div>
        {action}
      </div>
      <div
        className={cn(
          "rounded-[calc(var(--radius-2xl)-6px)] border border-border bg-card px-5 py-4",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

function TotalViewsCard({
  chartData,
  chartType,
  comparisonLabel,
  deltaLabel,
  onChartTypeChange,
  range,
  totalViews,
}: {
  chartData: KnowledgeArticleInsightsViewModel["performanceOverview"]["seriesByRange"][KnowledgeInsightPerformanceRange]
  chartType: PerformanceChartType
  comparisonLabel: string
  deltaLabel: string
  onChartTypeChange: (type: PerformanceChartType) => void
  range: KnowledgeInsightPerformanceRange
  totalViews: number
}) {
  const areaGradientId = useId()
  const xAxisTicks = viewsXAxisTicksByRange[range]
  const yAxisWidth = useMemo(() => {
    const maxViews = Math.max(...chartData.map((point) => point.views))
    return maxViews >= 100 ? 34 : 28
  }, [chartData])

  return (
    <InsightMetricBlock
      action={
        <SegmentedControl
          ariaLabel="Views chart type"
          options={[
            { label: "Bar", value: "bar" },
            { label: "Line", value: "line" },
          ]}
          value={chartType}
          onChange={(value) => onChartTypeChange(value as PerformanceChartType)}
        />
      }
      className="lg:col-span-2"
      contentClassName="px-5 py-4 lg:px-6 lg:py-5"
      icon={<IconEye className="size-3.5" />}
      label="Total Views"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <p className="text-4xl leading-none font-semibold tracking-tight text-foreground tabular-nums">
            {totalViews.toLocaleString("en-US")}
          </p>
          <InsightTrendRow
            className="pb-1"
            comparison={comparisonLabel}
            isImproved
            trend="up"
            value={deltaLabel}
          />
        </div>

        <ChartContainer
          className="h-56 w-full"
          config={viewsChartConfig}
          initialDimension={{ width: 720, height: 224 }}
        >
          {chartType === "line" ? (
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={areaGradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-views)"
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-views)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="date"
                interval={0}
                tickLine={false}
                tickMargin={10}
                ticks={xAxisTicks}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                width={yAxisWidth}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
                cursor={{
                  stroke: "var(--border)",
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                dataKey="views"
                fill={`url(#${areaGradientId})`}
                fillOpacity={1}
                isAnimationActive={false}
                stroke="var(--color-views)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          ) : (
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="date"
                interval={0}
                tickLine={false}
                tickMargin={10}
                ticks={xAxisTicks}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                width={yAxisWidth}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
                cursor={false}
              />
              <Bar
                dataKey="views"
                fill="var(--color-views)"
                isAnimationActive={false}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </InsightMetricBlock>
  )
}

function HelpfulRateCard({
  comparisonLabel,
  deltaLabel,
  helpfulRate,
  helpfulVotes,
  notHelpfulVotes,
  unreviewedViews,
}: {
  comparisonLabel: string
  deltaLabel: string
  helpfulRate: number
  helpfulVotes: number
  notHelpfulVotes: number
  unreviewedViews: number
}) {
  return (
    <InsightMetricBlock
      className="flex h-full min-h-full flex-col"
      contentClassName="flex min-h-72 flex-1 flex-col px-5 py-4 lg:px-6 lg:py-5"
      icon={<IconThumbUp className="size-3.5" />}
      label="Helpful Rate"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <p className="text-4xl leading-none font-semibold tracking-tight text-foreground tabular-nums">
            {helpfulRate}%
          </p>
          <InsightTrendRow
            className="pb-1"
            comparison={comparisonLabel}
            isImproved
            trend="up"
            value={deltaLabel}
          />
        </div>

        <div className="mt-auto pt-8">
          <HelpfulRateDistribution
            helpfulVotes={helpfulVotes}
            notHelpfulVotes={notHelpfulVotes}
            unreviewedViews={unreviewedViews}
          />
        </div>
      </div>
    </InsightMetricBlock>
  )
}

function HelpfulRateDistribution({
  helpfulVotes,
  notHelpfulVotes,
  unreviewedViews,
}: {
  helpfulVotes: number
  notHelpfulVotes: number
  unreviewedViews: number
}) {
  const totalViews = helpfulVotes + notHelpfulVotes + unreviewedViews
  const normalizedTotalViews = Math.max(totalViews, 1)
  const segmentPercents = getHelpfulRateBarPercents(
    [
      (helpfulVotes / normalizedTotalViews) * 100,
      (notHelpfulVotes / normalizedTotalViews) * 100,
      (unreviewedViews / normalizedTotalViews) * 100,
    ],
    totalViews
  )
  const segments = [
    {
      key: "helpful",
      accentClassName: "bg-chart-2",
      barClassName: "bg-chart-2",
      label: "Helpful",
      value: helpfulVotes,
      width: segmentPercents[0],
    },
    {
      key: "not-helpful",
      accentClassName: "bg-destructive/70",
      barClassName: "bg-destructive/70",
      label: "Not helpful",
      value: notHelpfulVotes,
      width: segmentPercents[1],
    },
    {
      key: "not-reviewed",
      accentClassName: "bg-muted-foreground/50",
      barClassName:
        "bg-muted/70 bg-[repeating-linear-gradient(135deg,var(--muted-foreground)_0_1px,transparent_1px_6px)] opacity-70",
      label: "Not reviewed",
      value: unreviewedViews,
      width: segmentPercents[2],
    },
  ]
  const gridTemplateColumns = segments
    .map((segment) => `${segment.width}fr`)
    .join(" ")

  return (
    <div
      aria-label={`${helpfulVotes} helpful votes, ${notHelpfulVotes} not helpful votes, and ${unreviewedViews} views without review`}
      className="grid min-w-0 overflow-hidden rounded-sm"
      role="img"
      style={{ gridTemplateColumns }}
    >
      {segments.map((segment) => (
        <HelpfulRateSegment
          key={segment.key}
          accentClassName={segment.accentClassName}
          barClassName={segment.barClassName}
          label={segment.label}
          value={segment.value}
        />
      ))}
    </div>
  )
}

function getHelpfulRateBarPercents(percents: number[], totalViews: number) {
  if (totalViews === 0) {
    return percents.map(() => 100 / percents.length)
  }

  const visiblePercents = percents.map((percent) =>
    percent > 0 ? Math.max(percent, MIN_HELPFUL_RATE_SEGMENT_PERCENT) : 0
  )
  const visibleTotal = visiblePercents.reduce(
    (total, percent) => total + percent,
    0
  )

  return visiblePercents.map((percent) => (percent / visibleTotal) * 100)
}

function HelpfulRateSegment({
  accentClassName,
  barClassName,
  label,
  value,
}: {
  accentClassName: string
  barClassName: string
  label: string
  value: number
}) {
  return (
    <div className="relative min-w-0">
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-px", accentClassName)}
      />
      <div className="min-w-0 px-2.5 py-2.5">
        <p className="truncate text-base leading-5 font-semibold text-foreground tabular-nums sm:text-lg sm:leading-6">
          {value.toLocaleString("en-US")}
        </p>
        <p className="truncate text-xs leading-4 font-medium text-muted-foreground">
          {label}
        </p>
      </div>
      <div className={cn("h-3", barClassName)} />
    </div>
  )
}

function MatchingSourceBadge({
  source,
}: {
  source: KnowledgeInsightSignalSource
}) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 rounded-full px-2.5", sourceBadgeClassName[source])}
    >
      {sourceLabel[source]}
    </Badge>
  )
}

function MatchingSection({
  insights,
}: {
  insights: KnowledgeArticleInsightsViewModel
}) {
  return (
    <section className="space-y-4">
      <SectionHeading title="Matching" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-4 border-b border-border p-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:p-5">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">
                Match signals
              </h3>
              <Badge variant="outline" className="h-7 rounded-full px-3">
                Category: {insights.matching.categoryLabel}
              </Badge>
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 self-start rounded-xl border border-border bg-muted/40 p-2">
            <div className="relative min-w-40 flex-1">
              <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Matching test query"
                readOnly
                value={insights.matching.testQuery}
                className="h-8 rounded-lg border-0 bg-transparent px-2 pl-8 shadow-none focus-visible:ring-0"
              />
            </div>
            <Badge
              variant="secondary"
              className="h-7 max-w-full rounded-full px-2.5"
            >
              {insights.matching.testResult}
            </Badge>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[34%]">Signal</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Matches 30d</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insights.matching.signals.map((signal) => (
              <MatchingSignalRow key={signal.id} signal={signal} />
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

function MatchingSignalRow({ signal }: { signal: KnowledgeInsightSignal }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center gap-2">
          <IconBook2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">
            {signal.signal}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <MatchingSourceBadge source={signal.source} />
      </TableCell>
      <TableCell className="font-medium text-foreground tabular-nums">
        {signal.matches30d.toLocaleString("en-US")}
      </TableCell>
      <TableCell className="font-medium text-foreground tabular-nums">
        {signal.openRate === null ? "-" : `${signal.openRate}%`}
      </TableCell>
      <TableCell className="text-muted-foreground">{signal.status}</TableCell>
    </TableRow>
  )
}

function LinkedTicketsSection({
  insights,
}: {
  insights: KnowledgeArticleInsightsViewModel
}) {
  return (
    <section className="space-y-4">
      <SectionHeading title="Linked tickets" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Ticket</TableHead>
              <TableHead className="min-w-60">Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reader context</TableHead>
              <TableHead>Customer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insights.linkedTickets.rows.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium text-muted-foreground tabular-nums">
                  {ticket.ticketNumber}
                </TableCell>
                <TableCell className="max-w-80 truncate font-medium text-foreground">
                  {ticket.subject}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="h-6 rounded-full px-2.5">
                    {ticketTypeLabel[ticket.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {ticketContextLabel[ticket.context]}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {ticket.customer}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

function FeedbackSection({
  insights,
}: {
  insights: KnowledgeArticleInsightsViewModel
}) {
  return (
    <section className="space-y-4">
      <SectionHeading title="Feedback" />
      <div className="grid gap-4 lg:grid-cols-2">
        <FeedbackColumn
          title={`Not helpful - ${insights.feedback.notHelpfulVotes} votes`}
          icon={<IconThumbDown className="size-4" />}
          comments={insights.feedback.negativeComments}
          tone="negative"
        />
        <FeedbackColumn
          title={`Helpful - ${insights.feedback.helpfulVotes} votes`}
          icon={<IconThumbUp className="size-4" />}
          comments={insights.feedback.helpfulComments}
          tone="positive"
        />
      </div>
    </section>
  )
}

function FeedbackColumn({
  title,
  icon,
  comments,
  tone,
}: {
  title: string
  icon: ReactNode
  comments: KnowledgeArticleInsightsViewModel["feedback"]["negativeComments"]
  tone: "negative" | "positive"
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 lg:p-5">
      <div
        className={cn(
          "flex items-center gap-2 text-sm font-semibold",
          tone === "negative"
            ? "text-rose-600 dark:text-rose-300"
            : "text-emerald-600 dark:text-emerald-300"
        )}
      >
        {icon}
        {title}
      </div>
      <div className="mt-4 space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-xl border border-border bg-muted/30 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                {comment.vote === "helpful" ? (
                  <IconCircleCheck className="size-3.5 text-emerald-600 dark:text-emerald-300" />
                ) : (
                  <IconMessageReport className="size-3.5 text-rose-600 dark:text-rose-300" />
                )}
                {comment.vote === "helpful" ? "Helpful" : "Not helpful"}
              </span>
              <span>{comment.age}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {comment.body}
            </p>
            <Badge variant="secondary" className="mt-3 h-6 rounded-full px-2.5">
              From: {comment.source}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

export function KnowledgeArticleInsights({
  article,
}: KnowledgeArticleInsightsProps) {
  const insights = getKnowledgeArticleInsights(article)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-9">
      <PerformanceSection insights={insights} />
      <MatchingSection insights={insights} />
      <LinkedTicketsSection insights={insights} />
      <FeedbackSection insights={insights} />
    </div>
  )
}
