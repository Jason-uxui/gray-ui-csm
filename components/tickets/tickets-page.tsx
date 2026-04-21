"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  IconArrowsSort,
  IconChevronDown,
  IconDownload,
  IconPlus,
} from "@tabler/icons-react"

import {
  DataGridColumnOptionsMenu,
  type DataGridToolbarRenderProps,
} from "@/components/data-grid"
import { TicketBoard } from "@/components/tickets/ticket-board"
import { TicketSearchToolbar } from "@/components/tickets/ticket-search-toolbar"
import { TicketStats } from "@/components/tickets/ticket-stats"
import {
  TicketTable,
  type TicketColumnId,
  ticketSortLabels,
  ticketSortPresets,
  type TicketSortPreset,
} from "@/components/tickets/ticket-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  filterTicketsByView,
  tickets as initialTickets,
} from "@/lib/tickets/mock-data"
import type {
  TicketAssignee,
  TicketLayoutMode,
  Ticket,
  TicketPriority,
  TicketQueueStatus,
  TicketStat,
  TicketTrend,
  TicketViewKey,
} from "@/lib/tickets/types"

const ALLOWED_VIEWS: TicketViewKey[] = [
  "all",
  "mine",
  "unassigned",
  "past-due",
  "escalated",
]

const ALLOWED_LAYOUTS: TicketLayoutMode[] = ["board", "table"]
const bulkStatusOptions: TicketQueueStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
]
const bulkPriorityOptions: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]
const bulkStatusLabel: Record<TicketQueueStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
}

function getViewFromSearchParam(view: string | null): TicketViewKey {
  if (view && ALLOWED_VIEWS.includes(view as TicketViewKey)) {
    return view as TicketViewKey
  }

  return "all"
}

function getLayoutFromSearchParam(layout: string | null): TicketLayoutMode {
  if (layout && ALLOWED_LAYOUTS.includes(layout as TicketLayoutMode)) {
    return layout as TicketLayoutMode
  }

  return "board"
}

function calculateTrend(
  current: number,
  previous: number
): Pick<TicketStat, "delta" | "deltaPercent" | "trend"> {
  const delta = current - previous
  const deltaPercent =
    previous === 0
      ? current === 0
        ? 0
        : 100
      : Number(((delta / previous) * 100).toFixed(1))
  const trend: TicketTrend = delta > 0 ? "up" : delta < 0 ? "down" : "flat"

  return { delta, deltaPercent, trend }
}

function buildStats(sourceTickets: typeof initialTickets): TicketStat[] {
  const total = sourceTickets.length
  const open = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "open"
  ).length
  const pending = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "pending"
  ).length
  const resolved = sourceTickets.filter(
    (ticket) => ticket.queueStatus === "resolved"
  ).length

  const previousByKey = {
    total: Math.max(total - 3, 0),
    open: Math.max(open + 2, 0),
    pending: Math.max(pending + 1, 0),
    resolved: Math.max(resolved - 2, 0),
  }

  const totalTrend = calculateTrend(total, previousByKey.total)
  const openTrend = calculateTrend(open, previousByKey.open)
  const pendingTrend = calculateTrend(pending, previousByKey.pending)
  const resolvedTrend = calculateTrend(resolved, previousByKey.resolved)

  return [
    {
      key: "total",
      label: "Total Tickets",
      value: total,
      previousValue: previousByKey.total,
      ...totalTrend,
      comparison: "vs last week",
    },
    {
      key: "open",
      label: "Open",
      value: open,
      previousValue: previousByKey.open,
      ...openTrend,
      comparison: "vs last week",
    },
    {
      key: "pending",
      label: "Pending",
      value: pending,
      previousValue: previousByKey.pending,
      ...pendingTrend,
      comparison: "vs last week",
    },
    {
      key: "resolved",
      label: "Resolved",
      value: resolved,
      previousValue: previousByKey.resolved,
      ...resolvedTrend,
      comparison: "vs last week",
    },
  ]
}

function sortTicketsByBoardOrder(sourceTickets: Ticket[]) {
  return [...sourceTickets].sort((leftTicket, rightTicket) => {
    if (leftTicket.boardOrder === rightTicket.boardOrder) {
      return leftTicket.id.localeCompare(rightTicket.id)
    }

    return leftTicket.boardOrder - rightTicket.boardOrder
  })
}

type TicketsPageProps = {
  initialView?: string | null
  initialLayout?: string | null
}

export function TicketsPage({
  initialView = "all",
  initialLayout = "board",
}: TicketsPageProps) {
  const activeView = getViewFromSearchParam(initialView)
  const activeLayout = getLayoutFromSearchParam(initialLayout)
  const router = useRouter()
  const pathname = usePathname()

  const [ticketItems, setTicketItems] = useState(initialTickets)
  const [isStatsExpanded, setIsStatsExpanded] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | TicketQueueStatus>(
    "all"
  )
  const [sortPreset, setSortPreset] = useState<TicketSortPreset>("boardOrder")
  const [tableToolbarProps, setTableToolbarProps] =
    useState<DataGridToolbarRenderProps<TicketColumnId> | null>(null)

  const handleLayoutModeChange = (layoutMode: TicketLayoutMode) => {
    const nextSearchParams = new URLSearchParams()
    nextSearchParams.set("view", activeView)
    nextSearchParams.set("layout", layoutMode)
    router.replace(`${pathname}?${nextSearchParams.toString()}`, {
      scroll: false,
    })
  }

  const visibleByView = useMemo(
    () => filterTicketsByView(ticketItems, activeView),
    [activeView, ticketItems]
  )

  const stats = useMemo(() => buildStats(visibleByView), [visibleByView])

  const filteredTickets = useMemo(() => {
    return visibleByView.filter((ticket) => {
      const matchesStatus =
        statusFilter === "all" ? true : ticket.queueStatus === statusFilter
      const normalizedQuery = query.trim().toLowerCase()
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${ticket.subject} ${ticket.ticketNumber}`
              .toLowerCase()
              .includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [query, statusFilter, visibleByView])

  const visibleAssigneeOptions = useMemo(() => {
    const optionsMap = new Map<string, TicketAssignee>()

    filteredTickets.forEach((ticket) => {
      if (!ticket.assignee) return
      if (optionsMap.has(ticket.assignee.name)) return
      optionsMap.set(ticket.assignee.name, ticket.assignee)
    })

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [filteredTickets])

  const handleVisibleTicketsChange = (nextVisibleTickets: Ticket[]) => {
    const updates = new Map(
      nextVisibleTickets.map((ticket) => [ticket.id, ticket] as const)
    )

    setTicketItems((previousTickets) =>
      previousTickets.map((ticket) => updates.get(ticket.id) ?? ticket)
    )
  }

  const updateSelectedTickets = (updater: (ticket: Ticket) => Ticket) => {
    const selectedRowIds = tableToolbarProps?.selectedRowIds ?? []
    if (selectedRowIds.length === 0) return

    const selectedIds = new Set(selectedRowIds)

    setTicketItems((previousTickets) =>
      previousTickets.map((ticket) =>
        selectedIds.has(ticket.id) ? updater(ticket) : ticket
      )
    )
  }

  const handleMoveTicket = (
    ticketId: string,
    queueStatus: TicketQueueStatus,
    insertBeforeTicketId?: string | null
  ) => {
    setTicketItems((previousTickets) => {
      const movingTicket = previousTickets.find(
        (ticket) => ticket.id === ticketId
      )
      if (!movingTicket) return previousTickets

      const sourceQueueStatus = movingTicket.queueStatus
      const sourceColumnTickets = sortTicketsByBoardOrder(
        previousTickets.filter(
          (ticket) =>
            ticket.queueStatus === sourceQueueStatus && ticket.id !== ticketId
        )
      )
      const targetColumnTickets = sortTicketsByBoardOrder(
        previousTickets.filter(
          (ticket) =>
            ticket.queueStatus === queueStatus && ticket.id !== ticketId
        )
      )
      const nextTargetColumnTickets =
        sourceQueueStatus === queueStatus
          ? [...sourceColumnTickets]
          : [...targetColumnTickets]
      const insertIndex = insertBeforeTicketId
        ? nextTargetColumnTickets.findIndex(
            (ticket) => ticket.id === insertBeforeTicketId
          )
        : nextTargetColumnTickets.length
      const nextMovingTicket = {
        ...movingTicket,
        queueStatus,
      }

      nextTargetColumnTickets.splice(
        insertIndex === -1 ? nextTargetColumnTickets.length : insertIndex,
        0,
        nextMovingTicket
      )

      const nextSourceColumnTickets =
        sourceQueueStatus === queueStatus
          ? nextTargetColumnTickets
          : sourceColumnTickets
      const orderUpdates = new Map<
        string,
        Pick<Ticket, "queueStatus" | "boardOrder">
      >()

      nextSourceColumnTickets.forEach((ticket, index) => {
        orderUpdates.set(ticket.id, {
          queueStatus:
            sourceQueueStatus === queueStatus ? queueStatus : sourceQueueStatus,
          boardOrder: index,
        })
      })

      if (sourceQueueStatus !== queueStatus) {
        nextTargetColumnTickets.forEach((ticket, index) => {
          orderUpdates.set(ticket.id, {
            queueStatus,
            boardOrder: index,
          })
        })
      }

      return previousTickets.map((ticket) => {
        const update = orderUpdates.get(ticket.id)

        if (!update) return ticket

        return {
          ...ticket,
          queueStatus: update.queueStatus,
          boardOrder: update.boardOrder,
        }
      })
    })
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground">
          Tickets
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 rounded-xl">
            <IconDownload className="size-4" />
            Export
          </Button>
          <Button size="sm" className="h-9 rounded-xl">
            <IconPlus className="size-4" />
            New Ticket
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl"
            onClick={() =>
              setIsStatsExpanded((previousValue) => !previousValue)
            }
            aria-expanded={isStatsExpanded}
            aria-controls="ticket-metrics"
          >
            <IconChevronDown
              className={`size-4 transition-transform ${
                isStatsExpanded ? "rotate-180" : ""
              }`}
            />
            <span className="sr-only">Toggle ticket metrics</span>
          </Button>
        </div>
      </section>

      {isStatsExpanded ? (
        <div id="ticket-metrics">
          <TicketStats stats={stats} />
        </div>
      ) : null}

      <TicketSearchToolbar
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        layoutMode={activeLayout}
        onLayoutModeChange={handleLayoutModeChange}
        tableActions={
          activeLayout === "table" ? (
            <>
              {tableToolbarProps && tableToolbarProps.selectedRowCount > 0 ? (
                <>
                  <div className="rounded-xl border bg-muted px-3 py-2 text-sm font-medium text-foreground">
                    {tableToolbarProps.selectedRowCount} selected
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl"
                          aria-label="Bulk change status"
                        />
                      }
                    >
                      Status
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      {bulkStatusOptions.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() =>
                            updateSelectedTickets((ticket) => ({
                              ...ticket,
                              queueStatus: status,
                            }))
                          }
                        >
                          {bulkStatusLabel[status]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl"
                          aria-label="Bulk change priority"
                        />
                      }
                    >
                      Priority
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      {bulkPriorityOptions.map((priority) => (
                        <DropdownMenuItem
                          key={priority}
                          onClick={() =>
                            updateSelectedTickets((ticket) => ({
                              ...ticket,
                              priority,
                            }))
                          }
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl"
                          aria-label="Bulk assign tickets"
                        />
                      }
                    >
                      Assignee
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      <DropdownMenuItem
                        onClick={() =>
                          updateSelectedTickets((ticket) => ({
                            ...ticket,
                            assignee: undefined,
                          }))
                        }
                      >
                        Unassigned
                      </DropdownMenuItem>
                      {visibleAssigneeOptions.map((assignee) => (
                        <DropdownMenuItem
                          key={assignee.name}
                          onClick={() =>
                            updateSelectedTickets((ticket) => ({
                              ...ticket,
                              assignee,
                            }))
                          }
                        >
                          {assignee.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-xl"
                    onClick={() => tableToolbarProps.clearSelection()}
                  >
                    Clear
                  </Button>
                </>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl"
                      aria-label="Open sort menu"
                    />
                  }
                >
                  <IconArrowsSort className="size-4" />
                  {ticketSortLabels[sortPreset]}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  <DropdownMenuRadioGroup
                    value={sortPreset}
                    onValueChange={(value) =>
                      setSortPreset(value as TicketSortPreset)
                    }
                  >
                    {ticketSortPresets.map((preset) => (
                      <DropdownMenuRadioItem key={preset} value={preset}>
                        {ticketSortLabels[preset]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {tableToolbarProps ? (
                <DataGridColumnOptionsMenu
                  {...tableToolbarProps}
                  triggerLabel="Table options"
                />
              ) : null}
            </>
          ) : null
        }
      />

      {activeLayout === "table" ? (
        <TicketTable
          tickets={filteredTickets}
          sortPreset={sortPreset}
          onTicketsChange={handleVisibleTicketsChange}
          onToolbarPropsChange={setTableToolbarProps}
        />
      ) : (
        <TicketBoard
          tickets={filteredTickets}
          onMoveTicket={handleMoveTicket}
        />
      )}
    </div>
  )
}
