"use client"

import * as React from "react"
import Image from "next/image"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { IconSearch } from "@tabler/icons-react"

import { ContactAvatar } from "@/components/inbox/contact-avatar"
import { useInboxWorkspace } from "@/components/inbox/inbox-workspace-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { inboxStatusLabel } from "@/lib/inbox/mock-data"
import type { InboxItem } from "@/lib/inbox/types"
import type { TicketPriority } from "@/lib/tickets/types"

const priorities: TicketPriority[] = ["urgent", "high", "medium", "low"]

export function InboxFilterMenu() {
  const { priority, status, setPriority, setStatus } = useInboxWorkspace()
  const hasFilters = priority !== "all" || status !== "all"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative size-10 shrink-0"
            aria-label="Filter conversations"
          />
        }
      >
        <Image
          src="/icons/inbox-list-filter.svg"
          alt=""
          width={16}
          height={16}
        />
        {hasFilters ? (
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        theme="auto"
        className="w-52 border border-border bg-background/95"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Filter conversations</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            theme="auto"
            className="border border-border bg-background/95"
          >
            <DropdownMenuRadioGroup
              value={priority}
              onValueChange={(value) =>
                setPriority(value as TicketPriority | "all")
              }
            >
              <DropdownMenuRadioItem value="all">
                All priorities
              </DropdownMenuRadioItem>
              {priorities.map((value) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {value[0].toUpperCase() + value.slice(1)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            theme="auto"
            className="border border-border bg-background/95"
          >
            <DropdownMenuRadioGroup
              value={status}
              onValueChange={(value) =>
                setStatus(value as InboxItem["status"] | "all")
              }
            >
              <DropdownMenuRadioItem value="all">
                All statuses
              </DropdownMenuRadioItem>
              {Object.entries(inboxStatusLabel).map(([value, label]) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!hasFilters}
          onClick={() => {
            setPriority("all")
            setStatus("all")
          }}
        >
          Clear filters
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function InboxSearchPopover({
  items,
  viewTitle,
  onSelect,
}: {
  items: InboxItem[]
  viewTitle: string
  onSelect: (id: string) => void
}) {
  const { query, setQuery } = useInboxWorkspace()
  const [open, setOpen] = React.useState(false)
  const results = items.slice(0, 6)

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setQuery("")
      }}
    >
      <PopoverPrimitive.Trigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0"
            aria-label="Search conversations"
          />
        }
      >
        <IconSearch className="size-4" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 outline-none"
        >
          <PopoverPrimitive.Popup className="w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl outline-none">
            <PopoverPrimitive.Title className="sr-only">
              Search conversations
            </PopoverPrimitive.Title>
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <IconSearch className="size-4 shrink-0 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
                className="h-9 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              <p className="px-2 py-2 text-xs font-medium text-muted-foreground">
                {query ? `Results in ${viewTitle}` : `Recent in ${viewTitle}`}
              </p>
              {results.length ? (
                results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full min-w-0 items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => {
                      onSelect(item.id)
                      setOpen(false)
                      setQuery("")
                    }}
                  >
                    <ContactAvatar />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {item.contact}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.subject}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {item.ticketNumber}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No matching conversations
                </p>
              )}
            </div>
            <p className="border-t px-4 py-2 text-xs text-muted-foreground">
              Search contacts, companies, subjects, or ticket IDs
            </p>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
