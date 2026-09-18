import type { ReactNode } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  icon: ReactNode
  value: ReactNode
  valueClassName?: string
  footer: ReactNode
  density?: "default" | "compact" | "ticket"
}

export function StatCard({
  label,
  icon,
  value,
  valueClassName,
  footer,
  density = "default",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-[14px] border-transparent bg-card shadow-raised-control ring-0",
        density === "compact" ? "p-1" : density === "ticket" ? "h-full p-1" : "p-1.5"
      )}
    >
      <CardHeader
        className={cn(
          "!rounded-none pt-1",
          density === "ticket" ? "!px-3 pb-2" : "!px-4",
          density === "compact" ? "pb-1.5" : "pb-2"
        )}
      >
        <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {icon}
          {label}
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          "rounded-[calc(var(--radius-2xl)-6px)] border border-border bg-background",
          density === "compact"
            ? "space-y-1.5 px-3 py-2.5"
            : density === "ticket"
              ? "flex min-h-0 flex-1 flex-col justify-between space-y-3 p-3"
            : "space-y-3 px-4 py-4"
        )}
      >
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
        {footer}
      </CardContent>
    </Card>
  )
}
