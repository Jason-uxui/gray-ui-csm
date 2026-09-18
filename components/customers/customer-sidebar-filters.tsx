"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  IconAlertCircle,
  IconBuilding,
  IconCircleDot,
  IconClock,
  IconLayoutList,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { customerSidebarGroups } from "@/lib/customers/mock-data"
import type { CustomerSidebarGroup } from "@/lib/customers/types"

const BADGED_VIEW_KEYS = new Set([
  "all",
  "mine",
  "at-risk",
  "renewal",
  "high-touch",
])

function CustomerFilterIcon({
  groupKey,
  itemKey,
}: {
  groupKey: CustomerSidebarGroup["key"]
  itemKey: string
}) {
  if (groupKey === "views") {
    if (itemKey === "all") return <IconUsersGroup className="size-4" />
    if (itemKey === "mine") return <IconUser className="size-4" />
    if (itemKey === "at-risk") return <IconAlertCircle className="size-4" />
    if (itemKey === "renewal") return <IconClock className="size-4" />
  }

  if (groupKey === "segment") {
    return <IconBuilding className="size-4" />
  }

  if (groupKey === "lifecycle") {
    return <IconLayoutList className="size-4" />
  }

  return <IconCircleDot className="size-4" />
}

export function CustomerSidebarFilters() {
  const searchParams = useSearchParams()
  const activeView = searchParams.get("view") ?? "all"

  const buildItemHref = (groupKey: string, itemKey: string) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())

    if (groupKey === "views") {
      nextSearchParams.set("view", itemKey)
    }

    return `/customers?${nextSearchParams.toString()}`
  }

  return (
    <div className="flex flex-col">
      {customerSidebarGroups.map((group) => (
        <div key={group.key}>
          <SidebarGroup>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {group.items.map((item) => {
                  const isActive = group.key === "views" && item.key === activeView
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
                        <CustomerFilterIcon
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
