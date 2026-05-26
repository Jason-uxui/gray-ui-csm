"use client"

import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react"
import {
  IconAt,
  IconBold,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconItalic,
  IconMail,
  IconPencil,
  IconPhone,
  IconPlus,
  IconUnderline,
  IconX,
} from "@tabler/icons-react"

import {
  ActivityTimelineList,
  type ActivityTimelineItem,
} from "@/components/activity/activity-timeline"
import { getCustomerBrandPresentation } from "@/components/customers/customer-brand"
import { CustomerInitialAvatar } from "@/components/customers/customer-initial-avatar"
import { CustomerMetricsGrid } from "@/components/customers/customer-metrics-grid"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { currentUser } from "@/lib/current-user"
import { buildCustomerDetailMetrics } from "@/lib/customers/detail-view-model"
import { customerDirectory } from "@/lib/customers/mock-data"
import {
  getCustomerInitials,
  customerPresenceDotClassName,
  customerTicketPriorityDotClassName,
  customerTicketStatusToneClassName,
  isVipCustomerTier,
} from "@/lib/customers/presentation"
import type {
  Customer,
  CustomerDrawerSectionState,
} from "@/lib/customers/types"
import { cn } from "@/lib/utils"

export type CustomerDrawerTriggerContext = {
  customerId: string
  source: "table" | "card"
  originRect?: {
    x: number
    y: number
    width: number
    height: number
  }
}

type CustomerDrawerProps = {
  open: boolean
  customer: Customer | null
  currentIndex: number
  totalCount: number
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
  onViewProfile: () => void
}

type CustomerNoteItem = {
  id: string
  body: string
  authorName: string
  authorInitials: string
  createdAtLabel: string
  source: "seed" | "manual"
  canDelete: boolean
}

type NoteComposerState = {
  mode: "closed" | "open"
  draft: string
  showMentions: boolean
}

type MentionCandidate = {
  id: string
  name: string
}

function isMentionContext(text: string, cursor: number) {
  const beforeCursor = text.slice(0, cursor)
  return /(^|\s)@[^\s@]*$/.test(beforeCursor)
}

const numberFormatter = new Intl.NumberFormat("en-US")
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const drawerSheetClassName =
  "overflow-hidden p-0 data-[side=right]:w-screen data-[side=right]:rounded-none data-[side=right]:border-l data-[side=right]:border-border/70 sm:shadow-2xl sm:data-[side=right]:top-3 sm:data-[side=right]:right-3 sm:data-[side=right]:bottom-3 sm:data-[side=right]:h-[calc(100dvh-1.5rem)] sm:data-[side=right]:w-[min(calc(100vw-1.5rem),54rem)] sm:data-[side=right]:max-w-none sm:data-[side=right]:rounded-3xl sm:data-[side=right]:border lg:data-[side=right]:w-[min(calc(100vw-1.5rem),62rem)]"
const neutralOutlineBadgeClassName = "border-border/80 bg-background text-foreground"
const drawerMetaLabelClassName = "text-xs tracking-wide text-muted-foreground uppercase"

const languageCodeByName: Record<string, string> = {
  English: "EN",
  Swedish: "SV",
  Finnish: "FI",
  German: "DE",
  French: "FR",
  Spanish: "ES",
  Italian: "IT",
  Korean: "KO",
  Japanese: "JA",
  Vietnamese: "VI",
  Portuguese: "PT",
  Mandarin: "ZH",
  Cantonese: "YUE",
}

const defaultSectionState: CustomerDrawerSectionState = {
  tickets: true,
  activity: true,
  notes: true,
  companyExpanded: true,
}

const defaultNoteComposerState: NoteComposerState = {
  mode: "closed",
  draft: "",
  showMentions: false,
}

export function CustomerDrawer({
  open,
  customer,
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  onClose,
  onViewProfile,
}: CustomerDrawerProps) {
  const [sectionState, setSectionState] =
    useState<CustomerDrawerSectionState>(defaultSectionState)
  const [manualNotesByCustomerId, setManualNotesByCustomerId] = useState<
    Record<string, CustomerNoteItem[]>
  >({})
  const [composerByCustomerId, setComposerByCustomerId] = useState<
    Record<string, NoteComposerState>
  >({})
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex >= 0 && currentIndex < totalCount - 1

  const activeCustomerId = customer?.id ?? null

  const composerState =
    activeCustomerId !== null
      ? composerByCustomerId[activeCustomerId] ?? defaultNoteComposerState
      : defaultNoteComposerState

  const mentionCandidates = useMemo(() => {
    const ownerNames = new Set<string>()
    ownerNames.add(currentUser.name)
    for (const customerEntry of customerDirectory) {
      ownerNames.add(customerEntry.owner.name)
    }

    return Array.from(ownerNames).map((name) => ({
      id: `mention-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
    }))
  }, [])

  const normalizedNotes = useMemo(() => {
    if (!customer) return []

    const seedBody = customer.notes.trim()
    const seedNotes: CustomerNoteItem[] = seedBody
      ? [
          {
            id: `${customer.id}-seed`,
            body: seedBody,
            authorName: customer.owner.name,
            authorInitials: getCustomerInitials(customer.owner.name),
            createdAtLabel: "Earlier",
            source: "seed",
            canDelete: false,
          },
        ]
      : []
    const manualNotes = manualNotesByCustomerId[customer.id] ?? []

    return [...seedNotes, ...manualNotes]
  }, [customer, manualNotesByCustomerId])

  const noteCount = normalizedNotes.length

  const activityTimelineItems = useMemo<ActivityTimelineItem[]>(() => {
    if (!customer) return []

    return customer.activityEvents.map((event) => ({
      id: event.id,
      title: event.title,
      detail: event.detail,
      timestamp: event.timestamp,
      tone: event.tone,
    }))
  }, [customer])

  const metrics = useMemo(() => {
    if (!customer) return []
    return buildCustomerDetailMetrics(customer)
  }, [customer])

  const customerTier = customer ? getCustomerTierBadgeLabel(customer) : ""

  const customerBrand = customer
    ? getCustomerBrandPresentation(customer.id, customer.companyName)
    : null
  const BrandIcon = customerBrand?.icon

  const noteViewState =
    composerState.mode === "open"
      ? "composer"
      : normalizedNotes.length === 0
        ? "empty"
        : "list"

  const updateComposerState = (updater: (current: NoteComposerState) => NoteComposerState) => {
    if (!activeCustomerId) return

    setComposerByCustomerId((currentState) => ({
      ...currentState,
      [activeCustomerId]: updater(
        currentState[activeCustomerId] ?? defaultNoteComposerState
      ),
    }))
  }

  const openComposer = () => {
    updateComposerState((currentState) => ({
      ...currentState,
      mode: "open",
      showMentions: false,
    }))
  }

  const cancelComposer = () => {
    updateComposerState(() => defaultNoteComposerState)
  }

  const saveDraftNote = () => {
    if (!customer || !activeCustomerId) return
    const normalizedDraft = composerState.draft.trim()
    if (!normalizedDraft) return

    const noteItem: CustomerNoteItem = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${activeCustomerId}-${Date.now()}`,
      body: normalizedDraft,
      authorName: currentUser.name,
      authorInitials: getCustomerInitials(currentUser.name),
      createdAtLabel: "Just now",
      source: "manual",
      canDelete: true,
    }

    setManualNotesByCustomerId((currentState) => ({
      ...currentState,
      [activeCustomerId]: [...(currentState[activeCustomerId] ?? []), noteItem],
    }))
    setComposerByCustomerId((currentState) => ({
      ...currentState,
      [activeCustomerId]: defaultNoteComposerState,
    }))
  }

  const deleteManualNote = (noteId: string) => {
    if (!activeCustomerId) return

    setManualNotesByCustomerId((currentState) => ({
      ...currentState,
      [activeCustomerId]: (currentState[activeCustomerId] ?? []).filter(
        (noteItem) => noteItem.id !== noteId
      ),
    }))
  }

  const replaceDraftAndSelection = (
    nextDraft: string,
    selectionStart: number,
    selectionEnd: number
  ) => {
    if (!activeCustomerId) return

    setComposerByCustomerId((currentState) => ({
      ...currentState,
      [activeCustomerId]: {
        ...(currentState[activeCustomerId] ?? defaultNoteComposerState),
        mode: "open",
        draft: nextDraft,
      },
    }))

    requestAnimationFrame(() => {
      const input = noteInputRef.current
      if (!input) return
      input.focus()
      input.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const wrapSelectionWithToken = (prefix: string, suffix = prefix) => {
    const input = noteInputRef.current
    const currentDraft = composerState.draft

    if (!input) {
      const nextDraft = `${currentDraft}${prefix}${suffix}`
      replaceDraftAndSelection(
        nextDraft,
        nextDraft.length - suffix.length,
        nextDraft.length - suffix.length
      )
      return
    }

    const selectionStart = input.selectionStart ?? currentDraft.length
    const selectionEnd = input.selectionEnd ?? selectionStart
    const selectedText = currentDraft.slice(selectionStart, selectionEnd)
    const nextDraft = `${currentDraft.slice(0, selectionStart)}${prefix}${selectedText}${suffix}${currentDraft.slice(selectionEnd)}`
    const nextSelectionStart = selectionStart + prefix.length
    const nextSelectionEnd = nextSelectionStart + selectedText.length

    replaceDraftAndSelection(nextDraft, nextSelectionStart, nextSelectionEnd)
  }

  const insertMentionAtCursor = (candidate: MentionCandidate) => {
    const input = noteInputRef.current
    const currentDraft = composerState.draft
    const mentionText = `@${candidate.name} `

    if (!input) {
      const nextDraft = `${currentDraft}${mentionText}`
      replaceDraftAndSelection(nextDraft, nextDraft.length, nextDraft.length)
    } else {
      const selectionStart = input.selectionStart ?? currentDraft.length
      const selectionEnd = input.selectionEnd ?? selectionStart
      const nextDraft = `${currentDraft.slice(0, selectionStart)}${mentionText}${currentDraft.slice(selectionEnd)}`
      const cursor = selectionStart + mentionText.length

      replaceDraftAndSelection(nextDraft, cursor, cursor)
    }

    updateComposerState((currentState) => ({
      ...currentState,
      showMentions: false,
    }))
  }

  const handleComposerInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextDraft = event.target.value
    const cursor = event.target.selectionStart ?? nextDraft.length
    const nextShowMentions = isMentionContext(nextDraft, cursor)

    updateComposerState((currentState) => ({
      ...currentState,
      draft: nextDraft,
      mode: "open",
      showMentions: nextShowMentions,
    }))
  }

  return (
    <Sheet
      open={open && customer !== null}
      modal={false}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className={drawerSheetClassName}
      >
        {customer ? (
          <div className="flex h-full min-h-0 flex-col bg-card text-foreground">
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-xl"
                  aria-label="Previous customer"
                  disabled={!canGoPrevious}
                  onClick={onPrevious}
                >
                  <IconChevronLeft />
                </Button>
                <span className="min-w-6 text-center text-sm font-medium text-muted-foreground">
                  {currentIndex >= 0 ? `${currentIndex + 1} / ${totalCount}` : "- / -"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-xl"
                  aria-label="Next customer"
                  disabled={!canGoNext}
                  onClick={onNext}
                >
                  <IconChevronRight />
                </Button>
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={onViewProfile}
                >
                  View full profile
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-xl"
                  aria-label="Close customer preview"
                  onClick={onClose}
                >
                  <IconX />
                </Button>
              </div>
            </header>

            <section className="border-b border-border/70 px-6 pt-6 pb-5">
              <div className="flex min-w-0 items-start gap-4">
                <CustomerInitialAvatar
                  name={customer.primaryContactName}
                  size="lg"
                  badgeClassName={customerPresenceDotClassName}
                  className="size-12 shrink-0 [&_[data-slot=avatar-fallback]]:text-sm"
                />

                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate text-lg leading-7 font-semibold text-foreground">
                    {customer.primaryContactName}
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Customer preview for {customer.primaryContactName} at {customer.companyName}
                  </SheetDescription>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={neutralOutlineBadgeClassName}>
                      {customer.owner.name}
                    </Badge>
                    <Badge variant="outline" className={neutralOutlineBadgeClassName}>
                      {customerTier}
                    </Badge>
                    <Badge variant="outline" className={neutralOutlineBadgeClassName}>
                      {customer.region} · {customer.timezone.replace(":00", "")}
                    </Badge>
                    <Badge variant="outline" className={neutralOutlineBadgeClassName}>
                      {formatLanguageCodes(customer)}
                    </Badge>
                    <Badge variant="outline" className={neutralOutlineBadgeClassName}>
                      {customer.responseTimeLabel}
                    </Badge>
                  </div>
                </div>
              </div>

              <CustomerMetricsGrid
                metrics={metrics}
                valueAlign="center"
                className="mt-4 border-border"
              />
            </section>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto border-b border-border/70 md:grid-cols-[20rem_minmax(0,1fr)] md:overflow-hidden md:border-b-0">
              <aside className="border-b border-border/70 px-6 py-5 md:min-h-0 md:overflow-y-auto md:border-r md:border-b-0">
                <SectionKicker>Contact</SectionKicker>
                <ContactField
                  label="Phone"
                  value={customer.phoneNumber}
                  href={`tel:${customer.phoneNumber.replace(/[^\d+]/g, "")}`}
                  icon={<IconPhone className="size-3.5 text-muted-foreground" />}
                />
                <ContactField
                  label="Email"
                  value={customer.primaryContactEmail}
                  href={`mailto:${customer.primaryContactEmail}`}
                  icon={<IconMail className="size-3.5 text-muted-foreground" />}
                />
                <ContactField label="Source" value={customer.source} />
                <ContactField label="First contact" value={customer.firstContactDate} />
                <ContactField label="Assignee" value={customer.owner.name} isLast />

                <SectionKicker className="mt-8">Company</SectionKicker>
                <section className="overflow-hidden rounded-2xl border border-border/80 bg-background">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                    aria-expanded={sectionState.companyExpanded}
                    aria-controls="company-panel"
                    onClick={() =>
                      setSectionState((current) => ({
                        ...current,
                        companyExpanded: !current.companyExpanded,
                      }))
                    }
                  >
                    <Avatar className="size-10 border bg-background" size="lg">
                      <AvatarFallback className={cn("text-sm font-semibold", customerBrand?.className)}>
                        {BrandIcon ? <BrandIcon className="size-4" /> : customerBrand?.fallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {customer.companyProfile.companyDisplayName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {customer.companyProfile.tier} · {customer.companyProfile.contactsCount} contacts
                      </p>
                    </div>
                    {sectionState.companyExpanded ? (
                      <IconChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <IconChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </button>

                  {sectionState.companyExpanded ? (
                    <div id="company-panel" className="border-t border-border/70">
                      <InfoRow label="Tier" value={customer.companyProfile.tier} />
                      <InfoRow
                        label="Account mgr"
                        value={customer.companyProfile.accountManager}
                      />
                      <InfoRow
                        label="Renewal"
                        value={customer.companyProfile.renewalDate}
                      />
                      <InfoRow
                        label="Revenue"
                        value={currencyFormatter.format(customer.companyProfile.revenue)}
                        isLast
                      />
                    </div>
                  ) : null}
                </section>
              </aside>

              <main className="min-h-0 overflow-y-auto">
                <DrawerSection
                  id="tickets-section"
                  title="Tickets"
                  badge={numberFormatter.format(customer.openTickets)}
                  open={sectionState.tickets}
                  onToggle={() =>
                    setSectionState((current) => ({
                      ...current,
                      tickets: !current.tickets,
                    }))
                  }
                >
                  {customer.recentTickets.length > 0 ? (
                    <div className="flex flex-col gap-4 px-4 pb-4">
                      {customer.recentTickets.map((ticket) => (
                        <article
                          key={ticket.id}
                          className="overflow-hidden rounded-2xl border border-border/80 bg-background"
                        >
                          <div className="flex items-center gap-2 px-4 py-3">
                            <span className="font-mono text-sm font-medium text-muted-foreground">
                              #{ticket.id}
                            </span>
                            <p className="flex-1 truncate text-sm font-semibold text-foreground">
                              {ticket.subject}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border-0 capitalize",
                                customerTicketStatusToneClassName[ticket.status]
                              )}
                            >
                              {ticket.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 border-t border-border/70">
                            <MetaCell label="Type">{getTicketType(ticket.subject, ticket.priority)}</MetaCell>
                            <MetaCell label="Priority">
                              <span
                                className={cn(
                                  "size-2 rounded-full",
                                  customerTicketPriorityDotClassName[ticket.priority]
                                )}
                              />
                              <span className="capitalize">{ticket.priority}</span>
                            </MetaCell>
                            <MetaCell
                              label={ticket.status === "resolved" ? "Closed" : "Assigned"}
                              isLast
                            >
                              {ticket.status === "resolved"
                                ? ticket.requestDate
                                : ticket.assigneeLabel}
                            </MetaCell>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptySectionState
                      message="No active ticket threads for this customer."
                      className="px-4 pb-4"
                    />
                  )}
                </DrawerSection>

                <DrawerSection
                  id="activity-section"
                  title="Activity"
                  open={sectionState.activity}
                  onToggle={() =>
                    setSectionState((current) => ({
                      ...current,
                      activity: !current.activity,
                    }))
                  }
                >
                  {activityTimelineItems.length > 0 ? (
                    <ActivityTimelineList
                      items={activityTimelineItems}
                      variant="compact"
                      className="px-6 py-4"
                    />
                  ) : (
                    <EmptySectionState
                      message="No activity recorded for this customer yet."
                      className="px-4 pb-4"
                    />
                  )}
                </DrawerSection>

                <DrawerSection
                  id="notes-section"
                  title="Notes"
                  badge={numberFormatter.format(noteCount)}
                  open={sectionState.notes}
                  onToggle={() =>
                    setSectionState((current) => ({
                      ...current,
                      notes: !current.notes,
                    }))
                  }
                >
                  <div className="px-5 pb-5">
                    <div className="overflow-hidden rounded-3xl border border-border/80 bg-background">
                      {noteViewState === "empty" ? (
                        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                          <span className="inline-flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <IconPencil className="size-6" />
                          </span>
                          <p className="mt-5 max-w-md text-lg text-muted-foreground">
                            Internal notes are only visible to your team and never
                            visible to the customer.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="mt-6 rounded-2xl"
                            onClick={openComposer}
                          >
                            <IconPlus data-icon="inline-start" />
                            Add note
                          </Button>
                        </div>
                      ) : null}

                      {noteViewState === "composer" ? (
                        <>
                            <div className="relative flex flex-wrap items-center gap-2 border-b border-border/80 px-5 py-2.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="min-w-11 rounded-xl px-3"
                                onClick={() => wrapSelectionWithToken("**")}
                              >
                                <IconBold className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="min-w-11 rounded-xl px-3"
                                onClick={() => wrapSelectionWithToken("_")}
                              >
                                <IconItalic className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="min-w-11 rounded-xl px-3"
                                onClick={() => wrapSelectionWithToken("<u>", "</u>")}
                              >
                                <IconUnderline className="size-4" />
                              </Button>
                              <div className="mx-1 h-7 w-px bg-border/90" />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl px-4"
                                onClick={() =>
                                  updateComposerState((currentState) => ({
                                    ...currentState,
                                    showMentions: !currentState.showMentions,
                                  }))
                                }
                              >
                                <IconAt data-icon="inline-start" />
                                Mention
                              </Button>

                              {composerState.showMentions ? (
                                <div className="absolute top-[calc(100%+0.4rem)] left-5 z-20 max-h-44 w-56 overflow-y-auto rounded-xl border border-border/80 bg-popover p-1.5 shadow-xl">
                                  {mentionCandidates.map((candidate) => (
                                    <button
                                      key={candidate.id}
                                      type="button"
                                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                                      onClick={() => insertMentionAtCursor(candidate)}
                                    >
                                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                        {getCustomerInitials(candidate.name)}
                                      </span>
                                      <span className="truncate">{candidate.name}</span>
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </div>

                            <textarea
                              ref={noteInputRef}
                              value={composerState.draft}
                              placeholder="Write a note... Use @ to mention a teammate."
                              className="min-h-32 w-full resize-none border-0 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-muted-foreground/90"
                              onChange={handleComposerInputChange}
                              onKeyDown={(event) => {
                                if (event.key === "Escape" && composerState.showMentions) {
                                  event.preventDefault()
                                  updateComposerState((currentState) => ({
                                    ...currentState,
                                    showMentions: false,
                                  }))
                                }
                              }}
                            />

                            <div className="flex items-center justify-between gap-3 border-t border-border/80 bg-muted/40 px-5 py-2.5">
                              <span className="text-sm text-muted-foreground">
                                @ to mention
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={cancelComposer}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  disabled={composerState.draft.trim().length === 0}
                                  onClick={saveDraftNote}
                                >
                                  Save note
                                </Button>
                              </div>
                            </div>
                        </>
                      ) : null}

                      {noteViewState === "list" ? (
                        <div>
                          {normalizedNotes.map((noteItem) => (
                            <article
                              key={noteItem.id}
                              className="border-b border-border/70 px-5 py-4 last:border-b-0"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                                  {noteItem.authorInitials}
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                  {noteItem.authorName}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {noteItem.createdAtLabel}
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-foreground">
                                {renderNoteBody(noteItem.body)}
                              </p>
                              {noteItem.canDelete ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 rounded-xl"
                                  onClick={() => deleteManualNote(noteItem.id)}
                                >
                                  Delete
                                </Button>
                              ) : null}
                            </article>
                          ))}

                          <div className="px-5 py-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              className="rounded-2xl"
                              onClick={openComposer}
                            >
                              <IconPlus data-icon="inline-start" />
                              Add note
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </DrawerSection>
              </main>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function SectionKicker({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h3
      className={cn(
        "mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase",
        className
      )}
    >
      {children}
    </h3>
  )
}

function ContactField({
  label,
  value,
  href,
  icon,
  isLast = false,
}: {
  label: string
  value: string
  href?: string
  icon?: ReactNode
  isLast?: boolean
}) {
  const content = (
    <span className="inline-flex items-center gap-2">
      {icon}
      <span>{value}</span>
    </span>
  )

  return (
    <div className={cn("border-b border-border/70 py-2", isLast && "border-b-0")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      {href ? (
        <a href={href} className="mt-2 block text-sm text-foreground hover:underline">
          {content}
        </a>
      ) : (
        <p className="mt-1 text-sm text-foreground">{content}</p>
      )}
    </div>
  )
}

function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string
  value: string
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border/70 px-4 py-2.5",
        isLast && "border-b-0"
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function DrawerSection({
  id,
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  badge?: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="border-b border-border/70 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-5 text-left"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-base font-semibold leading-none text-foreground">
            {title}
          </span>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </span>
        {open ? (
          <IconChevronUp className="size-5 shrink-0 text-muted-foreground" />
        ) : (
          <IconChevronDown className="size-5 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open ? <div id={id}>{children}</div> : null}
    </section>
  )
}

function MetaCell({
  label,
  children,
  isLast = false,
}: {
  label: string
  children: ReactNode
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        "min-w-0 border-r border-border/70 px-4 py-2.5 last:border-r-0",
        isLast && "border-r-0"
      )}
    >
      <div className={drawerMetaLabelClassName}>
        {label}
      </div>
      <div className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-sm text-foreground">
        {children}
      </div>
    </div>
  )
}

function EmptySectionState({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <div className={cn(className)}>
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
        {message}
      </div>
    </div>
  )
}

function renderNoteBody(noteBody: string) {
  const tokenPattern = /(\*\*[^*]+\*\*|_[^_]+_|<u>[\s\S]+?<\/u>)/g
  const segments = noteBody.split(tokenPattern).filter((segment) => segment.length > 0)

  return segments.map((segment, segmentIndex) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return (
        <strong key={`note-segment-${segmentIndex}`}>
          {segment.slice(2, -2)}
        </strong>
      )
    }

    if (segment.startsWith("_") && segment.endsWith("_")) {
      return <em key={`note-segment-${segmentIndex}`}>{segment.slice(1, -1)}</em>
    }

    if (segment.startsWith("<u>") && segment.endsWith("</u>")) {
      return (
        <span key={`note-segment-${segmentIndex}`} className="underline">
          {segment.slice(3, -4)}
        </span>
      )
    }

    return <span key={`note-segment-${segmentIndex}`}>{segment}</span>
  })
}

function getTicketType(subject: string, priority: Customer["recentTickets"][number]["priority"]) {
  const normalizedSubject = subject.toLowerCase()

  if (normalizedSubject.includes("refund") || normalizedSubject.includes("invoice")) {
    return "Complaint"
  }

  if (priority === "high") {
    return "Incident"
  }

  return "Question"
}

function formatLanguageCodes(customer: Customer) {
  return customer.languagesSpoken
    .map(
      (language) =>
        languageCodeByName[language] ?? language.slice(0, 2).toUpperCase()
    )
    .join(", ")
}

function getCustomerTierBadgeLabel(customer: Customer) {
  if (isVipCustomerTier(customer.plan, customer.annualValue)) return "VIP"
  return customer.plan
}
