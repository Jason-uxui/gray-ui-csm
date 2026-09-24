"use client"

import * as React from "react"
import Image from "next/image"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import {
  IconAlertCircle,
  IconArrowsJoin,
  IconChevronDown,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react"

import { getTicketNumberLabel } from "@/components/tickets/ticket-detail-helpers"
import {
  MergeRelationshipConnector,
  TicketMergeCard,
  TicketStatusBadge,
} from "@/components/tickets/ticket-merge-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { canMergeTickets, MAX_MERGE_TARGETS } from "@/lib/tickets/merge"
import type { Ticket } from "@/lib/tickets/types"

type MergeTicketsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTicket: Ticket
  tickets: Ticket[]
  unavailableTicketIds?: string[]
  onMerge: (
    selectedTickets: Ticket[],
    note: string,
    signal: AbortSignal
  ) => void | Promise<void>
}

/** Animate measured content height, including shrink after selection, without
 * tying the results viewport to how many search matches happen to exist. */
function MergeSelectionMotion({ children }: { children: React.ReactNode }) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<number>()
  React.useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return
    setHeight(content.getBoundingClientRect().height)
    const observer = new ResizeObserver(([entry]) =>
      setHeight(entry.contentRect.height)
    )
    observer.observe(content)
    return () => observer.disconnect()
  }, [])
  return (
    <div className="merge-selection-height" style={{ height }}>
      <div ref={contentRef}>{children}</div>
    </div>
  )
}

export function MergeTicketsDialog({
  open,
  onOpenChange,
  currentTicket,
  tickets,
  unavailableTicketIds = [],
  onMerge,
}: MergeTicketsDialogProps) {
  const [query, setQuery] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [isAdding, setIsAdding] = React.useState(false)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [note, setNote] = React.useState("")
  const [isNoteComposerOpen, setIsNoteComposerOpen] = React.useState(false)
  const [isMerging, setIsMerging] = React.useState(false)
  const [mergeError, setMergeError] = React.useState<string | null>(null)
  const noteInputRef = React.useRef<HTMLTextAreaElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const submittingRef = React.useRef(false)
  const abortRef = React.useRef<AbortController | null>(null)
  const selectedActionRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const mountedRef = React.useRef(true)
  const listId = React.useId()
  const titleId = React.useId()
  const descriptionId = React.useId()

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  React.useEffect(() => {
    if (isNoteComposerOpen) noteInputRef.current?.focus()
  }, [isNoteComposerOpen])

  const selectedTickets = selectedIds
    .map((id) => tickets.find((ticket) => ticket.id === id))
    .filter((ticket): ticket is Ticket => Boolean(ticket))
  const normalizedQuery = query.trim().toLowerCase()
  const availableTickets = tickets.filter(
    (ticket) =>
      ticket.id !== currentTicket.id &&
      !selectedIds.includes(ticket.id) &&
      !unavailableTicketIds.includes(ticket.id) &&
      (!normalizedQuery ||
        `${getTicketNumberLabel(ticket)} ${ticket.subject} ${ticket.accountName ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery))
  )
  const canSubmit = canMergeTickets(
    currentTicket.id,
    selectedIds,
    tickets.map((ticket) => ticket.id),
    unavailableTicketIds
  )
  const showPicker = selectedIds.length === 0 || isAdding || editingId !== null
  const canAddAnother = selectedIds.length < MAX_MERGE_TARGETS

  const resetDraft = () => {
    setQuery("")
    setSelectedIds([])
    setEditingId(null)
    setIsAdding(false)
    setPickerOpen(false)
    setActiveIndex(0)
    setNote("")
    setIsNoteComposerOpen(false)
    setIsMerging(false)
    setMergeError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (submittingRef.current && !nextOpen) return
    if (!nextOpen) resetDraft()
    onOpenChange(nextOpen)
  }

  const startPicker = (ticketId: string | null = null) => {
    setEditingId(ticketId)
    setIsAdding(ticketId === null)
    setQuery("")
    setActiveIndex(0)
    setPickerOpen(true)
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const closePicker = () => {
    setEditingId(null)
    setIsAdding(false)
    setPickerOpen(false)
    setQuery("")
  }

  const handleSelect = (ticketId: string) => {
    if (!availableTickets.some((ticket) => ticket.id === ticketId)) return
    const next = editingId
      ? selectedIds.map((id) => (id === editingId ? ticketId : id))
      : [...selectedIds, ticketId]
    if (
      !canMergeTickets(
        currentTicket.id,
        next,
        tickets.map((ticket) => ticket.id),
        unavailableTicketIds
      )
    )
      return
    setSelectedIds(next)
    setMergeError(null)
    closePicker()
    requestAnimationFrame(() =>
      selectedActionRefs.current.get(ticketId)?.focus({ preventScroll: true })
    )
  }

  const handleMerge = async () => {
    if (!canSubmit || submittingRef.current) return
    submittingRef.current = true
    setMergeError(null)
    setIsMerging(true)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      await onMerge(selectedTickets, note.trim(), controller.signal)
      if (mountedRef.current) {
        resetDraft()
        onOpenChange(false)
      }
    } catch (error) {
      if (mountedRef.current) {
        setIsMerging(false)
        if (error instanceof DOMException && error.name === "AbortError") return
        setMergeError(
          "We couldn't merge these tickets. Your selection and note are saved here. Please try again."
        )
      }
    } finally {
      abortRef.current = null
      submittingRef.current = false
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[70] bg-black/40 transition-opacity duration-500 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <DialogPrimitive.Popup
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="fixed top-1/2 left-1/2 z-[71] flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border-[0.625px] border-border bg-background text-foreground shadow-2xl transition-[opacity,scale] duration-500 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none"
        >
          {isMerging ? (
            <div className="merge-state-reveal">
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-[14px] bg-secondary">
                    <IconArrowsJoin className="size-5" />
                  </div>
                  <DialogPrimitive.Title
                    id={titleId}
                    className="text-lg leading-7 font-semibold"
                  >
                    Merge tickets
                  </DialogPrimitive.Title>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Cancel merge"
                  onClick={() => abortRef.current?.abort()}
                >
                  <IconX className="size-4" />
                </Button>
              </div>
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-center gap-3 px-6 py-[42px] text-center"
              >
                <div className="relative size-[140px]" aria-hidden="true">
                  <Image
                    src="/tickets/merge-processing-ring.svg"
                    width={140}
                    height={140}
                    alt=""
                    className="animate-spin [animation-duration:1.8s] motion-reduce:animate-none"
                  />
                  <Image
                    src="/tickets/merge-processing.png"
                    width={130}
                    height={130}
                    alt=""
                    className="absolute top-[5px] left-[5px]"
                  />
                </div>
                <p className="text-lg font-semibold">Merging tickets…</p>
                <DialogPrimitive.Description
                  id={descriptionId}
                  className="text-[13px] text-muted-foreground"
                >
                  This usually takes only a moment.
                </DialogPrimitive.Description>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => abortRef.current?.abort()}
                >
                  Cancel merge
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between gap-4 px-6 py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[14px] bg-secondary text-foreground">
                    <IconArrowsJoin className="size-5" />
                  </div>
                  <DialogPrimitive.Title
                    id={titleId}
                    className="text-lg leading-7 font-semibold"
                  >
                    Merge tickets
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description
                    id={descriptionId}
                    className="sr-only"
                  >
                    Combine selected tickets into the current ticket. Add an
                    internal note if needed.
                  </DialogPrimitive.Description>
                </div>
                <DialogPrimitive.Close
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-[14px]"
                      aria-label="Close merge tickets"
                    />
                  }
                >
                  <IconX className="size-4" />
                </DialogPrimitive.Close>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                {mergeError ? (
                  <div
                    role="alert"
                    className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive-surface p-3 text-sm"
                  >
                    <IconAlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <p className="font-medium">Merge failed</p>
                      <p className="mt-1 text-muted-foreground">{mergeError}</p>
                    </div>
                  </div>
                ) : null}
                <MergeSelectionMotion>
                  <section aria-label="Tickets to merge">
                    <p className="mb-2 text-sm leading-5 font-medium text-foreground/80">
                      Ticket 1 · Current
                    </p>
                    <TicketMergeCard
                      label={getTicketNumberLabel(currentTicket)}
                      subject={currentTicket.subject}
                      status={currentTicket.queueStatus}
                      current
                    />

                    {selectedTickets.map((ticket, index) => (
                      <div key={ticket.id} className="merge-state-reveal flex">
                        <MergeRelationshipConnector
                          continues={
                            index < selectedTickets.length - 1 ||
                            (isAdding && !editingId)
                          }
                        />
                        <div className="min-w-0 flex-1 pt-6">
                          <TicketMergeCard
                            label={getTicketNumberLabel(ticket)}
                            subject={ticket.subject}
                            status={ticket.queueStatus}
                            action={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-lg"
                                className="rounded-xl text-muted-foreground"
                                aria-label={`Change ${getTicketNumberLabel(ticket)}`}
                                ref={(node) => {
                                  if (node)
                                    selectedActionRefs.current.set(
                                      ticket.id,
                                      node
                                    )
                                  else
                                    selectedActionRefs.current.delete(ticket.id)
                                }}
                                aria-expanded={editingId === ticket.id}
                                onClick={() => startPicker(ticket.id)}
                              >
                                <IconChevronDown className="size-4" />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    ))}

                    {showPicker ? (
                      <div className="flex">
                        {selectedTickets.length === 0 ||
                        (isAdding && !editingId) ? (
                          <MergeRelationshipConnector />
                        ) : (
                          <div className="w-[47px] shrink-0" />
                        )}
                        <div className="min-w-0 flex-1 pt-6">
                          <label
                            htmlFor={listId + "-search"}
                            className="sr-only"
                          >
                            {editingId
                              ? "Replace selected ticket"
                              : "Search tickets to merge"}
                          </label>
                          {!pickerOpen ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="h-[76px] w-full justify-between rounded-[18px] bg-sidebar-accent px-3.5 font-normal"
                              onClick={() => startPicker(editingId)}
                            >
                              Choose ticket
                              <IconChevronDown className="size-4" />
                            </Button>
                          ) : (
                            <div className="relative">
                              <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                ref={searchRef}
                                id={listId + "-search"}
                                role="combobox"
                                aria-autocomplete="list"
                                aria-expanded={pickerOpen}
                                aria-controls={pickerOpen ? listId : undefined}
                                aria-activedescendant={
                                  pickerOpen && availableTickets[activeIndex]
                                    ? listId +
                                      "-" +
                                      availableTickets[activeIndex].id
                                    : undefined
                                }
                                value={query}
                                autoComplete="off"
                                placeholder="Search by ticket number or subject…"
                                className="h-[76px] rounded-[18px] bg-sidebar-accent pl-9"
                                onFocus={() => setPickerOpen(true)}
                                onChange={(event) => {
                                  setQuery(event.target.value)
                                  setActiveIndex(0)
                                  setPickerOpen(true)
                                }}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "ArrowDown" ||
                                    event.key === "ArrowUp"
                                  ) {
                                    event.preventDefault()
                                    setPickerOpen(true)
                                    setActiveIndex((index) =>
                                      Math.max(
                                        0,
                                        Math.min(
                                          availableTickets.length - 1,
                                          index +
                                            (event.key === "ArrowDown" ? 1 : -1)
                                        )
                                      )
                                    )
                                  } else if (
                                    event.key === "Enter" &&
                                    pickerOpen &&
                                    availableTickets[activeIndex]
                                  ) {
                                    event.preventDefault()
                                    handleSelect(
                                      availableTickets[activeIndex].id
                                    )
                                  } else if (
                                    event.key === "Escape" &&
                                    pickerOpen
                                  ) {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    setPickerOpen(false)
                                  }
                                }}
                              />
                            </div>
                          )}
                          {pickerOpen ? (
                            <div
                              id={listId}
                              role="listbox"
                              aria-label="Available tickets"
                              className="merge-picker-reveal mt-2 h-56 overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover p-1.5 shadow-lg"
                            >
                              {availableTickets.length ? (
                                availableTickets.map((ticket, index) => (
                                  <button
                                    key={ticket.id}
                                    id={listId + "-" + ticket.id}
                                    type="button"
                                    role="option"
                                    aria-selected={index === activeIndex}
                                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-selected:bg-muted"
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => handleSelect(ticket.id)}
                                  >
                                    <span className="min-w-0">
                                      <span className="block text-xs font-normal text-muted-foreground">
                                        {getTicketNumberLabel(ticket)}
                                      </span>
                                      <span className="mt-1 block truncate text-sm">
                                        {ticket.subject}
                                      </span>
                                    </span>
                                    <TicketStatusBadge
                                      status={ticket.queueStatus}
                                    />
                                  </button>
                                ))
                              ) : (
                                <p
                                  role="status"
                                  className="flex h-full items-center justify-center px-3 py-5 text-center text-sm text-muted-foreground"
                                >
                                  No matching available tickets.
                                </p>
                              )}
                            </div>
                          ) : null}
                          {selectedTickets.length > 0 ? (
                            <div className="mt-2 flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={closePicker}
                              >
                                Cancel selection
                              </Button>
                              {editingId ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedIds((ids) =>
                                      ids.filter((id) => id !== editingId)
                                    )
                                    closePicker()
                                    setMergeError(null)
                                  }}
                                >
                                  Remove ticket
                                </Button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : canAddAnother ? (
                      <div className="pt-3 pl-[47px]">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="gap-2 rounded-xl px-4 text-foreground"
                          onClick={() => startPicker()}
                        >
                          <IconPlus className="size-4" />
                          Add ticket
                        </Button>
                      </div>
                    ) : (
                      <p className="pt-3 pl-[47px] text-xs text-muted-foreground">
                        Maximum of 3 tickets per merge.
                      </p>
                    )}
                  </section>
                </MergeSelectionMotion>

                <div className="my-5 border-t border-border" />
                <MergeSelectionMotion>
                  <section>
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="merge-ticket-note"
                        className="text-sm font-medium"
                      >
                        Internal note
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg"
                        aria-label={
                          isNoteComposerOpen
                            ? "Hide internal note editor"
                            : "Add internal note"
                        }
                        aria-expanded={isNoteComposerOpen}
                        onClick={() => setIsNoteComposerOpen((value) => !value)}
                      >
                        {isNoteComposerOpen ? (
                          <IconX className="size-4" />
                        ) : (
                          <IconPlus className="size-4" />
                        )}
                      </Button>
                    </div>
                    {isNoteComposerOpen ? (
                      <textarea
                        ref={noteInputRef}
                        id="merge-ticket-note"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Add a short reason for merging these tickets…"
                        rows={3}
                        className="merge-state-reveal border-input-border mt-2 min-h-24 w-full resize-y rounded-xl border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/35"
                      />
                    ) : note ? (
                      <button
                        type="button"
                        className="mt-2 w-full rounded-xl border border-border p-3 text-left text-sm whitespace-pre-wrap"
                        onClick={() => setIsNoteComposerOpen(true)}
                      >
                        {note}
                      </button>
                    ) : null}
                  </section>
                </MergeSelectionMotion>
              </div>
              <div className="flex shrink-0 justify-end gap-2 border-t border-border px-6 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-[14px]"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-[14px]"
                  disabled={!canSubmit}
                  onClick={handleMerge}
                >
                  Merge tickets
                </Button>
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
