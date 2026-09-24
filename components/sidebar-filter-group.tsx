"use client"

import type { ReactNode } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export type SidebarFilterItem = {
  key: string
  label: string
  href: string
  icon: ReactNode
  count?: number
  showBadge?: boolean
}

export function SidebarFilterGroup({
  label,
  items,
  activeKey,
  onNavigate,
}: {
  label: string
  items: SidebarFilterItem[]
  activeKey: string
  onNavigate?: () => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0">
          {items.map((item) => (
            <SidebarMenuItem key={item.key}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={item.key === activeKey}
                onClick={onNavigate}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.showBadge && item.count !== undefined ? (
                  <Badge
                    variant="secondary"
                    className="ml-auto h-5 shrink-0 px-2.5 text-xs font-medium shadow-raised-control"
                  >
                    {item.count}
                  </Badge>
                ) : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
