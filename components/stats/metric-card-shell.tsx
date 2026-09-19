import type { ReactNode } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type MetricCardShellProps = {
  label: string
  icon: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

/** Shared surface for metric values, charts, and insight panels. */
export function MetricCardShell({
  label,
  icon,
  action,
  children,
  className,
  headerClassName,
  contentClassName,
}: MetricCardShellProps) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-xl border-transparent bg-card p-1.5 shadow-raised-control ring-0 dark:ring-0",
        className
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between gap-3 rounded-none px-4 pt-1 pb-2",
          headerClassName
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {icon}
          <span className="truncate">{label}</span>
        </div>
        {action}
      </CardHeader>
      <CardContent
        className={cn(
          "rounded-[calc(var(--radius-2xl)-6px)] border border-border bg-background px-4 py-4",
          contentClassName
        )}
      >
        {children}
      </CardContent>
    </Card>
  )
}
