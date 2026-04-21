"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBook,
  IconCommand,
  IconInbox,
  IconLock,
  IconMessage2,
  IconNotebook,
  IconSettingsAutomation,
  IconTicket,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react"

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

type SidebarItem = Pick<
  CsmRoute,
  "title" | "path" | "icon" | "sidebarPreview"
>

function matchByPathname(pathname: string) {
  return (getRouteByPathname(pathname) ?? csmRoutes[0]) as SidebarItem
}

function renderSidebarIcon(icon: CsmRouteIconKey) {
  if (icon === "inbox") return <IconInbox />
  if (icon === "tickets") return <IconTicket />
  if (icon === "customers") return <IconUser />
  if (icon === "accounts") return <IconUsersGroup />
  if (icon === "internal-notes") return <IconNotebook />
  if (icon === "knowledge-base") return <IconBook />
  if (icon === "macros") return <IconMessage2 />
  if (icon === "automation") return <IconSettingsAutomation />
  return <IconLock />
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  displayMode?: "default" | "ticket-detail"
}

export function AppSidebar({
  displayMode = "default",
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()
  const { setOpen, state } = useSidebar()

  const matchedItem = React.useMemo(() => matchByPathname(pathname), [pathname])
  const panelItems = matchedItem.sidebarPreview

  const isTicketsSection = matchedItem.path === "/tickets"
  const isSidebarCollapsed = state === "collapsed"
  const shouldShowSecondaryPanel =
    displayMode !== "ticket-detail" && !isSidebarCollapsed

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! shrink-0 border-r py-2"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="overflow-hidden rounded-none md:h-8 md:p-0"
                render={<Link href="/tickets" />}
              >
                <div
                  className="flex aspect-square size-8 items-center justify-center text-primary-foreground"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    background: "var(--primary)",
                    boxShadow:
                      "0 0 0 0.667px rgba(0, 0, 0, 0.20) inset, 0 2px 2px 0 rgba(255, 255, 255, 0.10) inset, 0 2px 2.667px -0.667px rgba(42, 42, 42, 0.1), 0 0.667px 0.667px 0 rgba(42, 42, 42, 0.08)",
                  }}
                >
                  <IconCommand className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Gray CSM</span>
                  <span className="truncate text-xs">Workspace</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
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
            "hidden h-full min-w-0 shrink-0 overflow-hidden transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:block",
            "w-[calc(var(--sidebar-width)-var(--sidebar-width-icon)-1px)]",
            isSidebarCollapsed
              ? "pointer-events-none -translate-x-3 opacity-0"
              : "translate-x-0 opacity-100"
          )}
        >
          <Sidebar collapsible="none" className="h-full w-full min-w-0">
            {isTicketsSection ? (
              <SidebarContent>
                <Suspense fallback={null}>
                  <TicketSidebarFilters />
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
                  <SidebarGroup className="px-0">
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
