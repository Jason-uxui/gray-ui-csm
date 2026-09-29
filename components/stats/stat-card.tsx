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
  mobileCompact?: boolean
}

export function StatCard({
  label,
  icon,
  value,
  valueClassName,
  footer,
  density = "default",
  visual,
  mobileCompact = false,
}: StatCardProps) {
  return (
    <MetricCardShell
      label={label}
      icon={icon}
      labelClassName={
        mobileCompact
          ? "whitespace-normal tracking-normal sm:truncate sm:tracking-wide"
          : undefined
      }
      className={cn(
        density === "compact"
          ? "p-1"
          : density === "ticket"
            ? "h-full p-1"
            : "p-1.5",
        mobileCompact && "shadow-none sm:shadow-raised-control"
      )}
      headerClassName={cn(
        density === "ticket" ? "px-3 pb-2" : "px-4",
        density === "compact" ? "pb-1.5" : "pb-2",
        mobileCompact && "min-h-8 px-2 py-1 sm:min-h-0 sm:px-4 sm:pt-1 sm:pb-2"
      )}
      contentClassName={cn(
        density === "compact"
          ? "space-y-1.5 px-3 py-2.5"
          : density === "ticket"
            ? "flex min-h-0 flex-1 flex-col justify-between space-y-3 p-3"
            : "space-y-3 px-4 py-4",
        mobileCompact && "space-y-2 p-3 sm:space-y-3 sm:px-4 sm:py-4"
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
        {visual ? (
          <div className={cn("shrink-0", mobileCompact && "hidden sm:block")}>
            {visual}
          </div>
        ) : null}
      </div>
      {footer}
    </MetricCardShell>
  )
}
