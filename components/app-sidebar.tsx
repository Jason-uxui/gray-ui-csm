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

type SidebarItem = {
  title: string
  url: string
  icon: React.ReactNode
}

type PanelItem = {
  name: string
  email: string
  subject: string
  date: string
  teaser: string
}

const data: {
  navMain: SidebarItem[]
  panelBySection: Record<string, PanelItem[]>
} = {
  navMain: [
    { title: "Inbox", url: "/inbox", icon: <IconInbox /> },
    { title: "Tickets", url: "/tickets", icon: <IconTicket /> },
    { title: "Customer Profiles", url: "/customers", icon: <IconUser /> },
    { title: "Accounts", url: "/accounts", icon: <IconUsersGroup /> },
    { title: "Internal Notes", url: "/internal-notes", icon: <IconNotebook /> },
    { title: "Knowledge Base", url: "/knowledge-base", icon: <IconBook /> },
    { title: "Macros", url: "/macros", icon: <IconMessage2 /> },
    {
      title: "Automation Rules",
      url: "/automation",
      icon: <IconSettingsAutomation />,
    },
    { title: "Settings", url: "/settings", icon: <IconLock /> },
  ],
  panelBySection: {
    Inbox: [
      {
        name: "Unified channels",
        email: "ops@workspace.local",
        subject: "Conversations from all channels",
        date: "Now",
        teaser: "Email, chat, in-app, and form messages flow into one queue.",
      },
      {
        name: "Thread statuses",
        email: "ops@workspace.local",
        subject: "Triage workflow",
        date: "Today",
        teaser:
          "Filter and triage by New, Open, Pending, Resolved, and Closed states.",
      },
    ],
    Tickets: [
      {
        name: "Queue by urgency",
        email: "tickets@workspace.local",
        subject: "Prioritize SLA risk",
        date: "Now",
        teaser:
          "Sort by priority and due state to reduce SLA breaches quickly.",
      },
      {
        name: "Escalation handoff",
        email: "tickets@workspace.local",
        subject: "Cross-team visibility",
        date: "Today",
        teaser:
          "Escalated tickets remain visible for Product and Engineering follow-up.",
      },
    ],
    "Customer Profiles": [
      {
        name: "Customer 360",
        email: "csm@workspace.local",
        subject: "Lifecycle context",
        date: "Today",
        teaser:
          "Profile timeline combines support history, sentiment, and value context.",
      },
    ],
    Accounts: [
      {
        name: "Account-level signals",
        email: "accounts@workspace.local",
        subject: "B2B ownership view",
        date: "Today",
        teaser:
          "Usage, risk, and ownership signals are grouped by account for CSM teams.",
      },
    ],
    "Internal Notes": [
      {
        name: "Private collaboration",
        email: "notes@workspace.local",
        subject: "Internal-only thread",
        date: "Today",
        teaser:
          "Keep agent-to-agent handoff context private and separate from customer chat.",
      },
    ],
    "Knowledge Base": [
      {
        name: "Deflection quality",
        email: "kb@workspace.local",
        subject: "Article performance",
        date: "Today",
        teaser:
          "Track which support articles actually reduce ticket inflow over time.",
      },
    ],
    Macros: [
      {
        name: "Response templates",
        email: "macros@workspace.local",
        subject: "Consistent communication",
        date: "Today",
        teaser:
          "Use one-click macro templates for repetitive requests and policy consistency.",
      },
    ],
    "Automation Rules": [
      {
        name: "Auto assign and tag",
        email: "automation@workspace.local",
        subject: "Workflow routing",
        date: "Today",
        teaser:
          "Route tickets by plan, language, and intent with rule automation.",
      },
    ],
    Settings: [
      {
        name: "SLA configuration",
        email: "settings@workspace.local",
        subject: "Workspace policy",
        date: "Today",
        teaser:
          "Define business hours, response targets, and escalation policies globally.",
      },
    ],
  },
}

function matchByPathname(pathname: string) {
  return (
    data.navMain.find(
      (item) =>
        pathname === item.url ||
        (item.url !== "/" && pathname.startsWith(`${item.url}/`))
    ) ?? data.navMain[0]
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { setOpen } = useSidebar()

  const matchedItem = React.useMemo(() => matchByPathname(pathname), [pathname])
  const [activeItem, setActiveItem] = React.useState(matchedItem)
  const [panelItems, setPanelItems] = React.useState(
    data.panelBySection[matchedItem.title] ?? []
  )

  React.useEffect(() => {
    setActiveItem(matchedItem)
    setPanelItems(data.panelBySection[matchedItem.title] ?? [])
  }, [matchedItem])

  const isTicketsSection = activeItem.title === "Tickets"

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r py-2"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="md:h-8 md:p-0 rounded-none overflow-hidden"
                render={<a href="#" />}
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
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setPanelItems(data.panelBySection[item.title] ?? [])
                        setOpen(true)
                      }}
                      isActive={activeItem.title === item.title}
                      className="px-2.5 text-muted-foreground data-active:text-sidebar-accent-foreground md:px-2 [&_svg]:text-muted-foreground data-active:[&_svg]:text-sidebar-accent-foreground"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden min-w-0 flex-1 md:flex">
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
                  {activeItem.title}
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
                    <a
                      href="#"
                      key={`${item.email}-${item.subject}`}
                      className="flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <div className="flex w-full min-w-0 items-center gap-2">
                        <span className="truncate">{item.name}</span>
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
                    </a>
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </>
        )}
      </Sidebar>
    </Sidebar>
  )
}
