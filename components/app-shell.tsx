"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconBell,
  IconDots,
  IconMessage2,
  IconSearch,
} from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"
import { NavUser } from "@/components/nav-user"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { currentUser } from "@/lib/current-user"
import { getRouteByPathname } from "@/lib/csm-routes"
import { cn } from "@/lib/utils"

type AppShellDisplayMode = "default" | "ticket-detail"

function getShellDisplayMode(pathname: string): AppShellDisplayMode {
  return /^\/tickets\/[^/]+$/.test(pathname) ? "ticket-detail" : "default"
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeRoute = getRouteByPathname(pathname)
  const shellDisplayMode = getShellDisplayMode(pathname)
  const isTicketsListPage = pathname === "/tickets"
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  React.useEffect(() => {
    if (shellDisplayMode === "ticket-detail") {
      setSidebarOpen(false)
    }
  }, [shellDisplayMode])

  const handleSidebarOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setSidebarOpen(shellDisplayMode === "ticket-detail" ? false : nextOpen)
    },
    [shellDisplayMode]
  )

  return (
    <SidebarProvider
      open={shellDisplayMode === "ticket-detail" ? false : sidebarOpen}
      onOpenChange={handleSidebarOpenChange}
      style={
        {
          "--sidebar-width": "320px",
        } as React.CSSProperties
      }
    >
      <AppSidebar displayMode={shellDisplayMode} />
      <SidebarInset className="h-svh overflow-hidden">
        {shellDisplayMode === "default" ? (
          <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-4 bg-background p-4">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumb className="min-w-0">
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <span className="text-muted-foreground">Workspace</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {activeRoute?.title ?? "Dashboard"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex h-9 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-3 sm:flex">
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-9 rounded-full p-0"
                >
                  <IconSearch className="size-4" />
                  <span className="sr-only">Search</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-9 rounded-full p-0"
                >
                  <IconBell className="size-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-9 rounded-full p-0"
                >
                  <IconMessage2 className="size-4" />
                  <span className="sr-only">Chat</span>
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="size-9 rounded-full p-0 sm:hidden"
                      aria-label="Header actions"
                    />
                  }
                >
                  <IconDots className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44 sm:hidden">
                  <DropdownMenuItem>
                    <IconSearch className="size-4" />
                    Search
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconBell className="size-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconMessage2 className="size-4" />
                    Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <FloatingThemeToggle />
              <Separator
                orientation="vertical"
                className="data-vertical:h-5 data-vertical:self-auto"
              />
              <NavUser user={currentUser} />
            </div>
          </header>
        ) : null}
        <main
          className={cn(
            "mx-auto flex min-w-0 w-full flex-1 flex-col overflow-x-hidden",
            shellDisplayMode === "ticket-detail"
              ? "h-svh min-h-0 max-w-none gap-3 overflow-hidden px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 lg:px-8"
              : isTicketsListPage
                ? "max-w-500 min-h-0 gap-4 overflow-hidden p-4 sm:p-6 lg:p-8"
                : "max-w-500 min-h-0 gap-4 overflow-y-auto p-4 sm:p-6 lg:p-8"
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
