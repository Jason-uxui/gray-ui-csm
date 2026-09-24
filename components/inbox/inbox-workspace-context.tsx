"use client"

import * as React from "react"

import {
  getInboxViewCounts,
  inboxItems as initialInboxItems,
  isItemInInboxView,
} from "@/lib/inbox/mock-data"
import type { InboxItem, InboxView } from "@/lib/inbox/types"
import type { TicketPriority } from "@/lib/tickets/types"

type InboxWorkspaceContextValue = {
  selectedId: string
  mobileDetailOpen: boolean
  query: string
  priority: TicketPriority | "all"
  status: InboxItem["status"] | "all"
  counts: ReturnType<typeof getInboxViewCounts>
  setQuery: (value: string) => void
  setPriority: (value: TicketPriority | "all") => void
  setStatus: (value: InboxItem["status"] | "all") => void
  selectItem: (id: string) => void
  setMobileDetailOpen: (value: boolean) => void
  getFilteredItems: (view: InboxView) => InboxItem[]
  updateItem: (id: string, updater: (item: InboxItem) => InboxItem) => void
}

const InboxWorkspaceContext =
  React.createContext<InboxWorkspaceContextValue | null>(null)

export function InboxWorkspaceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] = React.useState(initialInboxItems)
  const [selectedId, setSelectedId] = React.useState(
    initialInboxItems[0]?.id ?? ""
  )
  const [mobileDetailOpen, setMobileDetailOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [priority, setPriority] = React.useState<TicketPriority | "all">("all")
  const [status, setStatus] = React.useState<InboxItem["status"] | "all">("all")

  const counts = React.useMemo(() => getInboxViewCounts(items), [items])

  const getFilteredItems = React.useCallback(
    (view: InboxView) => {
      const normalizedQuery = query.trim().toLowerCase()

      return items
        .filter((item) => isItemInInboxView(item, view))
        .filter((item) => priority === "all" || item.priority === priority)
        .filter((item) => status === "all" || item.status === status)
        .filter(
          (item) =>
            !normalizedQuery ||
            [
              item.customer,
              item.contact,
              item.subject,
              item.ticketNumber,
              item.accountName,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)
        )
        .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
    },
    [items, priority, query, status]
  )

  const updateItem = React.useCallback(
    (id: string, updater: (item: InboxItem) => InboxItem) => {
      setItems((current) =>
        current.map((item) => (item.id === id ? updater(item) : item))
      )
    },
    []
  )

  const value = React.useMemo(
    () => ({
      selectedId,
      mobileDetailOpen,
      query,
      priority,
      status,
      counts,
      setQuery,
      setPriority,
      setStatus,
      selectItem: setSelectedId,
      setMobileDetailOpen,
      getFilteredItems,
      updateItem,
    }),
    [
      counts,
      getFilteredItems,
      priority,
      query,
      selectedId,
      mobileDetailOpen,
      status,
      updateItem,
    ]
  )

  return (
    <InboxWorkspaceContext.Provider value={value}>
      {children}
    </InboxWorkspaceContext.Provider>
  )
}

export function useInboxWorkspace() {
  const context = React.useContext(InboxWorkspaceContext)

  if (!context) {
    throw new Error(
      "useInboxWorkspace must be used within InboxWorkspaceProvider"
    )
  }

  return context
}
