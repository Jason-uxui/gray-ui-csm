import {
  IconArrowsSort,
  IconChevronDown,
  IconDots,
  IconDownload,
  IconFileSpreadsheet,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react"

import {
  DataGridColumnOptionsMenu,
  type DataGridToolbarRenderProps,
} from "@/components/data-grid"
import {
  bulkPriorityOptions,
  bulkStatusLabel,
  bulkStatusOptions,
} from "@/components/tickets/tickets-page-helpers"
import {
  bulkChannelLabel,
  bulkChannelOptions,
  bulkHealthLabel,
  bulkHealthOptions,
  formatSelectedTicketsLabel,
  ticketsPageSectionsCopy,
} from "@/components/tickets/tickets-page-sections.copy"
import {
  type TicketColumnId,
  ticketSortLabels,
  ticketSortPresets,
  type TicketSortPreset,
} from "@/components/tickets/ticket-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type {
  TicketAssignee,
  TicketChannel,
  TicketHealth,
  TicketPriority,
  TicketQueueStatus,
} from "@/lib/tickets/types"

type TicketsPageHeaderProps = {
  isStatsExpanded: boolean
  onToggleStats: () => void
  onCreateTicket: (event?: MouseEvent<HTMLButtonElement>) => void
}

export function TicketsPageHeader({
  isStatsExpanded,
  onToggleStats,
  onCreateTicket,
}: TicketsPageHeaderProps) {
  return (
    <section className="flex items-center justify-between gap-2 max-sm:py-1">
      <h1 className="min-w-0 text-xl leading-tight font-semibold tracking-tight text-foreground max-sm:text-lg max-sm:leading-6 sm:text-3xl">
        {ticketsPageSectionsCopy.pageTitle}
      </h1>

      <div className="flex shrink-0 items-center gap-2 max-sm:gap-1.5">
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="outline" size="sm" className="h-9 rounded-xl">
            <IconDownload className="size-4" />
            {ticketsPageSectionsCopy.export}
          </Button>
          <Button size="sm" className="h-9 rounded-xl" onClick={onCreateTicket}>
            <IconPlus className="size-4" />
            {ticketsPageSectionsCopy.newTicket}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl"
            onClick={onToggleStats}
            aria-expanded={isStatsExpanded}
            aria-controls="ticket-metrics"
          >
            <IconChevronDown
              className={`size-4 transition-transform ${
                isStatsExpanded ? "rotate-180" : ""
              }`}
            />
            <span className="sr-only">
              {ticketsPageSectionsCopy.toggleTicketMetrics}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <Button
            variant="outline"
            size="icon-sm"
            className="size-9 rounded-xl max-sm:size-8"
            aria-label={ticketsPageSectionsCopy.exportTicketsAriaLabel}
          >
            <IconDownload className="size-4" />
            <span className="sr-only">{ticketsPageSectionsCopy.export}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl max-sm:size-8"
            onClick={onToggleStats}
            aria-expanded={isStatsExpanded}
            aria-controls="ticket-metrics"
            aria-label={ticketsPageSectionsCopy.toggleTicketMetrics}
          >
            <IconChevronDown
              className={`size-4 transition-transform ${
                isStatsExpanded ? "rotate-180" : ""
              }`}
            />
            <span className="sr-only">
              {ticketsPageSectionsCopy.toggleTicketMetrics}
            </span>
          </Button>
        </div>
      </div>
    </section>
  )
}

type TicketsTableActionsProps = {
  tableToolbarProps: DataGridToolbarRenderProps<TicketColumnId> | null
  sortPreset: TicketSortPreset
  onSortPresetChange: (nextPreset: TicketSortPreset) => void
}

export function TicketsTableActions({
  tableToolbarProps,
  sortPreset,
  onSortPresetChange,
}: TicketsTableActionsProps) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl"
              aria-label={ticketsPageSectionsCopy.openSortMenuAriaLabel}
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
              onSortPresetChange(value as TicketSortPreset)
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
          triggerLabel={ticketsPageSectionsCopy.tableOptionsTriggerLabel}
        />
      ) : null}
    </>
  )
}

type TicketsSelectionActionBarProps = {
  tableToolbarProps: DataGridToolbarRenderProps<TicketColumnId> | null
  visibleAssigneeOptions: TicketAssignee[]
  onBulkStatusChange: (status: TicketQueueStatus) => void
  onBulkPriorityChange: (priority: TicketPriority) => void
  onBulkAssigneeChange: (assignee?: TicketAssignee) => void
  onBulkHealthChange: (health: TicketHealth) => void
  onBulkChannelChange: (channel: TicketChannel) => void
  onBulkEscalatedChange: (escalated: boolean) => void
  onBulkPastDueChange: (pastDue: boolean) => void
  onExportSelection: () => void
  onDeleteSelection: () => void
  overlayStyle?: CSSProperties
}

function formatPriorityLabel(priority: TicketPriority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

export function TicketsSelectionActionBar({
  tableToolbarProps,
  visibleAssigneeOptions,
  onBulkStatusChange,
  onBulkPriorityChange,
  onBulkAssigneeChange,
  onBulkHealthChange,
  onBulkChannelChange,
  onBulkEscalatedChange,
  onBulkPastDueChange,
  onExportSelection,
  onDeleteSelection,
  overlayStyle,
}: TicketsSelectionActionBarProps) {
  const selectedRowCount = tableToolbarProps?.selectedRowCount ?? 0
  const [shouldRender, setShouldRender] = useState(selectedRowCount > 0)
  const [isVisible, setIsVisible] = useState(selectedRowCount > 0)
  const exitTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current)
      exitTimeoutRef.current = null
    }

    if (selectedRowCount > 0) {
      const frameId = window.requestAnimationFrame(() => {
        setShouldRender(true)
        setIsVisible(true)
      })

      return () => window.cancelAnimationFrame(frameId)
    }

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false)
      exitTimeoutRef.current = window.setTimeout(() => {
        setShouldRender(false)
        exitTimeoutRef.current = null
      }, 220)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current)
        exitTimeoutRef.current = null
      }
    }
  }, [selectedRowCount])

  if (!shouldRender || !tableToolbarProps) return null

  const showSelectAllVisibleAction =
    selectedRowCount > 0 &&
    selectedRowCount < tableToolbarProps.visibleRowCount &&
    !tableToolbarProps.allVisibleRowsSelected

  const barActionButtonClass =
    "h-8 rounded-lg px-2.5 text-[13px] text-inherit hover:bg-white/10 hover:text-inherit dark:hover:bg-black/8 dark:hover:text-inherit"
  const barIconButtonClass =
    "size-8 rounded-lg text-inherit hover:bg-white/10 hover:text-inherit dark:hover:bg-black/8 dark:hover:text-inherit"

  return (
    <div
      className="pointer-events-none fixed z-40 flex justify-center px-1 sm:px-2"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        left: 0,
        width: "100%",
        ...overlayStyle,
      }}
    >
      <div
        className={cn(
          "pointer-events-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-zinc-800/90 bg-zinc-950 px-1.5 py-1.5 text-zinc-100 shadow-xl ring-1 ring-black/20 transform-gpu will-change-[transform,opacity] dark:border-zinc-300/80 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-white/25",
          "transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0"
        )}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className={barIconButtonClass}
          onClick={() => tableToolbarProps.clearSelection()}
          aria-label={ticketsPageSectionsCopy.clearSelectionAriaLabel}
        >
          <IconX className="size-4" />
        </Button>

        <div className="flex h-8 shrink-0 items-center gap-1.5 border-r border-white/10 pr-2 dark:border-black/10">
          <span className="text-xs font-medium sm:text-sm" aria-live="polite">
            {formatSelectedTicketsLabel(selectedRowCount)}
          </span>
          {showSelectAllVisibleAction ? (
            <>
              <span className="text-zinc-500 dark:text-zinc-500">•</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-md px-2 text-xs font-medium text-inherit underline-offset-4 hover:bg-white/10 hover:text-inherit hover:underline dark:hover:bg-black/8 dark:hover:text-inherit"
                onClick={() => tableToolbarProps.onToggleAllRows(true)}
              >
                {ticketsPageSectionsCopy.selectAllVisible(
                  tableToolbarProps.visibleRowCount
                )}
              </Button>
            </>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className={barActionButtonClass}
                aria-label={ticketsPageSectionsCopy.changeStatus}
              />
            }
          >
            {ticketsPageSectionsCopy.changeStatus}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="min-w-40">
            <DropdownMenuRadioGroup value="" onValueChange={(value) => onBulkStatusChange(value as TicketQueueStatus)}>
              {bulkStatusOptions.map((status) => (
                <DropdownMenuRadioItem key={status} value={status}>
                  {bulkStatusLabel[status]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className={barActionButtonClass}
                aria-label={ticketsPageSectionsCopy.assign}
              />
            }
          >
            {ticketsPageSectionsCopy.assign}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="min-w-48">
            <DropdownMenuItem onClick={() => onBulkAssigneeChange(undefined)}>
              {ticketsPageSectionsCopy.unassigned}
            </DropdownMenuItem>
            {visibleAssigneeOptions.map((assignee) => (
              <DropdownMenuItem
                key={`assignee-${assignee.name}`}
                onClick={() => onBulkAssigneeChange(assignee)}
              >
                {assignee.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className={barActionButtonClass}
                aria-label={ticketsPageSectionsCopy.priority}
              />
            }
          >
            {ticketsPageSectionsCopy.priority}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="min-w-44">
            <DropdownMenuRadioGroup value="" onValueChange={(value) => onBulkPriorityChange(value as TicketPriority)}>
              {bulkPriorityOptions.map((priority) => (
                <DropdownMenuRadioItem key={priority} value={priority}>
                  {formatPriorityLabel(priority)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px shrink-0 bg-white/10 dark:bg-black/10" />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className={barIconButtonClass}
                aria-label={ticketsPageSectionsCopy.moreBulkActionsAriaLabel}
              />
            }
          >
            <IconDots className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="min-w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{ticketsPageSectionsCopy.health}</DropdownMenuLabel>
              <DropdownMenuRadioGroup value="" onValueChange={(value) => onBulkHealthChange(value as TicketHealth)}>
                {bulkHealthOptions.map((health) => (
                  <DropdownMenuRadioItem key={health} value={health}>
                    {bulkHealthLabel[health]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{ticketsPageSectionsCopy.channel}</DropdownMenuLabel>
              <DropdownMenuRadioGroup value="" onValueChange={(value) => onBulkChannelChange(value as TicketChannel)}>
                {bulkChannelOptions.map((channel) => (
                  <DropdownMenuRadioItem key={channel} value={channel}>
                    {bulkChannelLabel[channel]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{ticketsPageSectionsCopy.escalated}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value=""
                onValueChange={(value) => {
                  onBulkEscalatedChange(value === "yes")
                }}
              >
                <DropdownMenuRadioItem value="yes">
                  {ticketsPageSectionsCopy.setEscalated}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="no">
                  {ticketsPageSectionsCopy.setNotEscalated}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{ticketsPageSectionsCopy.pastDue}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value=""
                onValueChange={(value) => {
                  onBulkPastDueChange(value === "yes")
                }}
              >
                <DropdownMenuRadioItem value="yes">
                  {ticketsPageSectionsCopy.markPastDue}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="no">
                  {ticketsPageSectionsCopy.markOnTime}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 rounded-lg px-2.5 text-[13px] text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 dark:text-emerald-700 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-800"
          onClick={onExportSelection}
          aria-label={ticketsPageSectionsCopy.exportSelectionAriaLabel}
        >
          <span className="inline-flex size-[18px] items-center justify-center rounded-[5px] bg-emerald-500/20 text-emerald-300 dark:bg-emerald-500/25 dark:text-emerald-700">
            <IconFileSpreadsheet className="size-3.5" />
          </span>
          {ticketsPageSectionsCopy.exportCsv}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 rounded-lg px-2.5 text-[13px] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 dark:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-700"
          onClick={onDeleteSelection}
          aria-label={ticketsPageSectionsCopy.deleteSelectionAriaLabel}
        >
          <IconTrash className="size-4" />
          {ticketsPageSectionsCopy.delete}
        </Button>
      </div>
    </div>
  )
}
