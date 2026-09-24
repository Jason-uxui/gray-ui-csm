"use client"

import * as React from "react"
import Image from "next/image"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { IconSearch } from "@tabler/icons-react"

import { ContactAvatar } from "@/components/inbox/contact-avatar"
import { useInboxWorkspace } from "@/components/inbox/inbox-workspace-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export function InboxSearchDialog({
  items,
  viewTitle,
  onSelect,
}: {
  items: InboxItem[]
  viewTitle: string
  onSelect: (id: string) => void
}) {
  const { setQuery } = useInboxWorkspace()
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const normalizedTerm = searchTerm.trim().toLowerCase()
  const results = items
    .filter(
      (item) =>
        !normalizedTerm ||
        [
          item.contact,
          item.customer,
          item.accountName,
          item.subject,
          item.ticketNumber,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedTerm)
    )
    .slice(0, 6)

  const selectResult = (id: string) => {
    onSelect(id)
    setOpen(false)
    setSearchTerm("")
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSearchTerm("")
      }}
    >
      <DialogPrimitive.Trigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0"
            aria-label="Search conversations"
            onClick={() => setQuery("")}
          />
        }
      >
        <IconSearch className="size-4" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <DialogPrimitive.Popup className="fixed top-[min(18vh,160px)] left-1/2 z-[71] flex max-h-[min(72vh,640px)] w-[calc(100vw-2rem)] max-w-140 -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl transition-[opacity,scale,translate] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:translate-y-2 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-none">
          <DialogPrimitive.Title className="sr-only">
            Search conversations
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search conversations in {viewTitle} and select one to open it.
          </DialogPrimitive.Description>
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4">
            <IconSearch className="size-5 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && results[0]) {
                  event.preventDefault()
                  selectResult(results[0].id)
                }
              }}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="h-10 min-w-0 flex-1 border-0! bg-transparent! px-0 text-base shadow-none! focus-visible:border-0! focus-visible:ring-0!"
            />
          </div>
          <div className="min-h-0 overflow-y-auto px-3 pt-2 pb-3">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
              {searchTerm
                ? `Results in ${viewTitle}`
                : `Recent in ${viewTitle}`}
            </p>
            {results.length ? (
              <div className="space-y-1">
                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex min-h-14 w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => selectResult(item.id)}
                  >
                    <ContactAvatar />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {item.contact}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {item.subject}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {item.ticketNumber}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                No matching conversations
              </p>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
