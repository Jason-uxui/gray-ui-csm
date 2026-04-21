"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconDots,
  IconLink,
  IconMicrophone,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconSend,
  IconTag,
  IconTicket,
  IconX,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { currentUser, replyFromAccounts } from "@/lib/current-user"
import type {
  Ticket,
  TicketAssignee,
  TicketDrawerOrigin,
  TicketPerson,
  TicketPriority,
  TicketSubmitAction,
  TicketType,
} from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketDrawerMode = "create" | "edit"

type TicketDrawerProps = {
  open: boolean
  mode: TicketDrawerMode
  ticket: Ticket | null
  assigneeOptions: TicketAssignee[]
  peopleOptions: TicketPerson[]
  draftMessage: string
  replyFromAddress?: string
  origin?: TicketDrawerOrigin | null
  onDraftMessageChange: (nextDraft: string) => void
  onOpenChange: (open: boolean) => void
  onUpdateTicket: (
    ticketId: string,
    updater: (ticket: Ticket) => Ticket
  ) => void
  onSubmitMessage: (ticketId: string, action?: TicketSubmitAction) => void
  onReplyFromAddressChange: (ticketId: string, nextAddress: string) => void
}

const templateOptions = [
  "Hello! We're here to help you with any inquiries.",
  "Hi! Our Customer Service team is at your service.",
  "Welcome! Feel free to reach out to us for support.",
  "Thank you for using the app.",
]

const ticketTypeOptions: Array<{ value: TicketType; label: string }> = [
  { value: "incident", label: "Incident" },
  { value: "question", label: "Question" },
  { value: "task", label: "Task" },
  { value: "problem", label: "Problem" },
]

const priorityOptions: Array<{
  value: TicketPriority
  label: string
  dotClassName: string
}> = [
  { value: "low", label: "Low", dotClassName: "bg-primary" },
  { value: "medium", label: "Medium", dotClassName: "bg-chart-3" },
  { value: "high", label: "High", dotClassName: "bg-destructive" },
]

const replyActionOptions: Array<{
  action: TicketSubmitAction
  label: string
  shortcut: string
  icon: React.ReactNode
}> = [
  {
    action: "send",
    label: "Send reply",
    shortcut: "⌘↵",
    icon: <IconSend className="size-4 text-muted-foreground" />,
  },
  {
    action: "pending",
    label: "Send and mark pending",
    shortcut: "⌘⇧P",
    icon: <IconClock className="size-4 text-muted-foreground" />,
  },
  {
    action: "resolved",
    label: "Send and resolve",
    shortcut: "⌘⇧R",
    icon: <IconCheck className="size-4 text-muted-foreground" />,
  },
]

const noAssigneeValue = "__unassigned__"
const noRequesterValue = "__no-requester__"

function normalizePriority(priority: TicketPriority) {
  if (priority === "urgent") return "high"
  if (priority === "todo") return "low"
  return priority
}

function getInitials(name?: string) {
  if (!name) return "--"

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getDrawerMotionStyle(origin?: TicketDrawerOrigin | null) {
  if (!origin || typeof window === "undefined") return undefined

  const centerY = origin.y + origin.height / 2
  const viewportCenterY = window.innerHeight / 2
  const shiftY = Math.max(-14, Math.min(14, (centerY - viewportCenterY) / 20))
  const exitShiftY = Math.max(-8, Math.min(8, shiftY * 0.4))

  return {
    "--drawer-slide-enter-x": `${Math.max(44, Math.min(72, origin.width * 0.35)).toFixed(1)}px`,
    "--drawer-slide-exit-x": "40px",
    "--drawer-origin-enter-y": `${shiftY.toFixed(1)}px`,
    "--drawer-origin-exit-y": `${exitShiftY.toFixed(1)}px`,
  } as React.CSSProperties
}

function MetadataField({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="text-sm font-semibold text-foreground/80">{label}</div>
      {children}
    </div>
  )
}

function FieldSelectTrigger({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <SelectTrigger
      className={cn(
        "h-12 w-full rounded-xl border border-border/70 bg-background px-3.5 shadow-none",
        className
      )}
    >
      <span className="inline-flex min-w-0 items-center gap-2 truncate">
        {children}
      </span>
    </SelectTrigger>
  )
}

function PersonAvatar({
  person,
  fallbackClassName,
}: {
  person?: TicketPerson
  fallbackClassName?: string
}) {
  return (
    <Avatar className="size-6 border border-border/70 bg-background" size="sm">
      {person?.avatarUrl ? (
        <AvatarImage src={person.avatarUrl} alt={person.name} />
      ) : null}
      <AvatarFallback className={fallbackClassName}>
        {getInitials(person?.name)}
      </AvatarFallback>
    </Avatar>
  )
}

function TokenPill({
  label,
  leading,
  onRemove,
  className,
}: {
  label: string
  leading?: React.ReactNode
  onRemove: () => void
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-sm text-foreground/80",
        className
      )}
    >
      <span className="inline-flex min-w-0 items-center gap-1.5">
        {leading}
        <span className="truncate">{label}</span>
      </span>
      <button
        type="button"
        className="rounded-full text-muted-foreground transition hover:text-foreground"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        <IconX className="size-3.5" />
      </button>
    </span>
  )
}

export function TicketDrawer({ open, ticket, ...props }: TicketDrawerProps) {
  const [expandedByTicketId, setExpandedByTicketId] = useState<
    Record<string, boolean>
  >({})
  const [renderedState, setRenderedState] = useState<{
    mode: TicketDrawerMode
    ticket: Ticket
    assigneeOptions: TicketAssignee[]
    peopleOptions: TicketPerson[]
    draftMessage: string
    replyFromAddress?: string
    origin?: TicketDrawerOrigin | null
  } | null>(null)

  useEffect(() => {
    if (!ticket) return

    const frame = requestAnimationFrame(() => {
      setRenderedState({
        mode: props.mode,
        ticket,
        assigneeOptions: props.assigneeOptions,
        peopleOptions: props.peopleOptions,
        draftMessage: props.draftMessage,
        replyFromAddress: props.replyFromAddress,
        origin: props.origin,
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [
    ticket,
    props.assigneeOptions,
    props.draftMessage,
    props.mode,
    props.peopleOptions,
    props.replyFromAddress,
    props.origin,
  ])

  const panelState =
    ticket !== null
      ? {
          mode: props.mode,
          ticket,
          assigneeOptions: props.assigneeOptions,
          peopleOptions: props.peopleOptions,
          draftMessage: props.draftMessage,
          replyFromAddress: props.replyFromAddress,
          origin: props.origin,
        }
      : renderedState

  const renderedTicketId = panelState?.ticket.id
  const renderedIsExpanded = renderedTicketId
    ? (expandedByTicketId[renderedTicketId] ?? false)
    : false

  return (
    <Sheet open={open} onOpenChange={props.onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={getDrawerMotionStyle(panelState?.origin)}
        className={cn(
          "overflow-hidden p-0 transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width,transform] data-ending-style:translate-x-[var(--drawer-slide-exit-x,2.5rem)] data-ending-style:translate-y-[var(--drawer-origin-exit-y,0px)] data-starting-style:translate-x-[var(--drawer-slide-enter-x,3rem)] data-starting-style:translate-y-[var(--drawer-origin-enter-y,0px)] data-[side=right]:top-0 data-[side=right]:right-0 data-[side=right]:bottom-0 data-[side=right]:h-dvh data-[side=right]:w-screen data-[side=right]:rounded-none data-[side=right]:border-l data-[side=right]:border-border/70 motion-reduce:transition-none sm:shadow-2xl sm:data-[side=right]:top-3 sm:data-[side=right]:right-3 sm:data-[side=right]:bottom-3 sm:data-[side=right]:h-[calc(100dvh-1.5rem)] sm:data-[side=right]:w-[min(calc(100vw-1.5rem),clamp(34rem,36vw,46rem))] sm:data-[side=right]:max-w-none sm:data-[side=right]:rounded-[22px] sm:data-[side=right]:border",
          renderedIsExpanded &&
            "lg:data-[side=right]:w-[min(calc(100vw-2rem),clamp(60rem,72vw,78rem))]"
        )}
      >
        {panelState ? (
          <TicketDrawerPanel
            {...props}
            key={panelState.ticket.id}
            ticket={panelState.ticket}
            mode={panelState.mode}
            assigneeOptions={panelState.assigneeOptions}
            peopleOptions={panelState.peopleOptions}
            draftMessage={panelState.draftMessage}
            replyFromAddress={panelState.replyFromAddress}
            isExpanded={renderedIsExpanded}
            onExpandedChange={(nextExpanded) =>
              setExpandedByTicketId((currentState) => ({
                ...currentState,
                [panelState.ticket.id]: nextExpanded,
              }))
            }
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function TicketDrawerPanel({
  mode,
  ticket,
  isExpanded,
  onExpandedChange,
  assigneeOptions,
  peopleOptions,
  draftMessage,
  replyFromAddress,
  onDraftMessageChange,
  onOpenChange,
  onUpdateTicket,
  onSubmitMessage,
  onReplyFromAddressChange,
}: Omit<TicketDrawerProps, "open" | "ticket"> & {
  ticket: Ticket
  isExpanded: boolean
  onExpandedChange: (nextExpanded: boolean) => void
}) {
  const router = useRouter()
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const [templateQuery, setTemplateQuery] = useState("")
  const [tagInputValue, setTagInputValue] = useState("")
  const [isTagComposerOpen, setIsTagComposerOpen] = useState(false)

  const updateTicket = (updater: (currentTicket: Ticket) => Ticket) => {
    onUpdateTicket(ticket.id, updater)
  }

  const sortedAssigneeOptions = useMemo(() => {
    const nextOptions = [...assigneeOptions]

    if (!nextOptions.some((assignee) => assignee.name === currentUser.name)) {
      nextOptions.unshift({
        name: currentUser.name,
        avatarUrl: currentUser.avatar,
        email: currentUser.email,
      })
    }

    return nextOptions.sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [assigneeOptions])

  const sortedPeopleOptions = useMemo(() => {
    const nextOptions = [...peopleOptions]

    if (!nextOptions.some((person) => person.name === currentUser.name)) {
      nextOptions.unshift({
        name: currentUser.name,
        avatarUrl: currentUser.avatar,
        email: currentUser.email,
      })
    }

    return nextOptions.sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [peopleOptions])

  const selectedReplyFromAddress = replyFromAddress ?? currentUser.email
  const selectedReplyAccount =
    replyFromAccounts.find(
      (account) => account.address === selectedReplyFromAddress
    ) ?? replyFromAccounts[0]
  const normalizedPriority = normalizePriority(ticket.priority)
  const selectedAssigneeValue = ticket.assignee?.name ?? noAssigneeValue
  const selectedRequesterValue = ticket.requester?.name ?? noRequesterValue
  const followers = ticket.followers ?? []
  const tags = ticket.tags ?? []
  const availableFollowers = sortedPeopleOptions.filter(
    (person) =>
      person.name !== ticket.requester?.name &&
      !followers.some((follower) => follower.name === person.name)
  )
  const filteredTemplates = templateOptions.filter((template) =>
    template.toLowerCase().includes(templateQuery.trim().toLowerCase())
  )

  const commitTagInput = () => {
    const nextTag = tagInputValue.trim()
    if (!nextTag || tags.includes(nextTag)) {
      setIsTagComposerOpen(false)
      return
    }

    updateTicket((currentTicket) => ({
      ...currentTicket,
      tags: [...(currentTicket.tags ?? []), nextTag],
    }))
    setTagInputValue("")
    setIsTagComposerOpen(false)
  }

  const insertComposerSnippet = ({
    before = "",
    after = "",
    placeholder = "",
  }: {
    before?: string
    after?: string
    placeholder?: string
  }) => {
    const field = composerRef.current

    if (!field) {
      onDraftMessageChange(`${draftMessage}${before}${placeholder}${after}`)
      return
    }

    const selectionStart = field.selectionStart ?? draftMessage.length
    const selectionEnd = field.selectionEnd ?? draftMessage.length
    const selectedText = draftMessage.slice(selectionStart, selectionEnd)
    const insertedText = `${before}${selectedText || placeholder}${after}`
    const nextDraft = `${draftMessage.slice(0, selectionStart)}${insertedText}${draftMessage.slice(selectionEnd)}`

    onDraftMessageChange(nextDraft)

    requestAnimationFrame(() => {
      const nextCursorPosition =
        selectedText.length > 0
          ? selectionStart + insertedText.length
          : selectionStart + before.length + placeholder.length

      field.focus()
      field.setSelectionRange(nextCursorPosition, nextCursorPosition)
    })
  }

  const panelTitle =
    mode === "create"
      ? "Create New Ticket"
      : ticket.subject.trim() || "Untitled ticket"
  const panelSubtitle = ticket.ticketNumber
  const primaryActionLabel = mode === "create" ? "Submit as New" : "Send Reply"
  const primaryActionDisabled =
    mode === "create"
      ? ticket.subject.trim().length === 0
      : draftMessage.trim().length === 0

  useEffect(() => {
    if (mode !== "edit") return

    const handleKeyDown = (event: KeyboardEvent) => {
      const hasPrimaryModifier = event.metaKey || event.ctrlKey
      if (!hasPrimaryModifier || primaryActionDisabled) return

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        onSubmitMessage(ticket.id, "send")
      }

      if (event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault()
        onSubmitMessage(ticket.id, "pending")
      }

      if (event.shiftKey && event.key.toLowerCase() === "r") {
        event.preventDefault()
        onSubmitMessage(ticket.id, "resolved")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mode, onSubmitMessage, primaryActionDisabled, ticket.id])

  useEffect(() => {
    if (!isTagComposerOpen) return

    requestAnimationFrame(() => {
      tagInputRef.current?.focus()
    })
  }, [isTagComposerOpen])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background transition-[background-color] duration-300 motion-reduce:transition-none">
      <header
        className={cn(
          "sticky top-0 z-20 border-b border-border/70 bg-background/95 px-5 py-4 backdrop-blur-xl transition-[background-color,border-color,opacity,transform] duration-300 group-data-[ending-style]/drawer-sheet:translate-x-2 group-data-[ending-style]/drawer-sheet:opacity-0 group-data-[starting-style]/drawer-sheet:translate-x-4 group-data-[starting-style]/drawer-sheet:opacity-0 group-data-[starting-style]/drawer-sheet:delay-75 motion-reduce:transition-none"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground ring-1 ring-foreground/15">
              <IconTicket className="size-4" />
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <SheetTitle className="truncate text-xl font-semibold text-foreground">
                {panelTitle}
              </SheetTitle>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {panelSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="hidden rounded-full text-muted-foreground transition-[transform,background-color,color,box-shadow] duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] lg:inline-flex"
              aria-label={isExpanded ? "Collapse drawer" : "Expand drawer"}
              aria-pressed={isExpanded}
              onClick={() => onExpandedChange(!isExpanded)}
            >
              {isExpanded ? (
                <IconArrowsMinimize className="size-4 transition-transform duration-200 ease-out" />
              ) : (
                <IconArrowsMaximize className="size-4 transition-transform duration-200 ease-out" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full text-muted-foreground"
                    aria-label="More ticket actions"
                  />
                }
              >
                <IconDots className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuItem
                  onClick={() =>
                    updateTicket((currentTicket) => ({
                      ...currentTicket,
                      assignee: {
                        name: currentUser.name,
                        avatarUrl: currentUser.avatar,
                        email: currentUser.email,
                      },
                      mine: true,
                    }))
                  }
                >
                  Assign to me
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateTicket((currentTicket) => ({
                      ...currentTicket,
                      tags: [],
                      followers: [],
                    }))
                  }
                >
                  Clear tags and followers
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/accounts")}>
                  Manage accounts
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/tickets/${ticket.id}`)}
                >
                  Open full detail page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground transition-[transform,background-color,color,box-shadow] duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Close drawer"
              onClick={() => onOpenChange(false)}
            >
              <IconX className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden transition-[opacity,transform] duration-300 group-data-[ending-style]/drawer-sheet:translate-x-2 group-data-[ending-style]/drawer-sheet:opacity-0 group-data-[starting-style]/drawer-sheet:translate-x-3 group-data-[starting-style]/drawer-sheet:opacity-0 group-data-[starting-style]/drawer-sheet:delay-100 motion-reduce:transition-none"
        )}
      >
        <div
          data-layout={isExpanded ? "split" : "stacked"}
          className={cn(
            "grid h-full min-h-0 grid-cols-1 transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            isExpanded && "lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]"
          )}
        >
          <section
            className={cn(
              "flex min-h-0 min-h-[14rem] flex-col px-5 py-5 transition-[border-color,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              isExpanded
                ? "order-1 border-b border-border/70 lg:border-r lg:border-b-0"
                : "order-2 border-t border-border/70"
            )}
          >
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                isExpanded
                  ? "lg:translate-x-0 lg:opacity-100 lg:delay-75"
                  : "lg:translate-x-2 lg:opacity-95"
              )}
            >
              <div>
                <div className="text-sm font-semibold text-foreground/80">
                  Message
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">From</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-10 rounded-xl px-3 font-medium"
                        />
                      }
                    >
                      {selectedReplyAccount.label}
                      <IconChevronDown className="size-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[min(19rem,calc(100vw-2.5rem))] p-2"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-2 pb-3 text-base font-semibold text-foreground">
                          Select account
                        </DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={selectedReplyFromAddress}
                          onValueChange={(value) =>
                            onReplyFromAddressChange(ticket.id, value)
                          }
                        >
                          {replyFromAccounts.map((account) => (
                            <DropdownMenuRadioItem
                              key={account.address}
                              value={account.address}
                              className={cn(
                                "mb-2 rounded-xl border border-border/70 px-3 py-3",
                                selectedReplyFromAddress === account.address &&
                                  "border-white/10 bg-white/10 text-foreground"
                              )}
                            >
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {account.label}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {account.description}
                                </div>
                              </div>
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="rounded-xl px-2 text-sm underline-offset-2 hover:underline"
                        onClick={() => router.push("/accounts")}
                      >
                        Add account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div
                className={cn(
                  "mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-background transition-[box-shadow,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  isExpanded
                    ? "lg:translate-y-0 lg:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.28)]"
                    : "lg:translate-y-1"
                )}
              >
                <textarea
                  ref={composerRef}
                  rows={3}
                  value={draftMessage}
                  onChange={(event) => onDraftMessageChange(event.target.value)}
                  placeholder="Comment or type '/' for commands"
                  className="min-h-0 w-full flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70"
                />

                <div className="border-t border-border/70 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg text-muted-foreground"
                      aria-label="Format"
                      onClick={() =>
                        insertComposerSnippet({
                          before: "**",
                          after: "**",
                          placeholder: "highlight",
                        })
                      }
                    >
                      <span className="text-base font-medium">T</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg text-muted-foreground"
                      aria-label="Emoji"
                      onClick={() =>
                        insertComposerSnippet({ placeholder: "🙂" })
                      }
                    >
                      <IconMoodSmile className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg text-muted-foreground"
                      aria-label="Attachment"
                      disabled
                    >
                      <IconPaperclip className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg text-muted-foreground"
                      aria-label="Voice note"
                      disabled
                    >
                      <IconMicrophone className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg text-muted-foreground"
                      aria-label="Link"
                      onClick={() =>
                        insertComposerSnippet({
                          before: "[",
                          after: "](https://)",
                          placeholder: "link text",
                        })
                      }
                    >
                      <IconLink className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg text-muted-foreground"
                      aria-label="Image"
                      onClick={() =>
                        insertComposerSnippet({
                          before: "![",
                          after: "](https://)",
                          placeholder: "image alt",
                        })
                      }
                    >
                      <IconPhoto className="size-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-1 h-9 rounded-xl px-3 text-sm font-medium"
                          />
                        }
                      >
                        Templates
                        <IconChevronDown className="size-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[min(19rem,calc(100vw-2.5rem))] rounded-2xl p-0"
                      >
                        <div className="border-b border-border/70 px-4 py-3">
                          <div className="text-sm font-semibold text-foreground">
                            Add Templates
                          </div>
                          <div className="relative mt-3">
                            <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={templateQuery}
                              onChange={(event) =>
                                setTemplateQuery(event.target.value)
                              }
                              placeholder="Search templates"
                              className="h-10 rounded-xl border-border/70 pl-9"
                            />
                          </div>
                        </div>
                        <div className="scrollbar-hidden max-h-72 overflow-y-auto px-2 py-2">
                          <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
                            General greetings
                          </div>
                          {filteredTemplates.map((template) => (
                            <button
                              key={template}
                              type="button"
                              className="w-full rounded-xl px-2 py-2 text-left text-sm text-foreground/80 transition hover:bg-muted"
                              onClick={() =>
                                onDraftMessageChange(
                                  [draftMessage.trim(), template]
                                    .filter(Boolean)
                                    .join("\n\n")
                                )
                              }
                            >
                              {template}
                            </button>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={cn(
              "scrollbar-hidden relative min-h-0 overflow-y-auto px-5 py-5 transition-[border-color,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              isExpanded ? "order-2" : "order-1"
            )}
          >
            <div
              className={cn(
                "space-y-5 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                isExpanded
                  ? "lg:translate-x-0 lg:opacity-100 lg:delay-50"
                  : "lg:-translate-x-2 lg:opacity-100"
              )}
            >
              <MetadataField label="Ticket Name">
                <Input
                  value={ticket.subject}
                  onChange={(event) =>
                    updateTicket((currentTicket) => ({
                      ...currentTicket,
                      subject: event.target.value,
                    }))
                  }
                  placeholder="My suggestion for this product"
                  className="h-12 rounded-xl border-border/70 bg-background"
                />
              </MetadataField>

              <MetadataField label="Priority">
                <div className="grid grid-cols-3 gap-2">
                  {priorityOptions.map((priorityOption) => {
                    const isActive = normalizedPriority === priorityOption.value

                    return (
                      <Button
                        key={priorityOption.value}
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-12 rounded-xl border-border/70 bg-background font-medium text-foreground/70",
                          isActive && "border-border bg-muted text-foreground"
                        )}
                        onClick={() =>
                          updateTicket((currentTicket) => ({
                            ...currentTicket,
                            priority: priorityOption.value,
                          }))
                        }
                      >
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            priorityOption.dotClassName
                          )}
                        />
                        {priorityOption.label}
                      </Button>
                    )
                  })}
                </div>
              </MetadataField>

              <MetadataField label="Ticket Type">
                <Select
                  value={ticket.ticketType ?? "incident"}
                  onValueChange={(value) =>
                    updateTicket((currentTicket) => ({
                      ...currentTicket,
                      ticketType: value as TicketType,
                    }))
                  }
                >
                  <FieldSelectTrigger>
                    <span>
                      {
                        ticketTypeOptions.find(
                          (option) =>
                            option.value === (ticket.ticketType ?? "incident")
                        )?.label
                      }
                    </span>
                  </FieldSelectTrigger>
                  <SelectContent align="start" className="min-w-48">
                    {ticketTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MetadataField>

              <div
                className={cn(
                  "grid gap-4",
                  isExpanded ? "grid-cols-1" : "sm:grid-cols-2"
                )}
              >
                <MetadataField label="Requester">
                  <Select
                    value={selectedRequesterValue}
                    onValueChange={(value) => {
                      if (value === noRequesterValue) {
                        updateTicket((currentTicket) => ({
                          ...currentTicket,
                          requester: undefined,
                        }))
                        return
                      }

                      const nextRequester = sortedPeopleOptions.find(
                        (person) => person.name === value
                      )
                      if (!nextRequester) return

                      updateTicket((currentTicket) => ({
                        ...currentTicket,
                        requester: nextRequester,
                      }))
                    }}
                  >
                    <FieldSelectTrigger>
                      {ticket.requester ? (
                        <>
                          <PersonAvatar person={ticket.requester} />
                          <span className="truncate">
                            {ticket.requester.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Select requester
                        </span>
                      )}
                    </FieldSelectTrigger>
                    <SelectContent align="start" className="min-w-52">
                      <SelectItem value={noRequesterValue}>
                        Select requester
                      </SelectItem>
                      {sortedPeopleOptions.map((person) => (
                        <SelectItem key={person.name} value={person.name}>
                          <PersonAvatar person={person} />
                          <span>{person.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MetadataField>

                <MetadataField label="Assignee">
                  <Select
                    value={selectedAssigneeValue}
                    onValueChange={(value) => {
                      if (value === noAssigneeValue) {
                        updateTicket((currentTicket) => ({
                          ...currentTicket,
                          assignee: undefined,
                          mine: false,
                        }))
                        return
                      }

                      const nextAssignee = sortedAssigneeOptions.find(
                        (assignee) => assignee.name === value
                      )
                      if (!nextAssignee) return

                      updateTicket((currentTicket) => ({
                        ...currentTicket,
                        assignee: nextAssignee,
                        mine: nextAssignee.name === currentUser.name,
                      }))
                    }}
                  >
                    <FieldSelectTrigger>
                      {ticket.assignee ? (
                        <>
                          <PersonAvatar person={ticket.assignee} />
                          <span className="truncate">
                            {ticket.assignee.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Select assignee
                        </span>
                      )}
                    </FieldSelectTrigger>
                    <SelectContent align="start" className="min-w-52">
                      <SelectItem value={noAssigneeValue}>
                        Select assignee
                      </SelectItem>
                      {sortedAssigneeOptions.map((assignee) => (
                        <SelectItem key={assignee.name} value={assignee.name}>
                          <PersonAvatar person={assignee} />
                          <span>{assignee.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MetadataField>
              </div>

              <div className="border-b border-border/70 py-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <span>Tags</span>
                    <span className="text-muted-foreground">
                      {tags.length > 0 ? `All (${tags.length})` : ""}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-md text-muted-foreground"
                    aria-label="Add tag"
                    onClick={() => setIsTagComposerOpen((current) => !current)}
                  >
                    <IconPlus className="size-4" />
                  </Button>
                </div>

                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <TokenPill
                        key={tag}
                        label={tag}
                        leading={
                          <IconTag className="size-3.5 text-muted-foreground" />
                        }
                        className="rounded-md border border-border bg-muted/70 px-2 py-1 text-sm font-normal"
                        onRemove={() =>
                          updateTicket((currentTicket) => ({
                            ...currentTicket,
                            tags: (currentTicket.tags ?? []).filter(
                              (currentTag) => currentTag !== tag
                            ),
                          }))
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No tags yet
                  </div>
                )}

                {isTagComposerOpen ? (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-2">
                    <IconTag className="size-4 text-muted-foreground" />
                    <input
                      ref={tagInputRef}
                      value={tagInputValue}
                      onChange={(event) => setTagInputValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === ",") {
                          event.preventDefault()
                          commitTagInput()
                        }

                        if (event.key === "Escape") {
                          event.preventDefault()
                          setIsTagComposerOpen(false)
                          setTagInputValue("")
                        }
                      }}
                      onBlur={commitTagInput}
                      placeholder="Add tag"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                ) : null}
              </div>

              <div className="border-b border-border/70 py-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <span>Followers</span>
                    <span className="text-muted-foreground">
                      {followers.length > 0 ? `All (${followers.length})` : ""}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-md text-muted-foreground"
                          aria-label="Add follower"
                        />
                      }
                    >
                      <IconPlus className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-56">
                      {availableFollowers.length === 0 ? (
                        <DropdownMenuItem disabled>
                          Everyone is already added
                        </DropdownMenuItem>
                      ) : (
                        availableFollowers.map((person) => (
                          <DropdownMenuItem
                            key={person.name}
                            onClick={() =>
                              updateTicket((currentTicket) => ({
                                ...currentTicket,
                                followers: [
                                  ...(currentTicket.followers ?? []),
                                  person,
                                ],
                              }))
                            }
                          >
                            <PersonAvatar person={person} />
                            <span>{person.name}</span>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {followers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {followers.map((follower) => (
                      <TokenPill
                        key={follower.name}
                        label={follower.name}
                        leading={
                          <PersonAvatar
                            person={follower}
                            fallbackClassName="text-[11px]"
                          />
                        }
                        className="rounded-md border border-border bg-muted/70 px-2 py-1 text-sm font-normal"
                        onRemove={() =>
                          updateTicket((currentTicket) => ({
                            ...currentTicket,
                            followers: (currentTicket.followers ?? []).filter(
                              (currentFollower) =>
                                currentFollower.name !== follower.name
                            ),
                          }))
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No followers yet
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer
        className={cn(
          "sticky bottom-0 z-20 border-t border-border/70 bg-background/95 px-5 py-4 backdrop-blur-xl transition-[background-color,border-color,opacity,transform] duration-300 group-data-[ending-style]/drawer-sheet:translate-x-2 group-data-[ending-style]/drawer-sheet:opacity-0 group-data-[starting-style]/drawer-sheet:translate-x-4 group-data-[starting-style]/drawer-sheet:opacity-0 group-data-[starting-style]/drawer-sheet:delay-150 motion-reduce:transition-none"
        )}
      >
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          {mode === "create" ? (
            <Button
              type="button"
              disabled={primaryActionDisabled}
              onClick={() => onSubmitMessage(ticket.id)}
            >
              {primaryActionLabel}
            </Button>
          ) : (
            <div
              className={cn(
                "btn-primary-chrome inline-flex w-full items-center overflow-hidden rounded-xl bg-primary text-primary-foreground sm:w-auto",
                primaryActionDisabled &&
                  "pointer-events-none opacity-60 saturate-75"
              )}
            >
              <Button
                type="button"
                variant="ghost"
                className="flex-1 rounded-none border-none bg-transparent px-4 text-inherit shadow-none hover:!bg-white/22 hover:text-inherit disabled:opacity-100 aria-expanded:!bg-white/22 sm:flex-none"
                disabled={primaryActionDisabled}
                onClick={() => onSubmitMessage(ticket.id)}
              >
                {primaryActionLabel}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-none border-0 border-l border-primary-foreground/15 bg-transparent text-inherit shadow-none hover:!bg-white/22 hover:text-inherit disabled:opacity-100 aria-expanded:!bg-white/22"
                      aria-label="More reply actions"
                      disabled={primaryActionDisabled}
                    />
                  }
                >
                  <IconChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {replyActionOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.action}
                      onClick={() => onSubmitMessage(ticket.id, option.action)}
                    >
                      {option.icon}
                      {option.label}
                      <DropdownMenuShortcut>
                        {option.shortcut}
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
