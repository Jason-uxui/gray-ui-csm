import type { ReactNode } from "react"
import {
  IconAdjustmentsHorizontal,
  IconLayoutKanban,
  IconSearch,
  IconTable,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  type TicketLayoutMode,
  type TicketQueueStatus,
} from "@/lib/tickets/types"

type TicketStatusFilter = "all" | TicketQueueStatus

type TicketSearchToolbarProps = {
  query: string
  onQueryChange: (query: string) => void
  statusFilter: TicketStatusFilter
  onStatusFilterChange: (status: TicketStatusFilter) => void
  layoutMode: TicketLayoutMode
  onLayoutModeChange: (layoutMode: TicketLayoutMode) => void
  tableActions?: ReactNode
}

const statusLabels: Record<TicketStatusFilter, string> = {
  all: "All Statuses",
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
}

const statusItems: TicketStatusFilter[] = [
  "all",
  "open",
  "pending",
  "resolved",
  "closed",
]

export function TicketSearchToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  layoutMode,
  onLayoutModeChange,
  tableActions,
}: TicketSearchToolbarProps) {
  return (
    <section className="flex flex-col gap-3 max-sm:gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search tickets by subject, customer, or ID..."
          className="h-10 rounded-xl border bg-background pl-9 max-sm:h-9 max-sm:text-sm"
        />
      </div>

      <div className="flex w-full items-center gap-2 max-sm:overflow-x-auto max-sm:whitespace-nowrap max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden lg:w-auto lg:justify-end">
        {tableActions ? (
          <div className="flex shrink-0 items-center gap-2">
            {tableActions}
          </div>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-2 max-sm:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl max-sm:h-8 max-sm:px-2.5"
                />
              }
            >
              <IconAdjustmentsHorizontal className="size-4" />
              {statusLabels[statusFilter]}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              {statusItems.map((statusItem) => (
                <DropdownMenuItem
                  key={statusItem}
                  onClick={() => onStatusFilterChange(statusItem)}
                >
                  {statusLabels[statusItem]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 rounded-xl border bg-background p-1 max-sm:gap-0.5 max-sm:p-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "size-7 rounded-lg max-sm:size-[26px]",
                layoutMode === "board" && "bg-muted/70"
              )}
              aria-label="Board view"
              onClick={() => onLayoutModeChange("board")}
            >
              <IconLayoutKanban className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "size-7 rounded-lg max-sm:size-[26px]",
                layoutMode === "table" && "bg-muted/70"
              )}
              aria-label="Table view"
              onClick={() => onLayoutModeChange("table")}
            >
              <IconTable className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
