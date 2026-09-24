"use client"

import { useSearchParams } from "next/navigation"
import {
  IconAlertCircle,
  IconCircleDot,
  IconClock,
  IconFolder,
  IconTicket,
  IconUser,
  IconUserQuestion,
} from "@tabler/icons-react"

import { TicketPriorityIndicator } from "@/components/ticket-priority-indicator"
import { SidebarFilterGroup } from "@/components/sidebar-filter-group"
import { ticketSidebarGroups } from "@/lib/tickets/mock-data"
import type { TicketPriority, TicketSidebarGroup } from "@/lib/tickets/types"

const PRIORITY_KEYS: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]
const BADGED_VIEW_KEYS = new Set([
  "all",
  "mine",
  "unassigned",
  "past-due",
  "escalated",
])

function TicketFilterIcon({
  groupKey,
  itemKey,
}: {
  groupKey: TicketSidebarGroup["key"]
  itemKey: string
}) {
  if (groupKey === "views") {
    if (itemKey === "all") return <IconTicket className="size-4" />
    if (itemKey === "mine") return <IconUser className="size-4" />
    if (itemKey === "unassigned") return <IconUserQuestion className="size-4" />
    if (itemKey === "past-due") return <IconClock className="size-4" />
    if (itemKey === "escalated") return <IconAlertCircle className="size-4" />
  }

  if (groupKey === "categories") {
    return <IconFolder className="size-4" />
  }

  if (groupKey === "priority") {
    if (PRIORITY_KEYS.includes(itemKey as TicketPriority)) {
      return (
        <TicketPriorityIndicator
          priority={itemKey as TicketPriority}
          className="size-4"
        />
      )
    }
  }

  return <IconCircleDot className="size-4" />
}

export function TicketSidebarFilters() {
  const searchParams = useSearchParams()
  const activeView = searchParams.get("view") ?? "all"
  const activeLayout = searchParams.get("layout") ?? "board"

  const buildItemHref = (groupKey: string, itemKey: string) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())

    nextSearchParams.set("layout", activeLayout)

    if (groupKey === "views") {
      nextSearchParams.set("view", itemKey)
    }

    return `/tickets?${nextSearchParams.toString()}`
  }

  return (
    <div className="flex flex-col">
      {ticketSidebarGroups.map((group) => (
        <SidebarFilterGroup
          key={group.key}
          label={group.label}
          activeKey={group.key === "views" ? activeView : ""}
          items={group.items.map((item) => ({
            key: item.key,
            label: item.label,
            href: buildItemHref(group.key, item.key),
            icon: <TicketFilterIcon groupKey={group.key} itemKey={item.key} />,
            count: item.count,
            showBadge: group.key === "views" && BADGED_VIEW_KEYS.has(item.key),
          }))}
        />
      ))}
    </div>
  )
}
