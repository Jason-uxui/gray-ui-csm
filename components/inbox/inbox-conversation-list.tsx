"use client"

import { IconSearch } from "@tabler/icons-react"

import { ContactAvatar } from "@/components/inbox/contact-avatar"
import {
  InboxFilterMenu,
  InboxSearchPopover,
} from "@/components/inbox/inbox-list-controls"
import { useInboxWorkspace } from "@/components/inbox/inbox-workspace-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { InboxItem } from "@/lib/inbox/types"
import { cn } from "@/lib/utils"

export function InboxConversationRow({
  item,
  selected,
  onSelect,
}: {
  item: InboxItem
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex h-12 w-full min-w-0 items-center gap-2 rounded-xl px-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
        selected && "bg-sidebar-accent"
      )}
    >
      <ContactAvatar />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm leading-5 font-medium text-sidebar-accent-foreground">
          {item.contact}
        </span>
        <span className="block truncate text-xs leading-4 text-muted-foreground">
          {item.subject || item.latestUpdate}
        </span>
      </span>
      {item.unread ? (
        <span
          className="flex size-4 shrink-0 items-center justify-center"
          aria-label="Unread"
        >
          <span className="size-1.5 rounded-full bg-primary" />
        </span>
      ) : (
        <span className="shrink-0 text-xs text-muted-foreground">
          {item.updatedAt}
        </span>
      )}
    </button>
  )
}

export function InboxConversationList({
  items,
  title,
  selectedId,
  onSelect,
  mobile = false,
}: {
  items: InboxItem[]
  title: string
  selectedId: string | undefined
  onSelect: (id: string) => void
  mobile?: boolean
}) {
  const { query, priority, status, setQuery, setPriority, setStatus } =
    useInboxWorkspace()
  const hasFilters = priority !== "all" || status !== "all"

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "flex shrink-0 items-center gap-2",
          mobile ? "h-16 px-4" : "h-12 pr-4 pl-6"
        )}
      >
        <h2
          className={cn(
            "min-w-0 flex-1 truncate",
            mobile ? "text-lg font-semibold" : "text-sm text-muted-foreground"
          )}
        >
          {title}
        </h2>
        <InboxFilterMenu />
        {!mobile ? (
          <InboxSearchPopover
            items={items}
            viewTitle={title}
            onSelect={onSelect}
          />
        ) : null}
      </div>

      {mobile ? (
        <div className="shrink-0 px-4 py-2">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="h-11 rounded-full border-0 bg-muted pl-9 shadow-none"
            />
          </div>
        </div>
      ) : null}

      <div
        className={cn("min-h-0 flex-1 overflow-y-auto px-4", mobile && "pt-2")}
      >
        {items.length ? (
          items.map((item) => (
            <InboxConversationRow
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onSelect={() => onSelect(item.id)}
            />
          ))
        ) : (
          <div className="px-2 py-8 text-center text-sm text-muted-foreground">
            <p>No matching conversations</p>
            {query || hasFilters ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => {
                  setQuery("")
                  setPriority("all")
                  setStatus("all")
                }}
              >
                Clear search and filters
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
