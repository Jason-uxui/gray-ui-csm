import type { ReactNode } from "react"

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
