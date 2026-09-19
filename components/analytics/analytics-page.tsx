"use client"

import { TableSurface } from "@/components/ui/table"

import Link from "next/link"
import { startTransition, useId, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconArrowRight,
  IconCalendar,
  IconChartAreaLine,
  IconChartBar,
  IconChartHistogram,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconFilterX,
  IconInfoCircle,
  IconMinus,
  IconRosetteDiscountCheck,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { InsightMetricBlock } from "@/components/insights/insight-metric-block"
import { StatCard } from "@/components/stats/stat-card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  analyticsComparisonOptions,
  analyticsFilterOptions,
  analyticsRangeOptions,
  breachedTickets,
  defaultAnalyticsFilters,
  getAnalyticsComparison,
  getAnalyticsRange,
  getAnalyticsViewModel,
} from "@/lib/analytics/mock-data"
import type {
  AnalyticsComparison,
  AnalyticsFilterKey,
  AnalyticsFilters,
  AnalyticsMetric,
  AnalyticsRange,
  AnalyticsViewModel,
} from "@/lib/analytics/types"
import { cn } from "@/lib/utils"

const chartConfig = {
  newTickets: { label: "New tickets", color: "var(--primary)" },
  resolved: { label: "Resolved tickets", color: "var(--chart-4)" },
} satisfies ChartConfig

const filterLabels: Record<AnalyticsFilterKey, string> = {
  team: "Team",
  agent: "Agent",
  channel: "Channel",
  category: "Category",
  segment: "Segment",
}

function HelpTooltip({ label, hint }: { label: string; hint: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<button type="button" aria-label={`About ${label}`} />}
      >
        <IconInfoCircle className="size-3.5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{hint}</TooltipContent>
    </Tooltip>
  )
}

function Sparkline({ label, values }: { label: string; values: number[] }) {
  const gradientId = useId()
  const data = values.map((value, index) => ({ index, value }))
  return (
    <ChartContainer
      config={{ value: { label, color: "var(--primary)" } }}
      className="aspect-auto h-12 w-28 shrink-0 [&_.recharts-surface]:overflow-visible"
      initialDimension={{ width: 112, height: 48 }}
    >
      <AreaChart data={data} margin={{ top: 6, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-value)"
              stopOpacity={0.2}
            />
            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <ChartTooltip
          allowEscapeViewBox={{ x: true, y: true }}
          cursor={false}
          position={{ x: -72, y: -62 }}
          content={<ChartTooltipContent hideLabel className="-translate-y-7" />}
        />
        <Area
          type="linear"
          dataKey="value"
          fill={`url(#${gradientId})`}
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, stroke: "var(--background)", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

function MetricFooter({ metric }: { metric: AnalyticsMetric }) {
  if (!metric.change || !metric.comparisonLabel) {
    return (
      <p className="text-xs text-muted-foreground">Comparison turned off</p>
    )
  }
  const TrendIcon =
    metric.direction === "up"
      ? IconTrendingUp
      : metric.direction === "down"
        ? IconTrendingDown
        : IconMinus
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-1 font-semibold",
          metric.trend === "positive"
            ? "text-emerald-600"
            : metric.trend === "negative"
              ? "text-destructive"
              : "text-muted-foreground"
        )}
      >
        <TrendIcon className="size-3.5" /> {metric.change}
      </span>
      <span className="text-muted-foreground">{metric.comparisonLabel}</span>
    </div>
  )
}

function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  return (
    <StatCard
      label={metric.label}
      icon={<HelpTooltip label={metric.label} hint={metric.definition} />}
      value={metric.value}
      visual={<Sparkline label={metric.label} values={metric.sparkline} />}
      footer={<MetricFooter metric={metric} />}
    />
  )
}

function FilterBar({
  filters,
  activeCount,
  onChange,
  onClear,
}: {
  filters: AnalyticsFilters
  activeCount: number
  onChange: (key: AnalyticsFilterKey, value: string) => void
  onClear: () => void
}) {
  return (
    <div className="flex w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] min-w-0 flex-wrap items-center gap-x-5 gap-y-3 sm:w-full sm:max-w-full">
      {(Object.keys(filterLabels) as AnalyticsFilterKey[]).map((key) => (
        <label
          key={key}
          className="flex w-full max-w-full min-w-0 basis-full items-center gap-2 text-sm font-medium text-foreground sm:w-auto sm:min-w-44 sm:flex-1 sm:basis-auto"
        >
          <span className="shrink-0">{filterLabels[key]}</span>
          <Select
            value={filters[key]}
            onValueChange={(value) =>
              onChange(key, value ?? defaultAnalyticsFilters[key])
            }
          >
            <SelectTrigger className="min-w-0 flex-1 rounded-lg border-border bg-background">
              <span className="truncate">
                {analyticsFilterOptions[key].find(
                  (option) => option.value === filters[key]
                )?.label ?? filters[key]}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {analyticsFilterOptions[key].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
      ))}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Clear filters"
              disabled={activeCount === 0}
              onClick={onClear}
            />
          }
        >
          <IconFilterX className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Clear filters</TooltipContent>
      </Tooltip>
    </div>
  )
}

function PeriodControls({
  range,
  comparison,
  onRangeChange,
  onComparisonChange,
}: {
  range: AnalyticsRange
  comparison: AnalyticsComparison
  onRangeChange: (value: AnalyticsRange) => void
  onComparisonChange: (value: AnalyticsComparison) => void
}) {
  const rangeLabel = analyticsRangeOptions.find(
    (option) => option.value === range
  )?.label
  const comparisonLabel = analyticsComparisonOptions.find(
    (option) => option.value === comparison
  )?.label
  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          <IconCalendar className="size-4" />
          {rangeLabel}
          <IconChevronDown className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {analyticsRangeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onRangeChange(option.value)}
            >
              {option.label}
              {range === option.value ? (
                <IconCheck className="ml-auto size-4" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          {comparisonLabel}
          <IconChevronDown className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {analyticsComparisonOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onComparisonChange(option.value)}
            >
              {option.label}
              {comparison === option.value ? (
                <IconCheck className="ml-auto size-4" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function VolumeChart({ data }: { data: AnalyticsViewModel["ticketVolume"] }) {
  const newTicketsGradient = useId()
  const resolvedGradient = useId()
  return (
    <InsightMetricBlock
      className="flex h-full min-w-0 flex-col"
      contentClassName="flex min-h-0 flex-1 flex-col px-3 py-4 sm:px-5"
      icon={<IconChartAreaLine className="size-3.5" />}
      label="Ticket volume and resolutions"
    >
      <ChartContainer
        config={chartConfig}
        className="aspect-auto min-h-64 w-full flex-1 sm:min-h-72"
        initialDimension={{ width: 720, height: 288 }}
      >
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id={newTicketsGradient} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-newTickets)"
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor="var(--color-newTickets)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id={resolvedGradient} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-resolved)"
                stopOpacity={0.12}
              />
              <stop
                offset="95%"
                stopColor="var(--color-resolved)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval={0}
            tickFormatter={(_, index) => data[index]?.axisLabel ?? ""}
          />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            type="linear"
            dataKey="newTickets"
            fill={`url(#${newTicketsGradient})`}
            stroke="var(--color-newTickets)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4, stroke: "var(--background)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Area
            type="linear"
            dataKey="resolved"
            fill={`url(#${resolvedGradient})`}
            stroke="var(--color-resolved)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, stroke: "var(--background)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
      <div className="mt-2 flex gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" />
          New tickets
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-chart-4" />
          Resolved tickets
        </span>
      </div>
    </InsightMetricBlock>
  )
}

function TruncatedCell({ children }: { children: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="block w-full truncate" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}

function InternalAction({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Button
      variant="link"
      className="h-auto px-0 py-0"
      nativeButton={false}
      render={<Link href={href} />}
    >
      {children}
      <IconArrowRight className="size-3.5" />
    </Button>
  )
}

function SlaPanel({
  statuses,
}: {
  statuses: AnalyticsViewModel["slaStatuses"]
}) {
  const [expanded, setExpanded] = useState(true)
  const toneClass = {
    primary: "bg-primary",
    secondary: "bg-chart-2",
    destructive: "bg-destructive",
  } as const
  return (
    <InsightMetricBlock
      contentClassName="space-y-3 px-3 py-3"
      icon={<IconRosetteDiscountCheck className="size-3.5" />}
      label="SLA status"
    >
      <div className="grid gap-2">
        {statuses.map((status) => (
          <button
            key={status.label}
            type="button"
            className={cn(
              "grid grid-cols-[64px_1fr_48px_42px_16px] items-center gap-2 rounded-lg px-1 py-1.5 text-left text-xs",
              status.label === "Breached" &&
                "bg-primary/5 ring-1 ring-primary/20"
            )}
            onClick={() =>
              status.label === "Breached" && setExpanded((value) => !value)
            }
          >
            <span>{status.label}</span>
            <span className="h-3 overflow-hidden rounded-full bg-muted">
              <span
                className={cn(
                  "block h-full rounded-full",
                  toneClass[status.tone]
                )}
                style={{ width: `${status.percent}%` }}
              />
            </span>
            <span className="text-right tabular-nums">{status.count}</span>
            <span className="text-right tabular-nums">{status.percent}%</span>
            {status.label === "Breached" ? (
              expanded ? (
                <IconChevronUp className="size-4" />
              ) : (
                <IconChevronDown className="size-4" />
              )
            ) : null}
          </button>
        ))}
      </div>
      {expanded ? (
        <TableSurface>
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <p className="truncate text-sm font-semibold">
              Tickets contributing to SLA breaches
            </p>
            <InternalAction href="/tickets?view=past-due">
              View all tickets
            </InternalAction>
          </div>
          <div>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20 px-2 sm:px-3">Ticket</TableHead>
                  <TableHead className="px-2 sm:px-3">Customer</TableHead>
                  <TableHead className="hidden w-20 px-2 sm:table-cell sm:px-3">
                    Priority
                  </TableHead>
                  <TableHead className="hidden w-14 px-2 sm:px-3 md:table-cell">
                    Owner
                  </TableHead>
                  <TableHead className="w-24 px-2 whitespace-nowrap sm:px-3">
                    SLA overdue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breachedTickets.length ? (
                  breachedTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="px-2 py-3 sm:px-3">
                        <Link
                          className="font-medium text-muted-foreground tabular-nums underline-offset-4 hover:text-foreground hover:underline"
                          href={`/tickets?ticket=${ticket.id}`}
                        >
                          #{ticket.id}
                        </Link>
                      </TableCell>
                      <TableCell className="px-2 py-3 sm:px-3">
                        <TruncatedCell>{ticket.customer}</TruncatedCell>
                      </TableCell>
                      <TableCell className="hidden px-2 py-3 whitespace-nowrap sm:table-cell sm:px-3">
                        {ticket.priority}
                      </TableCell>
                      <TableCell className="hidden px-2 py-3 whitespace-nowrap sm:px-3 md:table-cell">
                        {ticket.owner}
                      </TableCell>
                      <TableCell className="px-2 py-3 whitespace-nowrap tabular-nums sm:px-3">
                        {ticket.overdue}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No breached tickets for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TableSurface>
      ) : null}
    </InsightMetricBlock>
  )
}

function SupportingBlocks({ viewModel }: { viewModel: AnalyticsViewModel }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:gap-5 lg:grid-cols-3">
      <InsightMetricBlock
        className="flex h-full flex-col"
        contentClassName="flex-1"
        icon={<IconChartBar className="size-3.5" />}
        label="Average resolution time by team"
      >
        <div className="grid gap-4">
          {viewModel.teamResolution.map((team) => (
            <div
              key={team.label}
              className="grid grid-cols-[64px_1fr_36px] items-center gap-3 text-sm"
            >
              <span>{team.label}</span>
              <span className="h-3 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${team.percent}%` }}
                />
              </span>
              <span className="tabular-nums">{team.value}h</span>
            </div>
          ))}
        </div>
      </InsightMetricBlock>
      <InsightMetricBlock
        className="flex h-full flex-col"
        contentClassName="flex-1"
        icon={<IconRosetteDiscountCheck className="size-3.5" />}
        label="Quality signals"
      >
        <div className="divide-y">
          {viewModel.qualitySignals.map((signal) => (
            <div
              key={signal.label}
              className="grid grid-cols-[1fr_auto_auto] gap-3 py-2 text-sm"
            >
              <span className="truncate">{signal.label}</span>
              <strong className="tabular-nums">{signal.value}</strong>
              {signal.change ? (
                <span
                  className={
                    signal.tone === "positive"
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }
                >
                  {signal.change}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          ))}
        </div>
      </InsightMetricBlock>
      <InsightMetricBlock
        className="flex h-full flex-col"
        contentClassName="flex-1"
        icon={<IconChartHistogram className="size-3.5" />}
        label="Issues requiring attention"
      >
        <div className="divide-y">
          {viewModel.issueSignals.map((signal, index) => (
            <div
              key={signal.label}
              className="grid grid-cols-[20px_1fr_auto_auto] gap-3 py-2 text-sm"
            >
              <span>{index + 1}.</span>
              <span className="truncate">{signal.label}</span>
              <span className="tabular-nums">{signal.count}</span>
              {signal.change ? (
                <span
                  className={
                    signal.tone === "positive"
                      ? "text-emerald-600"
                      : "text-destructive"
                  }
                >
                  {signal.change}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          ))}
        </div>
      </InsightMetricBlock>
    </div>
  )
}

function SecondaryBlocks({ viewModel }: { viewModel: AnalyticsViewModel }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:gap-5 lg:grid-cols-2">
      <InsightMetricBlock
        icon={<IconChartHistogram className="size-3.5" />}
        label="Unassigned tickets"
      >
        <div className="flex items-end gap-3">
          <strong className="text-3xl tabular-nums">
            {viewModel.unassigned.total}
          </strong>
          {viewModel.unassigned.change ? (
            <span className="mb-1 text-xs font-medium text-destructive">
              <IconTrendingUp className="inline size-3.5" />{" "}
              {viewModel.unassigned.change}
            </span>
          ) : null}
        </div>
        <div className="mt-3 divide-y text-sm">
          <div className="flex justify-between py-2">
            <span>High priority</span>
            <span className="tabular-nums">
              {viewModel.unassigned.highPriority}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span>Standard</span>
            <span className="tabular-nums">
              {viewModel.unassigned.standard}
            </span>
          </div>
        </div>
        <InternalAction href="/tickets?view=unassigned">
          View unassigned tickets
        </InternalAction>
      </InsightMetricBlock>
      <InsightMetricBlock
        icon={<IconChartHistogram className="size-3.5" />}
        label="Repeat-contact accounts"
      >
        <p className="text-xs text-muted-foreground">
          Accounts with 3+ tickets in the selected period
        </p>
        <div className="mt-2 divide-y text-sm">
          {viewModel.repeatAccounts.map((row) => (
            <div
              key={row.account}
              className="grid grid-cols-[1fr_auto_1fr] gap-3 py-2"
            >
              <span className="truncate">{row.account}</span>
              <span className="whitespace-nowrap tabular-nums">
                {row.tickets} tickets
              </span>
              <span className="truncate text-right">{row.category}</span>
            </div>
          ))}
        </div>
        <InternalAction href="/customers">
          View affected accounts
        </InternalAction>
      </InsightMetricBlock>
    </div>
  )
}

export function AnalyticsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const range = getAnalyticsRange(searchParams.get("range"))
  const comparison = getAnalyticsComparison(searchParams.get("compare"))
  const viewModel = useMemo(
    () => getAnalyticsViewModel(range, comparison),
    [range, comparison]
  )
  const [filters, setFilters] = useState<AnalyticsFilters>(
    defaultAnalyticsFilters
  )
  const activeFilterCount = useMemo(
    () =>
      (Object.keys(filters) as AnalyticsFilterKey[]).filter(
        (key) => filters[key] !== defaultAnalyticsFilters[key]
      ).length,
    [filters]
  )

  const updatePeriod = (key: "range" | "compare", value: string) => {
    const next = new URLSearchParams(searchParams.toString())
    next.set(key, value)
    startTransition(() =>
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    )
  }

  return (
    <div className="grid w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] min-w-0 grid-cols-[minmax(0,1fr)] gap-4 pb-6 sm:w-full sm:max-w-full sm:gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <PeriodControls
          range={range}
          comparison={comparison}
          onRangeChange={(value) => updatePeriod("range", value)}
          onComparisonChange={(value) => updatePeriod("compare", value)}
        />
      </div>
      <FilterBar
        filters={filters}
        activeCount={activeFilterCount}
        onChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
        onClear={() => setFilters(defaultAnalyticsFilters)}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {viewModel.metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(390px,1fr)]">
        <VolumeChart data={viewModel.ticketVolume} />
        <SlaPanel statuses={viewModel.slaStatuses} />
      </div>
      <SupportingBlocks viewModel={viewModel} />
      <SecondaryBlocks viewModel={viewModel} />
    </div>
  )
}
