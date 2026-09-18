import {
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconCheck,
  IconClock,
  IconMinus,
  IconTicket,
} from "@tabler/icons-react"

import { StatCard } from "@/components/stats/stat-card"
import type { TicketStat } from "@/lib/tickets/types"

type TicketStatsProps = {
  stats: TicketStat[]
}

function formatAbsoluteValue(value: number) {
  return `${Math.abs(value)}`
}

function formatAbsolutePercent(value: number) {
  const absValue = Math.abs(value)
  const rounded = Number.isInteger(absValue)
    ? absValue
    : Number(absValue.toFixed(1))
  return `${rounded}%`
}

function StatLeadIcon({ statKey }: { statKey: TicketStat["key"] }) {
  if (statKey === "total") return <IconTicket className="size-3.5" />
  if (statKey === "open") return <IconAlertCircle className="size-3.5" />
  if (statKey === "pending") return <IconClock className="size-3.5" />
  return <IconCheck className="size-3.5" />
}

function StatTrendRow({ stat }: { stat: TicketStat }) {
  const preferredTrendByKey: Record<TicketStat["key"], TicketStat["trend"]> = {
    total: "down",
    open: "down",
    pending: "down",
    resolved: "up",
  }
  const isFlat = stat.trend === "flat"
  const isImproved = preferredTrendByKey[stat.key] === stat.trend

  const trendClassName = isFlat
    ? "text-muted-foreground"
    : isImproved
      ? "text-emerald-600"
      : "text-rose-600"

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${trendClassName}`}>
      {stat.trend === "up" ? (
        <IconArrowUpRight className="size-3.5" />
      ) : stat.trend === "down" ? (
        <IconArrowDownRight className="size-3.5" />
      ) : (
        <IconMinus className="size-3.5" />
      )}
      <span>
        {formatAbsoluteValue(stat.delta)} ({formatAbsolutePercent(stat.deltaPercent)})
      </span>
      <span className="text-muted-foreground">{stat.comparison}</span>
    </div>
  )
}

export function TicketStats({ stats }: TicketStatsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.key}
          icon={<StatLeadIcon statKey={stat.key} />}
          label={stat.label}
          value={stat.value}
          footer={<StatTrendRow stat={stat} />}
          density="ticket"
        />
      ))}
    </section>
  )
}
