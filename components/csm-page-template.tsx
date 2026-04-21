import { IconDots, IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CsmTemplateMetric } from "@/lib/csm-routes"

type CsmPageTemplateProps = {
  title: string
  description: string
  metrics?: CsmTemplateMetric[]
  primaryActionLabel?: string
}

const fallbackMetrics: CsmTemplateMetric[] = [
  { label: "Open Items", value: "24" },
  { label: "Resolved Today", value: "18", tone: "positive" },
  { label: "SLA Health", value: "98.2%", tone: "positive" },
]

export function CsmPageTemplate({
  title,
  description,
  metrics = fallbackMetrics,
  primaryActionLabel = "Create New",
}: CsmPageTemplateProps) {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border bg-card p-4 text-card-foreground"
          >
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                metric.tone === "positive"
                  ? "text-emerald-600"
                  : metric.tone === "warning"
                    ? "text-amber-600"
                    : ""
              }`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border bg-background p-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-9 rounded-xl sm:hidden"
                  aria-label="Page actions"
                />
              }
            >
              <IconDots className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44 sm:hidden">
              <DropdownMenuItem>
                <IconPlus className="size-4" />
                {primaryActionLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Demo data for UI showcase. Replace with real API data in production.
        </p>
        <Button className="mt-4 hidden sm:inline-flex">
          {primaryActionLabel}
        </Button>
      </section>

      <Button
        size="icon"
        className="fixed right-4 z-40 size-12 rounded-full shadow-lg sm:hidden"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
        aria-label="Create new item"
      >
        <IconPlus className="size-5" />
        <span className="sr-only">{primaryActionLabel}</span>
      </Button>
    </>
  )
}
