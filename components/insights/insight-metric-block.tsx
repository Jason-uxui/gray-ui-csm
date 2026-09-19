import type { ReactNode } from "react"

import { MetricCardShell } from "@/components/stats/metric-card-shell"
import { cn } from "@/lib/utils"

type InsightMetricBlockProps = {
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  icon: ReactNode
  label: string
}

export function InsightMetricBlock({
  action,
  children,
  className,
  contentClassName,
  icon,
  label,
}: InsightMetricBlockProps) {
  return (
    <MetricCardShell
      label={label}
      icon={icon}
      action={action}
      className={className}
      headerClassName="min-h-10 px-2"
      contentClassName={cn("px-5 py-4", contentClassName)}
    >
      {children}
    </MetricCardShell>
  )
}
