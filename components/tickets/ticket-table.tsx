"use client"

import {
  forwardRef,
  useEffect,
  useMemo,
  type ComponentPropsWithoutRef,
} from "react"
import {
  IconAlertTriangle,
  IconBrandSlack,
  IconCircleCheck,
  IconClockExclamation,
  IconHash,
  IconLayoutList,
  IconMail,
  IconMessage2,
  IconMessageCircle,
  IconTag,
  IconUser,
} from "@tabler/icons-react"

import {
  DataGrid,
  type DataGridColumn,
  type DataGridToolbarRenderProps,
} from "@/components/data-grid"
import { TicketPriorityIndicator } from "@/components/ticket-priority-indicator"
import { TicketPriorityLabel } from "@/components/ticket-priority-label"
import { TicketStatusBadge } from "@/components/ticket-status-badge"
import { TicketTag } from "@/components/tickets/ticket-tag"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { currentUser } from "@/lib/current-user"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  getTicketInitials,
  ticketChannelLabel as channelLabel,
  ticketHealthLabel as healthLabel,
  ticketStatusLabel as statusLabel,
} from "@/lib/tickets/presentation"
import type {
  Ticket,
  TicketCategoryKey,
  TicketChannel,
  TicketDrawerOrigin,
  TicketHealth,
  TicketPriority,
  TicketQueueStatus,
} from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketTableProps = {
  tickets: Ticket[]
  sortPreset: TicketSortPreset
  compactColumns?: boolean
  onOpenTicket?: (ticketId: string, origin?: TicketDrawerOrigin) => void
  onTicketsChange?: (tickets: Ticket[]) => void
  onToolbarPropsChange?: (
    props: DataGridToolbarRenderProps<TicketColumnId> | null
  ) => void
}

type AssigneeOption = {
  name: string
  avatarUrl?: string
}

export type TicketColumnId =
  | "ticketNumber"
  | "subject"
  | "queueStatus"
  | "priority"
  | "assignee"
  | "category"
  | "channel"
  | "health"

export type TicketSortPreset =
  | "boardOrder"
  | "priorityDesc"
  | "pastDueFirst"
  | "escalatedFirst"

const numberFormatter = new Intl.NumberFormat("en-US")
const UNASSIGNED_VALUE = "__unassigned__"

const categoryLabel: Record<TicketCategoryKey, string> = {
  billing: "Billing",
  technical: "Technical",
  "account-login": "Access",
  subscription: "Subscription",
  other: "Other",
}

const priorityWeight: Record<TicketPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
  todo: 0,
}

const queueStatusOptions: TicketQueueStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
]

const priorityOptions: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]

const categoryOptions: TicketCategoryKey[] = [
  "billing",
  "technical",
  "account-login",
  "subscription",
  "other",
]

const channelOptions: TicketChannel[] = ["email", "chat", "slack"]

const healthOptions: TicketHealth[] = ["on-track", "warning", "breached"]

export const ticketSortLabels: Record<TicketSortPreset, string> = {
  boardOrder: "Board order",
  priorityDesc: "Priority high-low",
  pastDueFirst: "Past due first",
  escalatedFirst: "Escalated first",
}

export const ticketSortPresets: TicketSortPreset[] = [
  "boardOrder",
  "priorityDesc",
  "pastDueFirst",
  "escalatedFirst",
]

const ticketColumns: DataGridColumn<TicketColumnId>[] = [
  {
    id: "ticketNumber",
    label: "ID",
    icon: IconHash,
    defaultWidth: 96,
    minWidth: 88,
  },
  {
    id: "subject",
    label: "Subject",
    icon: IconMessageCircle,
    defaultWidth: 360,
    minWidth: 260,
  },
  {
    id: "queueStatus",
    label: "Status",
    icon: IconCircleCheck,
    defaultWidth: 130,
    minWidth: 116,
  },
  {
    id: "priority",
    label: "Priority",
    icon: IconAlertTriangle,
    defaultWidth: 120,
    minWidth: 110,
  },
  {
    id: "assignee",
    label: "Assignee",
    icon: IconUser,
    defaultWidth: 160,
    minWidth: 140,
  },
  {
    id: "category",
    label: "Category",
    icon: IconTag,
    defaultWidth: 150,
    minWidth: 130,
  },
  {
    id: "channel",
    label: "Channel",
    icon: IconLayoutList,
    defaultWidth: 120,
    minWidth: 108,
  },
  {
    id: "health",
    label: "Health",
    icon: IconClockExclamation,
    defaultWidth: 132,
    minWidth: 120,
  },
]

const mobileColumnIds: TicketColumnId[] = [
  "ticketNumber",
  "subject",
  "queueStatus",
  "priority",
]

function getTicketAvatarUrl(ticket: Ticket) {
  if (ticket.mine) return currentUser.avatar
  return ticket.assignee?.avatarUrl
}

function getAssigneeDisplay(ticket: Ticket) {
  const assigneeName = ticket.assignee?.name ?? "Unassigned"

  if (!ticket.assignee) {
    return (
      <span className="inline-flex min-w-0 items-center gap-2">
        <Avatar
          className="size-6 border bg-muted text-muted-foreground"
          size="sm"
        >
          <AvatarFallback>
            <IconUser className="size-3.5" />
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-muted-foreground">{assigneeName}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar className="size-6 border bg-background" size="sm">
        <AvatarImage src={getTicketAvatarUrl(ticket)} alt={assigneeName} />
        <AvatarFallback>{getTicketInitials(ticket.assignee?.name)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{assigneeName}</span>
    </span>
  )
}

function compareTicketsByBoardOrder(leftTicket: Ticket, rightTicket: Ticket) {
  if (leftTicket.queueStatus !== rightTicket.queueStatus) {
    return leftTicket.queueStatus.localeCompare(rightTicket.queueStatus)
  }

  if (leftTicket.boardOrder !== rightTicket.boardOrder) {
    return leftTicket.boardOrder - rightTicket.boardOrder
  }

  return leftTicket.ticketNumber.localeCompare(rightTicket.ticketNumber)
}

function sortTickets(sourceTickets: Ticket[], preset: TicketSortPreset) {
  return [...sourceTickets].sort((leftTicket, rightTicket) => {
    if (preset === "priorityDesc") {
      const priorityDelta =
        priorityWeight[rightTicket.priority] -
        priorityWeight[leftTicket.priority]

      if (priorityDelta !== 0) return priorityDelta
    }

    if (preset === "pastDueFirst") {
      const pastDueDelta =
        Number(rightTicket.pastDue) - Number(leftTicket.pastDue)

      if (pastDueDelta !== 0) return pastDueDelta
    }

    if (preset === "escalatedFirst") {
      const escalatedDelta =
        Number(rightTicket.escalated) - Number(leftTicket.escalated)

      if (escalatedDelta !== 0) return escalatedDelta
    }

    return compareTicketsByBoardOrder(leftTicket, rightTicket)
  })
}

const CellMenuButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ children, className, type = "button", ...props }, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "flex w-full min-w-0 items-center rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

CellMenuButton.displayName = "CellMenuButton"

function TicketChannelCell({ channel }: { channel: TicketChannel }) {
  const iconClassName = "size-4 text-muted-foreground"

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {channel === "email" ? (
        <IconMail className={iconClassName} />
      ) : channel === "slack" ? (
        <IconBrandSlack className={iconClassName} />
      ) : (
        <IconMessage2 className={iconClassName} />
      )}
      <span>{channelLabel[channel]}</span>
    </span>
  )
}

function renderStaticTicketCell(ticket: Ticket, columnId: TicketColumnId) {
  if (columnId === "ticketNumber") {
    return (
      <span className="font-medium text-muted-foreground">
        {ticket.ticketNumber}
      </span>
    )
  }

  if (columnId === "subject") {
    return (
      <span className="block truncate font-medium text-foreground">
        {ticket.subject}
      </span>
    )
  }

  if (columnId === "queueStatus") {
    return <TicketStatusBadge status={ticket.queueStatus} />
  }

  if (columnId === "priority") {
    return <TicketPriorityLabel priority={ticket.priority} />
  }

  if (columnId === "assignee") {
    return getAssigneeDisplay(ticket)
  }

  if (columnId === "category") {
    return categoryLabel[ticket.category]
  }

  if (columnId === "channel") {
    return <TicketChannelCell channel={ticket.channel} />
  }

  if (columnId === "health") {
    return <TicketTag tone={ticket.health} />
  }

  return null
}

export function TicketTable({
  tickets,
  sortPreset,
  compactColumns = false,
  onOpenTicket,
  onTicketsChange,
  onToolbarPropsChange,
}: TicketTableProps) {
  const isMobile = useIsMobile()
  const useCompactColumns = compactColumns || isMobile
  const sortedTickets = useMemo(
    () => sortTickets(tickets, sortPreset),
    [sortPreset, tickets]
  )
  const visibleColumns = useMemo(() => {
    if (!useCompactColumns) return ticketColumns

    return ticketColumns
      .filter((column) => mobileColumnIds.includes(column.id))
      .map((column) => {
        if (column.id === "ticketNumber") {
          return {
            ...column,
            defaultWidth: 84,
            minWidth: 76,
          }
        }

        if (column.id === "subject") {
          return {
            ...column,
            defaultWidth: 220,
            minWidth: 180,
          }
        }

        if (column.id === "queueStatus") {
          return {
            ...column,
            defaultWidth: 110,
            minWidth: 100,
          }
        }

        if (column.id === "priority") {
          return {
            ...column,
            defaultWidth: 104,
            minWidth: 96,
          }
        }

        return column
      })
  }, [useCompactColumns])

  const assigneeOptions = useMemo(() => {
    const optionsMap = new Map<string, AssigneeOption>()

    sortedTickets.forEach((ticket) => {
      if (!ticket.assignee) return

      const existingOption = optionsMap.get(ticket.assignee.name)
      if (existingOption) return

      optionsMap.set(ticket.assignee.name, {
        name: ticket.assignee.name,
        avatarUrl: getTicketAvatarUrl(ticket),
      })
    })

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [sortedTickets])

  const commitVisibleTickets = (updater: (tickets: Ticket[]) => Ticket[]) => {
    onTicketsChange?.(updater(sortedTickets))
  }

  const updateTicket = (
    ticketId: string,
    updater: (ticket: Ticket) => Ticket
  ) => {
    commitVisibleTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId ? updater(ticket) : ticket
      )
    )
  }

  useEffect(() => {
    return () => {
      onToolbarPropsChange?.(null)
    }
  }, [onToolbarPropsChange])

  return (
    <div className="h-full min-h-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Ticket, TicketColumnId>
        rows={sortedTickets}
        columns={visibleColumns}
        getRowLabel={(ticket) => `${ticket.ticketNumber} ${ticket.subject}`}
        isEditableColumn={(columnId) => columnId === "subject"}
        getCellEditValue={(ticket, columnId) =>
          columnId === "subject" ? ticket.subject : ""
        }
        applyCellEdit={(ticket, columnId, nextValue) => {
          if (columnId !== "subject") return ticket

          const subject = nextValue.trim()
          return {
            ...ticket,
            subject: subject.length > 0 ? subject : ticket.subject,
          }
        }}
        onRowsChange={onTicketsChange}
        onToolbarPropsChange={onToolbarPropsChange}
        stickySummaryFooter
        fillAvailableHeight
        tableContainerClassName="h-full"
        onOpenDrawerCell={(cell) =>
          onOpenTicket?.(
            cell.rowId,
            cell.originRect
              ? {
                  x: cell.originRect.x,
                  y: cell.originRect.y,
                  width: cell.originRect.width,
                  height: cell.originRect.height,
                }
              : undefined
          )
        }
        canOpenDrawer={(columnId) => columnId === "subject"}
        getDrawerCellValue={(ticket, columnId) =>
          renderStaticTicketCell(ticket, columnId)
        }
        renderCell={(ticket, column) => {
          if (column.id === "subject" || column.id === "ticketNumber") {
            return renderStaticTicketCell(ticket, column.id)
          }

          if (column.id === "queueStatus") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <TicketStatusBadge status={ticket.queueStatus} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={ticket.queueStatus}
                      onValueChange={(value) =>
                        updateTicket(ticket.id, (currentTicket) => ({
                          ...currentTicket,
                          queueStatus: value as TicketQueueStatus,
                        }))
                      }
                    >
                      {queueStatusOptions.map((status) => (
                        <DropdownMenuRadioItem key={status} value={status}>
                          {statusLabel[status]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "priority") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <TicketPriorityLabel priority={ticket.priority} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={ticket.priority}
                      onValueChange={(value) =>
                        updateTicket(ticket.id, (currentTicket) => ({
                          ...currentTicket,
                          priority: value as TicketPriority,
                        }))
                      }
                    >
                      {priorityOptions.map((priority) => (
                        <DropdownMenuRadioItem key={priority} value={priority}>
                          <span className="inline-flex items-center gap-2">
                            <TicketPriorityIndicator priority={priority} />
                            <span className="capitalize">{priority}</span>
                          </span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "assignee") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  {getAssigneeDisplay(ticket)}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={ticket.assignee?.name ?? UNASSIGNED_VALUE}
                      onValueChange={(value) =>
                        updateTicket(ticket.id, (currentTicket) => ({
                          ...currentTicket,
                          assignee:
                            value === UNASSIGNED_VALUE
                              ? undefined
                              : assigneeOptions.find(
                                  (assigneeOption) =>
                                    assigneeOption.name === value
                                ),
                        }))
                      }
                    >
                      <DropdownMenuRadioItem value={UNASSIGNED_VALUE}>
                        Unassigned
                      </DropdownMenuRadioItem>
                      {assigneeOptions.map((assigneeOption) => (
                        <DropdownMenuRadioItem
                          key={assigneeOption.name}
                          value={assigneeOption.name}
                        >
                          {assigneeOption.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "category") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <span>{categoryLabel[ticket.category]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={ticket.category}
                      onValueChange={(value) =>
                        updateTicket(ticket.id, (currentTicket) => ({
                          ...currentTicket,
                          category: value as TicketCategoryKey,
                        }))
                      }
                    >
                      {categoryOptions.map((category) => (
                        <DropdownMenuRadioItem key={category} value={category}>
                          {categoryLabel[category]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "channel") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <TicketChannelCell channel={ticket.channel} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={ticket.channel}
                      onValueChange={(value) =>
                        updateTicket(ticket.id, (currentTicket) => ({
                          ...currentTicket,
                          channel: value as TicketChannel,
                        }))
                      }
                    >
                      {channelOptions.map((channel) => (
                        <DropdownMenuRadioItem key={channel} value={channel}>
                          <TicketChannelCell channel={channel} />
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "health") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <TicketTag tone={ticket.health} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={ticket.health}
                      onValueChange={(value) =>
                        updateTicket(ticket.id, (currentTicket) => ({
                          ...currentTicket,
                          health: value as TicketHealth,
                        }))
                      }
                    >
                      {healthOptions.map((health) => (
                        <DropdownMenuRadioItem key={health} value={health}>
                          {healthLabel[health]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          return renderStaticTicketCell(ticket, column.id)
        }}
        renderSummary={(column, visibleRows) => {
          if (column.id === "ticketNumber") {
            return `${numberFormatter.format(visibleRows.length)} tickets`
          }

          if (column.id === "queueStatus") {
            const openCount = visibleRows.filter(
              (ticket) => ticket.queueStatus === "open"
            ).length
            return `${openCount} open`
          }

          if (column.id === "priority") {
            const urgentCount = visibleRows.filter(
              (ticket) => ticket.priority === "urgent"
            ).length
            return urgentCount > 0 ? `${urgentCount} urgent` : null
          }

          if (column.id === "assignee") {
            const unassignedCount = visibleRows.filter(
              (ticket) => !ticket.assignee
            ).length
            return unassignedCount > 0 ? `${unassignedCount} unassigned` : null
          }

          if (column.id === "health") {
            const breachedCount = visibleRows.filter(
              (ticket) => ticket.health === "breached"
            ).length
            return breachedCount > 0 ? `${breachedCount} breached` : null
          }

          return null
        }}
      />
    </div>
  )
}
