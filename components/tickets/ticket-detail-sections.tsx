import {
  IconChevronsLeft,
  IconChevronsRight,
  IconChevronDown,
  IconMicrophone,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconSend,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react"

import {
  channelLabel,
  macroSuggestions,
  priorityLabel,
  rightPanelSections,
  type RightPanelSection,
  statusLabel,
} from "@/components/tickets/ticket-detail-helpers"
import { TicketTaskInlineList } from "@/components/tickets/ticket-task-inline-list"
import { TicketPriorityIndicator } from "@/components/tickets/ticket-priority-indicator"
import { TicketTag } from "@/components/tickets/ticket-tag"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type {
  TicketDetail,
  TicketNote,
  TicketTask,
  TicketTimelineEvent,
  TicketTimelineMessage,
} from "@/lib/tickets/detail-data"
import type { Ticket, TicketPerson, TicketQueueStatus } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"
import { getInitials } from "./ticket-detail-helpers"

type PersonLike = { name: string; avatarUrl?: string; email?: string }

type ReplyAccount = {
  address: string
  label: string
  description: string
}

export function TimelineAvatar({
  person,
  className,
}: {
  person?: PersonLike
  className?: string
}) {
  return (
    <Avatar className={cn("border bg-background", className)} size="lg">
      {person?.avatarUrl ? (
        <AvatarImage src={person.avatarUrl} alt={person.name} />
      ) : null}
      <AvatarFallback className="text-xs">
        {getInitials(person?.name)}
      </AvatarFallback>
    </Avatar>
  )
}

function DetailStat({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("", className)}>
      <div className="text-xs font-medium tracking-wide text-muted-foreground">
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
    </div>
  )
}

function TimelineEventCard({ item }: { item: TicketTimelineEvent }) {
  const toneClassName =
    item.tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
      : item.tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        : "border-border bg-background text-foreground"

  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border",
          toneClassName
        )}
      >
        <IconTicket className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{item.title}</span>
          <span className="text-muted-foreground">{item.timestamp}</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {item.detail}
        </p>
      </div>
    </div>
  )
}

function TimelineMessageCard({ item }: { item: TicketTimelineMessage }) {
  const isOutbound = item.direction === "outbound"

  return (
    <div className="flex gap-3">
      <TimelineAvatar person={item.author} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{item.author.name}</span>
          <span className="text-muted-foreground">{item.timestamp}</span>
          <Badge variant="outline" className="h-5 rounded-full px-2 text-[11px]">
            {channelLabel[item.channel]}
          </Badge>
          {isOutbound ? (
            <Badge variant="secondary" className="h-5 rounded-full px-2 text-[11px]">
              Reply
            </Badge>
          ) : null}
        </div>
        <div className={cn("mt-2 text-sm leading-6 text-foreground")}>{item.body}</div>
      </div>
    </div>
  )
}

function NoteCard({ note }: { note: TicketNote }) {
  return (
    <div className="flex gap-3 rounded-2xl border bg-background/70 p-4">
      <TimelineAvatar person={note.author} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{note.author.name}</span>
          <span className="text-muted-foreground">{note.timestamp}</span>
          <Badge variant="outline" className="h-5 rounded-full px-2 text-[11px]">
            Internal
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.body}</p>
      </div>
    </div>
  )
}

export function ConversationTabContent({
  conversationItems,
  ticket,
  currentUser,
  replyAccounts,
  selectedReplyAccount,
  replyFrom,
  onReplyFromChange,
  onManageAccounts,
  draftMessage,
  onDraftMessageChange,
  templateQuery,
  onTemplateQueryChange,
  onMacroInsert,
  onSubmitReply,
}: {
  conversationItems: Array<TicketTimelineMessage | TicketTimelineEvent>
  ticket: Ticket
  currentUser: PersonLike
  replyAccounts: readonly ReplyAccount[]
  selectedReplyAccount?: ReplyAccount
  replyFrom: string
  onReplyFromChange: (nextAddress: string) => void
  onManageAccounts: () => void
  draftMessage: string
  onDraftMessageChange: (nextDraft: string) => void
  templateQuery: string
  onTemplateQueryChange: (nextValue: string) => void
  onMacroInsert: (macro: string) => void
  onSubmitReply: (nextStatus?: TicketQueueStatus) => void
}) {
  const filteredMacros = macroSuggestions.filter((macro) =>
    macro.toLowerCase().includes(templateQuery.trim().toLowerCase())
  )

  return (
    <>
      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-8">
          {conversationItems.map((item) => {
            if (item.kind === "message") {
              return <TimelineMessageCard key={item.id} item={item} />
            }

            return <TimelineEventCard key={item.id} item={item} />
          })}
        </div>
      </div>

      <div className="shrink-0 bg-background/95 px-6 py-5 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <TimelineAvatar person={currentUser} />
          <div className="min-w-0 flex-1 overflow-hidden rounded-3xl border bg-background shadow-sm">
            <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3 text-sm">
              <span className="text-muted-foreground">Via</span>
              <Badge variant="secondary" className="h-8 rounded-full px-3 font-medium">
                {channelLabel[ticket.channel]}
              </Badge>
              <span className="text-muted-foreground">From</span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-8 rounded-full px-3 font-medium"
                    />
                  }
                >
                  {selectedReplyAccount?.label}
                  <IconChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2 pb-3 text-base font-semibold text-foreground">
                      Select account
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={replyFrom}
                      onValueChange={onReplyFromChange}
                    >
                      {replyAccounts.map((account) => (
                        <DropdownMenuRadioItem
                          key={account.address}
                          value={account.address}
                          className="mb-2 rounded-xl border border-border/70 px-3 py-3"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-medium">{account.label}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {account.description}
                            </div>
                          </div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onManageAccounts}>
                    Manage accounts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <textarea
              value={draftMessage}
              onChange={(event) => onDraftMessageChange(event.target.value)}
              placeholder="Comment or type '/' for commands"
              className="min-h-40 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70"
            />

            <div className="border-t px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg text-muted-foreground"
                  >
                    <span className="text-base font-medium">T</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg text-muted-foreground"
                  >
                    <IconMoodSmile className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg text-muted-foreground"
                  >
                    <IconPaperclip className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg text-muted-foreground"
                  >
                    <IconMicrophone className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg text-muted-foreground"
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
                      Macros
                      <IconChevronDown className="size-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[19rem] rounded-2xl p-0"
                    >
                      <div className="border-b border-border/70 px-4 py-3">
                        <div className="text-sm font-semibold text-foreground">
                          Add Macros
                        </div>
                        <div className="relative mt-3">
                          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={templateQuery}
                            onChange={(event) =>
                              onTemplateQueryChange(event.target.value)
                            }
                            placeholder="Search macros"
                            className="h-10 rounded-xl border-border/70 pl-9"
                          />
                        </div>
                      </div>
                      <div className="scrollbar-hidden max-h-72 overflow-y-auto px-2 py-2">
                        <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
                          Suggested replies
                        </div>
                        {filteredMacros.map((macro) => (
                          <button
                            key={macro}
                            type="button"
                            className="w-full rounded-xl px-2 py-2 text-left text-sm text-foreground/80 transition hover:bg-muted"
                            onClick={() => onMacroInsert(macro)}
                          >
                            {macro}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-xl px-3 text-sm font-medium"
                    onClick={() => onSubmitReply("closed")}
                  >
                    End Chat
                  </Button>
                  <Button
                    type="button"
                    className="h-9 rounded-xl px-4"
                    onClick={() => onSubmitReply()}
                    disabled={!draftMessage.trim()}
                  >
                    Send
                    <IconSend className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function TaskTabContent({
  ticketId,
  tasks,
  assigneeOptions,
  onToggleTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onReorderTasks,
}: {
  ticketId: string
  tasks: TicketTask[]
  assigneeOptions: TicketPerson[]
  onToggleTask: (taskId: string) => void
  onCreateTask: (payload: { id: string; title: string }) => void
  onUpdateTask: (
    taskId: string,
    patch: Partial<Pick<TicketTask, "title" | "status" | "due" | "assignee">>
  ) => void
  onDeleteTask: (taskId: string) => void
  onDuplicateTask: (taskId: string) => void
  onReorderTasks: (activeTaskId: string, overTaskId: string) => void
}) {
  return (
    <TicketTaskInlineList
      ticketId={ticketId}
      tasks={tasks}
      assigneeOptions={assigneeOptions}
      onToggleTask={onToggleTask}
      onCreateTask={onCreateTask}
      onUpdateTask={onUpdateTask}
      onDeleteTask={onDeleteTask}
      onDuplicateTask={onDuplicateTask}
      onReorderTasks={onReorderTasks}
    />
  )
}

export function ActivityTabContent({
  activityItems,
}: {
  activityItems: TicketTimelineEvent[]
}) {
  return (
    <div className="scrollbar-hidden h-full overflow-y-auto px-6 py-6">
      <div className="space-y-8 border-l border-border/70 pl-6">
        {activityItems.map((item) => (
          <TimelineEventCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export function NotesTabContent({
  notes,
  currentUser,
  noteDraft,
  onNoteDraftChange,
  onAddNote,
}: {
  notes: TicketNote[]
  currentUser: PersonLike
  noteDraft: string
  onNoteDraftChange: (nextValue: string) => void
  onAddNote: () => void
}) {
  return (
    <div className="scrollbar-hidden h-full overflow-y-auto px-6 py-6">
      <div className="space-y-4">
        <div className="rounded-3xl border bg-background p-4">
          <div className="flex items-start gap-3">
            <TimelineAvatar person={currentUser} />
            <div className="min-w-0 flex-1 space-y-3">
              <textarea
                value={noteDraft}
                onChange={(event) => onNoteDraftChange(event.target.value)}
                placeholder="Write an internal note..."
                className="min-h-28 w-full resize-none rounded-2xl border bg-background px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/70"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Only the support team can see this note.
                </span>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl"
                  onClick={onAddNote}
                  disabled={!noteDraft.trim()}
                >
                  Add note
                  <IconPlus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TicketDetailRightPanel({
  open,
  onToggleOpen,
  activeSection,
  onSelectSection,
  queueStatus,
  ticket,
  detail,
  assignee,
  selectedReplyAccountLabel,
}: {
  open: boolean
  onToggleOpen: () => void
  activeSection: RightPanelSection
  onSelectSection: (nextSection: RightPanelSection) => void
  queueStatus: TicketQueueStatus
  ticket: Ticket
  detail: TicketDetail
  assignee: { name: string; avatarUrl?: string; email?: string }
  selectedReplyAccountLabel?: string
}) {
  const activeRightPanel = rightPanelSections.find(
    (section) => section.value === activeSection
  )

  return (
    <aside className="hidden min-h-0 xl:block">
      <div className="flex h-full min-h-0 overflow-hidden">
        <div className="flex w-14 shrink-0 flex-col items-center gap-2 p-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl"
            onClick={onToggleOpen}
            aria-label={open ? "Collapse right panel" : "Expand right panel"}
          >
            {open ? (
              <IconChevronsRight className="size-4" />
            ) : (
              <IconChevronsLeft className="size-4" />
            )}
          </Button>

          {rightPanelSections.map((section) => {
            const SectionIcon = section.icon
            const isActive = activeSection === section.value

            return (
              <Button
                key={section.value}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="icon-sm"
                className="size-9 rounded-xl"
                aria-label={section.label}
                aria-pressed={isActive}
                onClick={() => onSelectSection(section.value)}
              >
                <SectionIcon className="size-4" />
              </Button>
            )
          })}
        </div>

        {open ? (
          <div className={cn("min-h-0 flex-1 p-2", "border-l")}>
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {activeRightPanel?.label}
                </h2>
              </div>

              <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-4">
                {activeSection === "details" ? (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <DetailStat
                      label="Queue status"
                      value={
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              queueStatus === "closed"
                                ? "bg-zinc-500"
                                : queueStatus === "resolved"
                                  ? "bg-emerald-500"
                                  : queueStatus === "pending"
                                    ? "bg-amber-500"
                                    : "bg-sky-500"
                            )}
                          />
                          {statusLabel[queueStatus]}
                        </span>
                      }
                    />
                    <DetailStat
                      label="Priority"
                      value={
                        <span className="inline-flex items-center gap-2">
                          <TicketPriorityIndicator priority={ticket.priority} />
                          {priorityLabel[ticket.priority]}
                        </span>
                      }
                    />
                    <DetailStat label="Health" value={<TicketTag tone={ticket.health} />} />
                    <DetailStat label="Channel" value={channelLabel[ticket.channel]} />
                    <DetailStat label="Opened" value={detail.openedAt} />
                    <DetailStat
                      label="SLA"
                      value={detail.responseSla}
                      className="col-span-2"
                    />
                    <DetailStat
                      label="Next due"
                      value={detail.nextDue}
                      className="col-span-2"
                    />
                    <DetailStat label="Assigned to" value={assignee.name} />
                  </div>
                ) : null}

                {activeSection === "people" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <TimelineAvatar person={detail.customer} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                          {detail.customer.name}
                        </div>
                        <div className="text-sm text-muted-foreground">Requester</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                      <TimelineAvatar person={assignee} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                          {assignee.name}
                        </div>
                        <div className="text-sm text-muted-foreground">Assignee</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
                        <IconUsers className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                          Support team
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Reply from {selectedReplyAccountLabel ?? "Support"} and
                          keep the thread in sync.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeSection === "knowledge" ? (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-foreground">
                      Knowledge Base
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      This module is prepared for linked playbooks, known issues,
                      and ticket-specific references.
                    </p>
                    <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                      Connect KB sources here in the next iteration.
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
