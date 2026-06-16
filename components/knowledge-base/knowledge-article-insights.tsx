"use client"

import Link from "next/link"
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
  IconClock,
  IconEye,
  IconMinus,
  IconStar,
  IconStarFilled,
  IconTicket,
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
import { TicketPriorityLabel } from "@/components/ticket-priority-label"
import { TicketStatusBadge } from "@/components/ticket-status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useKnowledgeInsightSignals,
  type KnowledgeMatchingSignalView,
} from "@/components/knowledge-base/use-knowledge-insight-signals"
import {
  getKnowledgeArticleInsights,
  type KnowledgeArticleInsightsViewModel,
  type KnowledgeInsightMetric,
  type KnowledgeInsightPerformanceRange,
  type KnowledgeInsightSignalSource,
  type KnowledgeInsightTrend,
  type KnowledgeFeedbackComment,
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
const MATCHING_PROGRESS_MIN_PERCENT = 3
const SEARCH_DISCOVERY_MIN_PERCENT = 12
type SearchDiscoveryMetric = "ctr" | "views"

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

function EmptyTableRow({
  children,
  colSpan,
}: {
  children: ReactNode
  colSpan: number
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="h-24 text-center text-sm text-muted-foreground"
      >
        {children}
      </TableCell>
    </TableRow>
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
  const {
    maxMatches,
    sortedSignals,
    handleAddSignal,
    handleRemove,
    handleToggleMute,
  } = useKnowledgeInsightSignals(insights.matching.signals)

  return (
    <section className="space-y-4">
      <SectionHeading title="Matching" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table className="min-w-[50rem]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[34%]">
                Signal
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Matches</TableHead>
              <TableHead>
                Article opened
              </TableHead>
              <TableHead className="w-32 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSignals.length > 0 ? (
              sortedSignals.map((signal) => (
                <MatchingSignalRow
                  key={signal.id}
                  maxMatches={maxMatches}
                  signal={signal}
                  onAddSignal={handleAddSignal}
                  onMuteSignal={handleToggleMute}
                  onRemoveSignal={handleRemove}
                />
              ))
            ) : (
              <EmptyTableRow colSpan={5}>
                No matching signals are available for this article.
              </EmptyTableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

function MatchingSignalRow({
  maxMatches,
  signal,
  onAddSignal,
  onMuteSignal,
  onRemoveSignal,
}: {
  maxMatches: number
  signal: KnowledgeMatchingSignalView
  onAddSignal: (signalId: string) => void
  onMuteSignal: (signalId: string) => void
  onRemoveSignal: (signalId: string) => void
}) {
  const progressValue = Math.max(
    Math.round((signal.matches30d / maxMatches) * 100),
    signal.matches30d > 0 ? MATCHING_PROGRESS_MIN_PERCENT : 0
  )
  const isSuggested = signal.source === "suggested"
  const actionButtonClassName = "h-auto px-0 py-0 text-sm font-semibold"

  return (
    <TableRow
      className={cn(
        signal.isMuted && "opacity-55",
        isSuggested && "bg-primary/5 hover:bg-primary/10"
      )}
    >
      <TableCell>
        <div className="flex min-w-0 items-center gap-2 font-medium text-foreground">
          <span className="truncate font-medium text-foreground">
            {signal.signal}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <MatchingSourceBadge source={signal.source} />
      </TableCell>
      <TableCell>
        <div className="flex min-w-[12rem] items-center gap-3">
          <span className="w-12 font-medium text-foreground tabular-nums">
            {signal.matches30d.toLocaleString("en-US")}
          </span>
          {signal.missedSearchesLabel ? (
            <span className="text-muted-foreground">
              {signal.missedSearchesLabel}
            </span>
          ) : (
            <div
              aria-label={`${signal.matches30d.toLocaleString("en-US")} matches in the last 30 days`}
              className="h-2 w-28 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium text-foreground tabular-nums">
        {signal.openRate === null ? "-" : `${signal.openRate}%`}
      </TableCell>
      <TableCell className="text-right">
        {signal.action === "add" ? (
          <Button
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => onAddSignal(signal.id)}
          >
            Add signal
          </Button>
        ) : signal.action === "remove" ? (
          <Button
            variant="ghost"
            className={cn(
              actionButtonClassName,
              "text-destructive hover:text-destructive"
            )}
            onClick={() => onRemoveSignal(signal.id)}
          >
            Remove?
          </Button>
        ) : (
          <div className="flex justify-end gap-2 text-sm">
            <Button
              variant="ghost"
              className={actionButtonClassName}
              onClick={() => onMuteSignal(signal.id)}
            >
              {signal.isMuted ? "Unmute" : "Mute"}
            </Button>
          </div>
        )}
      </TableCell>
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
        <Table className="min-w-[44rem] table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28">Ticket</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="hidden w-28 xl:table-cell">Type</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-28">Priority</TableHead>
              <TableHead className="w-36">Reader context</TableHead>
              <TableHead className="hidden w-36 xl:table-cell">
                Customer
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insights.linkedTickets.rows.length > 0 ? (
              insights.linkedTickets.rows.map((ticket) => (
                <LinkedTicketRow key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <EmptyTableRow colSpan={7}>
                No linked tickets are available for this article.
              </EmptyTableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

function LinkedTicketRow({ ticket }: { ticket: KnowledgeLinkedTicket }) {
  const ticketHref = `/tickets/${ticket.ticketId}`

  return (
    <TableRow>
      <TableCell>
        <Link
          href={ticketHref}
          className="inline-flex whitespace-nowrap font-medium text-muted-foreground tabular-nums underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          {ticket.ticketNumber}
        </Link>
      </TableCell>
      <TableCell className="max-w-80">
        <Link
          href={ticketHref}
          className="block truncate font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          {ticket.subject}
        </Link>
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <Badge variant="outline" className="h-6 rounded-full px-2.5">
          {ticketTypeLabel[ticket.type]}
        </Badge>
      </TableCell>
      <TableCell>
        <TicketStatusBadge status={ticket.status} />
      </TableCell>
      <TableCell>
        <TicketPriorityLabel priority={ticket.priority} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {ticketContextLabel[ticket.context]}
      </TableCell>
      <TableCell className="hidden font-medium text-foreground xl:table-cell">
        {ticket.customer}
      </TableCell>
    </TableRow>
  )
}

function FeedbackSection({
  insights,
}: {
  insights: KnowledgeArticleInsightsViewModel
}) {
  const [filter, setFilter] = useState<"helpful" | "not-helpful">("helpful")
  const comments = useMemo(
    () =>
      [...insights.feedback.helpfulComments, ...insights.feedback.negativeComments]
        .sort(
          (firstComment, secondComment) =>
            getCommentAgeDays(firstComment.age) - getCommentAgeDays(secondComment.age)
        ),
    [insights.feedback.helpfulComments, insights.feedback.negativeComments]
  )
  const filteredComments = useMemo(
    () => comments.filter((comment) => comment.vote === filter),
    [comments, filter]
  )

  return (
    <section className="space-y-4">
      <SectionHeading title="Quality signals" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
        <CustomerFeedbackPanel
          averageRating={insights.feedback.averageRating}
          comments={filteredComments}
          filter={filter}
          onFilterChange={setFilter}
          reviewCount={insights.feedback.reviewCount}
        />
        <SearchDiscoveryPanel
          queries={insights.searchDiscovery.queries}
        />
      </div>
    </section>
  )
}

function CustomerFeedbackPanel({
  averageRating,
  comments,
  filter,
  onFilterChange,
  reviewCount,
}: {
  averageRating: number
  comments: KnowledgeFeedbackComment[]
  filter: "helpful" | "not-helpful"
  onFilterChange: (nextFilter: "helpful" | "not-helpful") => void
  reviewCount: number
}) {
  return (
    <InsightMetricBlock
      action={
        <div className="inline-flex w-fit items-center gap-1 rounded-full bg-muted p-0.5">
          <FeedbackFilterButton
            active={filter === "helpful"}
            emoji="👍"
            label="Helpful"
            onClick={() => onFilterChange("helpful")}
          />
          <FeedbackFilterButton
            active={filter === "not-helpful"}
            emoji="👎"
            label="Not helpful"
            onClick={() => onFilterChange("not-helpful")}
          />
        </div>
      }
      className="h-full"
      contentClassName="flex h-[28rem] flex-col overflow-hidden p-0"
      icon={<IconStarFilled className="size-3.5 fill-amber-400 text-amber-400" />}
      label={`${averageRating.toFixed(1)} · ${reviewCount} Customer feedbacks`}
    >
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-1 pb-1">
        {comments.map((comment) => (
          <FeedbackListItem key={comment.id} comment={comment} />
        ))}
        {comments.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground sm:px-5">
            No feedback matches this filter yet.
          </div>
        ) : null}
      </div>
    </InsightMetricBlock>
  )
}

function FeedbackFilterButton({
  active,
  emoji,
  label,
  onClick,
}: {
  active: boolean
  emoji: string
  label: string
  onClick: () => void
}) {
  return (
    <Button
      variant={active ? "outline" : "ghost"}
      size="icon-xs"
      className={cn(
        "rounded-full",
        active
          ? "bg-background text-foreground shadow-none hover:bg-background dark:bg-input/30"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground dark:hover:bg-input/20"
      )}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {emoji}
      </span>
    </Button>
  )
}

function FeedbackListItem({
  comment,
}: {
  comment: KnowledgeFeedbackComment
}) {
  return (
    <div data-feedback-item className="flex gap-4 rounded-lg px-3 py-4 sm:px-4">
      <Avatar size="lg">
        <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
          {comment.authorInitials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="truncate text-base font-semibold text-foreground">
                {comment.authorName}
              </span>
              <StarRating rating={comment.rating} />
            </div>
            <p className="text-base leading-7 text-muted-foreground">
              {comment.body}
            </p>
          </div>
          <div className="flex shrink-0 items-center text-sm text-muted-foreground">
            <span>{comment.age}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  const roundedRating = Math.round(rating)

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) =>
        index < roundedRating ? (
          <IconStarFilled
            key={index}
            className="size-4 fill-amber-400 text-amber-400"
          />
        ) : (
          <IconStar key={index} className="size-4 text-muted-foreground/45" />
        )
      )}
    </span>
  )
}

function SearchDiscoveryPanel({
  queries,
}: {
  queries: KnowledgeArticleInsightsViewModel["searchDiscovery"]["queries"]
}) {
  const [selectedMetric, setSelectedMetric] =
    useState<SearchDiscoveryMetric>("ctr")
  const maxMetricValue = useMemo(
    () =>
      Math.max(
        ...queries.map((query) =>
          selectedMetric === "ctr" ? query.ctr : query.views
        ),
        1
      ),
    [queries, selectedMetric]
  )

  return (
    <InsightMetricBlock
      action={
        <SegmentedControl
          ariaLabel="Search discovery metric"
          options={[
            { label: "CTR", value: "ctr" },
            { label: "Views", value: "views" },
          ]}
          value={selectedMetric}
          onChange={(value) =>
            setSelectedMetric(value as SearchDiscoveryMetric)
          }
        />
      }
      className="h-full"
      contentClassName="flex h-[28rem] flex-col overflow-hidden p-0"
      icon={<IconEye className="size-3.5" />}
      label="Search Discovery"
    >
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-1 pt-1">
        {queries.map((query) => (
          <div
            key={query.id}
            data-search-query-row
            className="space-y-4 rounded-lg px-3 py-4 sm:px-4"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="min-w-0 text-lg font-medium text-foreground">
                {query.query}
              </p>
              <div className="shrink-0 text-right text-sm">
                <p className="whitespace-nowrap font-medium text-foreground">
                  {selectedMetric === "ctr"
                    ? `${query.ctr}% CTR`
                    : `${query.views.toLocaleString("en-US")} views`}
                </p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.max(
                    Math.round(
                      ((selectedMetric === "ctr" ? query.ctr : query.views) /
                        maxMetricValue) *
                        100
                    ),
                    SEARCH_DISCOVERY_MIN_PERCENT
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </InsightMetricBlock>
  )
}

function getCommentAgeDays(age: string) {
  const matches = age.match(/(\d+)/)

  return matches ? Number(matches[1]) : Number.MAX_SAFE_INTEGER
}

export function KnowledgeArticleInsights({
  article,
}: KnowledgeArticleInsightsProps) {
  const insights = useMemo(() => getKnowledgeArticleInsights(article), [article])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-9">
      <PerformanceSection insights={insights} />
      <MatchingSection insights={insights} />
      <LinkedTicketsSection insights={insights} />
      <FeedbackSection insights={insights} />
    </div>
  )
}
