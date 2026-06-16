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
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ticketSidebarGroups } from "@/lib/tickets/mock-data"
import type { TicketPriority, TicketSidebarGroup } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

const PRIORITY_KEYS: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]
const BADGED_VIEW_KEYS = new Set(["mine", "unassigned", "past-due", "escalated"])

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
    <div className="flex flex-col gap-5 px-3 py-3">
      {ticketSidebarGroups.map((group) => (
        <SidebarGroup key={group.key} className="p-2 pb-3 gap-2">
          <SidebarGroupLabel className="py-2 px-2 text-xs tracking-widest font-mono text-sidebar-foreground/65 uppercase">
            {group.label}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
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
                      className="h-8 rounded-lg px-2"
                    >
                      <TicketFilterIcon
                        groupKey={group.key}
                        itemKey={item.key}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {shouldShowBadge ? (
                      <SidebarMenuBadge
                        className={cn(
                          "top-1.5 rounded-full px-1.5 text-xs font-medium",
                          isActive
                            ? "bg-background text-sidebar-accent-foreground"
                            : "bg-muted-foreground/10 text-sidebar-foreground/80"
                        )}
                      >
                        {item.count}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  )
}
