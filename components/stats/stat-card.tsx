import type { ReactNode } from "react"

import { MetricCardShell } from "@/components/stats/metric-card-shell"
import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  icon: ReactNode
  value: ReactNode
  valueClassName?: string
  footer: ReactNode
  density?: "default" | "compact" | "ticket"
  visual?: ReactNode
}

export function StatCard({
  label,
  icon,
  value,
  valueClassName,
  footer,
  density = "default",
  visual,
}: StatCardProps) {
  return (
    <MetricCardShell
      label={label}
      icon={icon}
      className={cn(
        density === "compact"
          ? "p-1"
          : density === "ticket"
            ? "h-full p-1"
            : "p-1.5"
      )}
      headerClassName={cn(
        density === "ticket" ? "px-3 pb-2" : "px-4",
        density === "compact" ? "pb-1.5" : "pb-2"
      )}
      contentClassName={cn(
        density === "compact"
          ? "space-y-1.5 px-3 py-2.5"
          : density === "ticket"
            ? "flex min-h-0 flex-1 flex-col justify-between space-y-3 p-3"
            : "space-y-3 px-4 py-4"
      )}
    >
      <div className="flex min-w-0 items-end justify-between gap-3">
        <p
          className={cn(
            density === "compact"
              ? "text-lg leading-6 font-medium text-foreground"
              : "text-3xl leading-8 font-medium text-foreground",
            valueClassName
          )}
        >
          {value}
        </p>
        {visual ? <div className="shrink-0">{visual}</div> : null}
      </div>
      {footer}
    </MetricCardShell>
  )
}
