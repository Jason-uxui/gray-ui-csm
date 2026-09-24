"use client"

import { useSearchParams } from "next/navigation"
import {
  IconClock,
  IconInbox,
  IconUser,
  IconUserQuestion,
} from "@tabler/icons-react"

import { InboxConversationList } from "@/components/inbox/inbox-conversation-list"
import { useInboxWorkspace } from "@/components/inbox/inbox-workspace-context"
import { SidebarFilterGroup } from "@/components/sidebar-filter-group"
import { SidebarContent, useSidebar } from "@/components/ui/sidebar"
import type { InboxView } from "@/lib/inbox/types"
import { getInboxView, inboxViewLabels, inboxViews } from "@/lib/inbox/views"

function viewIcon(view: InboxView) {
  if (view === "mine") return <IconUser className="size-4" />
  if (view === "unassigned") return <IconUserQuestion className="size-4" />
  if (view === "snoozed") return <IconClock className="size-4" />
  return <IconInbox className="size-4" />
}

export function InboxSidebarFilters() {
  const searchParams = useSearchParams()
  const { setOpenMobile } = useSidebar()
  const activeView = getInboxView(searchParams.get("view"))
  const {
    counts,
    selectedId,
    selectItem,
    setMobileDetailOpen,
    getFilteredItems,
  } = useInboxWorkspace()
  const items = getFilteredItems(activeView)
  const activeItemId = items.some((item) => item.id === selectedId)
    ? selectedId
    : items[0]?.id

  return (
    <SidebarContent className="min-h-0 gap-0">
      <SidebarFilterGroup
        label="Views"
        activeKey={activeView}
        onNavigate={() => {
          setMobileDetailOpen(false)
          setOpenMobile(false)
        }}
        items={inboxViews.map((view) => ({
          key: view,
          label: inboxViewLabels[view],
          href: `/inbox?view=${view}`,
          icon: viewIcon(view),
          count: counts[view],
          showBadge: true,
        }))}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <InboxConversationList
          items={items}
          title={inboxViewLabels[activeView]}
          selectedId={activeItemId}
          onSelect={(id) => {
            selectItem(id)
            setMobileDetailOpen(true)
            setOpenMobile(false)
          }}
        />
      </div>
    </SidebarContent>
  )
}
