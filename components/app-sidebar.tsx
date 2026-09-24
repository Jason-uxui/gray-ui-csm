"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBook,
  IconInbox,
  IconChartHistogram,
  IconLock,
  IconSettingsAutomation,
  IconTicket,
  IconUser,
} from "@tabler/icons-react"

import { CustomerSidebarFilters } from "@/components/customers/customer-sidebar-filters"
import { GrayCsmLogo } from "@/components/gray-csm-logo"
import { InboxSidebarFilters } from "@/components/inbox/inbox-sidebar-filters"
import { TicketSidebarFilters } from "@/components/tickets/ticket-sidebar-filters"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import {
  csmRoutes,
  getRouteByPathname,
  type CsmRoute,
  type CsmRouteIconKey,
} from "@/lib/csm-routes"
import { cn } from "@/lib/utils"

type SidebarItem = Pick<CsmRoute, "title" | "path" | "icon" | "sidebarPreview">

function matchByPathname(pathname: string) {
  return (getRouteByPathname(pathname) ?? csmRoutes[0]) as SidebarItem
}

function renderSidebarIcon(icon: CsmRouteIconKey) {
  if (icon === "inbox") return <IconInbox />
  if (icon === "tickets") return <IconTicket />
  if (icon === "customers") return <IconUser />
  if (icon === "knowledge-base") return <IconBook />
  if (icon === "analytics") return <IconChartHistogram />
  if (icon === "automation") return <IconSettingsAutomation />
  return <IconLock />
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  displayMode?: "default" | "full-detail"
}

export function AppSidebar({
  displayMode = "default",
  style,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()
  const { setOpen, state } = useSidebar()

  const matchedItem = React.useMemo(() => matchByPathname(pathname), [pathname])
  const panelItems = matchedItem.sidebarPreview

  const isTicketsSection = matchedItem.path === "/tickets"
  const isInboxSection = matchedItem.path === "/inbox"
  const isCustomersSection = matchedItem.path === "/customers"
  const isKnowledgeBaseSection = matchedItem.path === "/knowledge-base"
  const isSidebarCollapsed = state === "collapsed"
  const shouldShowSecondaryPanel =
    displayMode !== "full-detail" &&
    !isSidebarCollapsed &&
    !isKnowledgeBaseSection

  return (
    <Sidebar
      collapsible="icon"
      className="z-40 overflow-hidden group-data-[collapsible=icon]:border-sidebar-border *:data-[sidebar=sidebar]:flex-row"
      style={
        {
          "--sidebar-width": isInboxSection ? "360px" : "303px",
          "--sidebar-width-icon": "56px",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <Sidebar
        collapsible="none"
        className={cn(
          "w-(--sidebar-width-icon)! shrink-0 border-r border-sidebar-border px-1 py-3 group-data-[collapsible=icon]:border-r-0",
          isInboxSection && "hidden md:flex"
        )}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="overflow-visible rounded-none md:h-8 md:p-0"
                render={<Link href="/tickets" />}
              >
                <GrayCsmLogo />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Gray CSM</span>
                  <span className="truncate text-xs">Workspace</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="border-b-0 p-2">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {csmRoutes.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.path} />}
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => setOpen(true)}
                      isActive={matchedItem.path === item.path}
                      className="px-2.5 text-muted-foreground md:px-2 data-active:text-sidebar-accent-foreground [&_svg]:text-muted-foreground data-active:[&_svg]:text-sidebar-accent-foreground"
                    >
                      {renderSidebarIcon(item.icon)}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {shouldShowSecondaryPanel ? (
        <div
          aria-hidden={isSidebarCollapsed}
          className={cn(
            "h-full min-w-0 shrink-0 overflow-hidden transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            isInboxSection ? "block" : "hidden md:block",
            "w-[calc(var(--sidebar-width)-var(--sidebar-width-icon))]",
            isSidebarCollapsed
              ? "pointer-events-none -translate-x-3 opacity-0"
              : "translate-x-0 opacity-100"
          )}
        >
          <Sidebar collapsible="none" className="h-full w-full min-w-0">
            {isInboxSection ? (
              <Suspense fallback={null}>
                <InboxSidebarFilters />
              </Suspense>
            ) : isTicketsSection ? (
              <SidebarContent>
                <Suspense fallback={null}>
                  <TicketSidebarFilters />
                </Suspense>
              </SidebarContent>
            ) : isCustomersSection ? (
              <SidebarContent>
                <Suspense fallback={null}>
                  <CustomerSidebarFilters />
                </Suspense>
              </SidebarContent>
            ) : (
              <>
                <SidebarHeader className="gap-3.5 border-b p-4">
                  <div className="flex w-full items-center justify-between">
                    <div className="text-base font-medium text-foreground">
                      {matchedItem.title}
                    </div>
                    <Label className="flex items-center gap-2 text-sm">
                      <span>Unreads</span>
                      <Switch className="shadow-none" />
                    </Label>
                  </div>
                  <SidebarInput placeholder="Type to search..." />
                </SidebarHeader>
                <SidebarContent>
                  <SidebarGroup className="border-b-0 px-0 py-2">
                    <SidebarGroupContent>
                      {panelItems.map((item) => (
                        <button
                          type="button"
                          key={`${item.title}-${item.subject}`}
                          className="flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <div className="flex w-full min-w-0 items-center gap-2">
                            <span className="truncate">{item.title}</span>
                            <span className="ml-auto shrink-0 text-xs">
                              {item.date}
                            </span>
                          </div>
                          <span className="w-full truncate font-medium">
                            {item.subject}
                          </span>
                          <span className="line-clamp-2 w-full text-xs whitespace-break-spaces">
                            {item.teaser}
                          </span>
                        </button>
                      ))}
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
              </>
            )}
          </Sidebar>
        </div>
      ) : null}
    </Sidebar>
  )
}
