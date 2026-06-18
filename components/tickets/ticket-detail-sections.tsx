import * as React from "react"
import {
  IconChevronDown,
  IconFileText,
  IconMicrophone,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconSearch,
  IconSend,
  IconUsers,
} from "@tabler/icons-react"

import {
  ActivityTimelineEventItem,
  type ActivityTimelineItem,
} from "@/components/activity/activity-timeline"
import {
  SharedActivityTabContent,
  SharedInternalNotesTabContent,
} from "@/components/detail-tabs/shared-activity-notes-tab-content"
import {
  DiscussionAvatar,
  DiscussionComposerShell,
  DiscussionMessageEntry,
  DiscussionThreadContent,
  type DiscussionPerson,
} from "@/components/detail-tabs/shared-discussion-tab-content"
import { DetailRightPanelShell } from "@/components/detail-right-panel-shell"
import {
  channelLabel,
  macroSuggestions,
  priorityLabel,
  rightPanelSections,
  type RightPanelSection,
  statusLabel,
} from "@/components/tickets/ticket-detail-helpers"
import { TicketTaskInlineList } from "@/components/tickets/ticket-task-inline-list"
import { TicketPriorityIndicator } from "@/components/ticket-priority-indicator"
import { TicketTag } from "@/components/tickets/ticket-tag"
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
import type { KnowledgeArticle } from "@/lib/knowledge-base/types"
import type {
  TicketDetail,
  TicketLinkedArticle,
  TicketNote,
  TicketTask,
  TicketTimelineEvent,
  TicketTimelineMessage,
} from "@/lib/tickets/detail-data"
import type {
  Ticket,
  TicketPerson,
  TicketQueueStatus,
} from "@/lib/tickets/types"
import { cn } from "@/lib/utils"
import { TicketKnowledgePanel } from "./ticket-knowledge-panel"
import {
  getKnowledgeArticleCategoryLabel,
  getKnowledgeArticleUrl,
} from "./ticket-knowledge-helpers"

type PersonLike = DiscussionPerson

type ReplyAccount = {
  address: string
  label: string
  description: string
}

const PENDING_REPLY_REVEAL_DELAY_MS = 180

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

function mapTicketEventToActivityItem(
  item: TicketTimelineEvent
): ActivityTimelineItem {
  return {
    id: item.id,
    title: item.title,
    detail: item.detail,
    timestamp: item.timestamp,
    tone: item.tone ?? "neutral",
  }
}

function KnowledgeArticleLinkCard({
  article,
  className,
}: {
  article: TicketLinkedArticle
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background p-3 text-left",
        className
      )}
    >
      <div className="truncate text-xs font-medium text-primary">
        {article.url}
      </div>
      <div className="mt-2 border-l-2 border-primary pl-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <IconFileText className="size-4 text-muted-foreground" />
          <span className="truncate">{article.title}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {article.category}
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {article.summary}
        </p>
      </div>
    </div>
  )
}

function TimelineMessageCard({ item }: { item: TicketTimelineMessage }) {
  const isOutbound = item.direction === "outbound"

  return (
    <DiscussionMessageEntry
      author={item.author}
      timestamp={item.timestamp}
      body={item.body}
      attachment={
        item.linkedArticle ? (
          <KnowledgeArticleLinkCard article={item.linkedArticle} />
        ) : null
      }
      badges={
        <>
          <Badge
            variant="outline"
            className="h-5 rounded-full px-2 text-[11px]"
          >
            {channelLabel[item.channel]}
          </Badge>
          {isOutbound ? (
            <Badge
              variant="secondary"
              className="h-5 rounded-full px-2 text-[11px]"
            >
              Reply
            </Badge>
          ) : null}
        </>
      }
    />
  )
}

export function ConversationTabContent({
  conversationItems,
  pendingReply,
  isSendingReply,
  ticket,
  currentUser,
  replyAccounts,
  selectedReplyAccount,
  replyFrom,
  onReplyFromChange,
  onManageAccounts,
  draftMessage,
  onDraftMessageChange,
  linkedArticle,
  templateQuery,
  onTemplateQueryChange,
  onMacroInsert,
  onSubmitReply,
}: {
  conversationItems: Array<TicketTimelineMessage | TicketTimelineEvent>
  pendingReply?: {
    id: string
    body: string
    linkedArticle?: TicketLinkedArticle
  } | null
  isSendingReply: boolean
  ticket: Ticket
  currentUser: PersonLike
  replyAccounts: readonly ReplyAccount[]
  selectedReplyAccount?: ReplyAccount
  replyFrom: string
  onReplyFromChange: (nextAddress: string) => void
  onManageAccounts: () => void
  draftMessage: string
  onDraftMessageChange: (nextDraft: string) => void
  linkedArticle?: KnowledgeArticle | null
  templateQuery: string
  onTemplateQueryChange: (nextValue: string) => void
  onMacroInsert: (macro: string) => void
  onSubmitReply: (nextStatus?: TicketQueueStatus) => void
}) {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const bottomAnchorRef = React.useRef<HTMLDivElement | null>(null)
  const revealTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [visiblePendingReply, setVisiblePendingReply] =
    React.useState<typeof pendingReply>(null)

  const filteredMacros = macroSuggestions.filter((macro) =>
    macro.toLowerCase().includes(templateQuery.trim().toLowerCase())
  )

  React.useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!pendingReply) {
      setVisiblePendingReply(null)
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current)
      }
      return
    }

    const scrollContainer = scrollContainerRef.current
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current)
    }

    setVisiblePendingReply(null)

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      })
    }

    revealTimeoutRef.current = setTimeout(() => {
      setVisiblePendingReply(pendingReply)
    }, PENDING_REPLY_REVEAL_DELAY_MS)
  }, [pendingReply])

  React.useEffect(() => {
    const bottomAnchor = bottomAnchorRef.current
    if (!bottomAnchor) return

    const frameId = window.requestAnimationFrame(() => {
      bottomAnchor.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [visiblePendingReply, conversationItems.length])

  return (
    <DiscussionThreadContent
      scrollContainerRef={scrollContainerRef}
      bottomAnchorRef={bottomAnchorRef}
      composer={
        <DiscussionComposerShell
        currentUser={currentUser}
        header={
          <>
            <span className="text-muted-foreground">Via</span>
            <Badge
              variant="secondary"
              className="h-8 rounded-full px-3 font-medium"
            >
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
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={onManageAccounts}>
                    Manage accounts
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      >
        <textarea
          value={draftMessage}
          onChange={(event) => onDraftMessageChange(event.target.value)}
          placeholder="Comment or type '/' for commands"
          disabled={isSendingReply}
          className="min-h-40 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        {linkedArticle ? (
          <div className="border-t px-4 py-3">
            <KnowledgeArticleLinkCard
              article={{
                title: linkedArticle.title,
                url: getKnowledgeArticleUrl(linkedArticle),
                category: getKnowledgeArticleCategoryLabel(linkedArticle),
                summary: linkedArticle.summary,
              }}
            />
          </div>
        ) : null}

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
                        disabled={isSendingReply}
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
                        disabled={isSendingReply}
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
                disabled={isSendingReply}
              >
                {isSendingReply ? "Sending..." : "End Chat"}
              </Button>
              <Button
                type="button"
                className="h-9 rounded-xl px-4"
                onClick={() => onSubmitReply()}
                disabled={!draftMessage.trim() || isSendingReply}
              >
                {isSendingReply ? "Sending..." : "Send"}
                <IconSend className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </DiscussionComposerShell>
      }
    >
      {conversationItems.map((item) => {
        if (item.kind === "message") {
          return <TimelineMessageCard key={item.id} item={item} />
        }

        return (
          <ActivityTimelineEventItem
            key={item.id}
            item={mapTicketEventToActivityItem(item)}
          />
        )
      })}
      {visiblePendingReply ? (
        <div
          key={visiblePendingReply.id}
          className="animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <DiscussionMessageEntry
            author={currentUser}
            timestamp="Sending..."
            body={visiblePendingReply.body}
            attachment={
              visiblePendingReply.linkedArticle ? (
                <KnowledgeArticleLinkCard
                  article={visiblePendingReply.linkedArticle}
                />
              ) : null
            }
            className="opacity-72 transition-opacity"
            badges={
              <Badge
                variant="secondary"
                className="h-5 rounded-full px-2 text-[11px]"
              >
                Sending
              </Badge>
            }
          />
        </div>
      ) : null}
    </DiscussionThreadContent>
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
  const mappedActivityItems = activityItems.map(mapTicketEventToActivityItem)

  return <SharedActivityTabContent items={mappedActivityItems} />
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
    <SharedInternalNotesTabContent
      notes={notes}
      currentUser={currentUser}
      noteDraft={noteDraft}
      onNoteDraftChange={onNoteDraftChange}
      onAddNote={onAddNote}
    />
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
  onInsertKnowledgeArticle,
  onCreateKnowledgeArticle,
  isSendingReply = false,
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
  onInsertKnowledgeArticle: (article: KnowledgeArticle) => void
  onCreateKnowledgeArticle: () => void
  isSendingReply?: boolean
}) {
  return (
    <DetailRightPanelShell
      open={open}
      sections={rightPanelSections}
      activeSection={activeSection}
      onToggleOpen={onToggleOpen}
      onSelectSection={onSelectSection}
      renderSection={() => (
        <>
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
              <DetailStat
                label="Health"
                value={<TicketTag tone={ticket.health} />}
              />
              <DetailStat
                label="Channel"
                value={channelLabel[ticket.channel]}
              />
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
                <DiscussionAvatar person={detail.customer} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    {detail.customer.name}
                  </div>
                  <div className="text-sm text-muted-foreground">Requester</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <DiscussionAvatar person={assignee} />
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
                    Reply from {selectedReplyAccountLabel ?? "Support"} and keep
                    the thread in sync.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "knowledge" ? (
            <TicketKnowledgePanel
              onInsertArticle={onInsertKnowledgeArticle}
              onCreateArticle={onCreateKnowledgeArticle}
              isSendingReply={isSendingReply}
            />
          ) : null}
        </>
      )}
    />
  )
}
