"use client"

import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
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
        <div key={group.key}>
          <SidebarGroup>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {group.items.map((item) => {
                  const isActive =
                    group.key === "views" && item.key === activeView
                  const shouldShowBadge =
                    group.key === "views" && BADGED_VIEW_KEYS.has(item.key)

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        render={
                          <Link href={buildItemHref(group.key, item.key)} />
                        }
                        isActive={isActive}
                      >
                        <TicketFilterIcon
                          groupKey={group.key}
                          itemKey={item.key}
                        />
                        <span>{item.label}</span>
                        {shouldShowBadge ? (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 shrink-0 px-2.5 text-xs font-medium shadow-raised-control"
                          >
                            {item.count}
                          </Badge>
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      ))}
    </div>
  )
}
