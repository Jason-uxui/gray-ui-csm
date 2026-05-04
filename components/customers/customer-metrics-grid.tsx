import { Badge } from "@/components/ui/badge"
import { customerPositiveTrendBadgeClassName } from "@/lib/customers/presentation"
import type { CustomerDetailMetric } from "@/lib/customers/detail-view-model"
import { cn } from "@/lib/utils"

type CustomerMetricsGridProps = {
  metrics: CustomerDetailMetric[]
  className?: string
  valueAlign?: "left" | "center"
}

export function CustomerMetricsGrid({
  metrics,
  className,
  valueAlign = "left",
}: CustomerMetricsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-2xl border border-border/80 bg-background sm:grid-cols-4",
        className
      )}
    >
      {metrics.map((metric, index) => (
        <article
          key={metric.key}
          className={cn(
            "px-5 py-4",
            index >= 2 && "border-t border-border/70",
            index % 2 === 1 && "border-l border-border/70",
            index >= 1 && "sm:border-l sm:border-border/70",
            "sm:border-t-0",
            valueAlign === "center" ? "text-center" : "text-left"
          )}
        >
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            {metric.label}
          </p>
          <div
            className={cn(
              "mt-2 flex items-center gap-2 text-[20px] leading-none font-semibold text-foreground",
              valueAlign === "center" && "justify-center"
            )}
          >
            <span>{metric.value}</span>
            {metric.helper ? (
              <Badge
                className={cn(
                  "h-auto border-0 px-1.5 py-0 text-xs",
                  metric.helper.startsWith("+")
                    ? customerPositiveTrendBadgeClassName
                    : metric.helper.startsWith("-")
                    ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                    : "bg-muted text-muted-foreground dark:bg-muted/70"
                )}
              >
                {metric.helper}
              </Badge>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
