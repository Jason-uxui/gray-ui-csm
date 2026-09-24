"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { InboxConversationList } from "@/components/inbox/inbox-conversation-list"
import { ConversationDetail } from "@/components/inbox/inbox-conversation-detail"
import { useInboxWorkspace } from "@/components/inbox/inbox-workspace-context"
import type { InboxItem } from "@/lib/inbox/types"
import { getInboxView } from "@/lib/inbox/views"
import { cn } from "@/lib/utils"

export function InboxPage() {
  const searchParams = useSearchParams()
  const view = getInboxView(searchParams.get("view"))
  const {
    selectedId,
    selectItem,
    mobileDetailOpen,
    setMobileDetailOpen,
    getFilteredItems,
    updateItem,
  } = useInboxWorkspace()
  const [drafts, setDrafts] = React.useState<Record<string, string>>({})
  const [feedback, setFeedback] = React.useState<{
    itemId: string
    message: string
  } | null>(null)

  React.useEffect(() => {
    setMobileDetailOpen(false)
  }, [view, setMobileDetailOpen])

  const items = getFilteredItems(view)
  const selectedItem =
    items.find((item) => item.id === selectedId) ?? items[0] ?? null
  const reply = selectedItem ? (drafts[selectedItem.id] ?? "") : ""

  const updateSelected = (
    updater: (item: InboxItem) => InboxItem,
    message: string | null
  ) => {
    if (!selectedItem) return
    updateItem(selectedItem.id, updater)
    setFeedback(message ? { itemId: selectedItem.id, message } : null)
  }

  const sendReply = () => {
    if (!selectedItem || !reply.trim()) return
    const body = reply.trim()
    updateSelected(
      (item) => ({
        ...item,
        unread: false,
        latestUpdate: body,
        updatedAt: "Just now",
        messages: [
          ...item.messages,
          {
            id: `${item.id}-${Date.now()}`,
            author: "Jason",
            role: "agent",
            sentAt: "Just now",
            isNew: true,
            body,
          },
        ],
      }),
      "Reply sent"
    )
    setDrafts((current) => ({ ...current, [selectedItem.id]: "" }))
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden bg-background md:rounded-none">
      <div
        className={cn(
          "min-h-0 w-full flex-col md:hidden",
          mobileDetailOpen ? "hidden" : "flex"
        )}
      >
        <InboxConversationList
          items={items}
          title="Inbox"
          selectedId={selectedItem?.id}
          mobile
          onSelect={(id) => {
            selectItem(id)
            setMobileDetailOpen(true)
          }}
        />
      </div>
      {selectedItem ? (
        <ConversationDetail
          item={selectedItem}
          reply={reply}
          feedback={
            feedback?.itemId === selectedItem.id ? feedback.message : null
          }
          mobileOpen={mobileDetailOpen}
          onReplyChange={(value) =>
            setDrafts((current) => ({ ...current, [selectedItem.id]: value }))
          }
          onSend={sendReply}
          onAssign={() =>
            updateSelected(
              (item) => ({
                ...item,
                owner: "Jason Duong",
                mine: true,
                status: "open",
              }),
              "Assigned to you"
            )
          }
          onSnooze={() => {
            updateSelected(
              (item) => ({
                ...item,
                status: "snoozed",
                latestUpdate: "Snoozed until tomorrow",
              }),
              null
            )
            setMobileDetailOpen(false)
          }}
          onResolve={() => {
            updateSelected(
              (item) => ({
                ...item,
                status: "resolved",
                latestUpdate: "Resolved just now",
              }),
              null
            )
            setMobileDetailOpen(false)
          }}
          onOpenFullTicket={() =>
            setFeedback({
              itemId: selectedItem.id,
              message:
                "Full ticket view is not linked to this Inbox preview yet.",
            })
          }
          onBack={() => setMobileDetailOpen(false)}
        />
      ) : (
        <div className="hidden flex-1 items-center justify-center text-sm text-muted-foreground md:flex">
          Select a conversation to start working.
        </div>
      )}
    </div>
  )
}
