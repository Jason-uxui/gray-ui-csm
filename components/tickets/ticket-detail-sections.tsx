import * as React from "react"
import Image from "next/image"
import {
  IconArrowLeft,
  IconChevronDown,
  IconCopy,
  IconDots,
  IconFileText,
  IconMicrophone,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconPlus,
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
import { knowledgeArticles } from "@/lib/knowledge-base/mock-data"
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
        "rounded-xl border bg-background p-3 text-left shadow-sm",
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

function TimelineEntry({
  author,
  timestamp,
  badges,
  body,
  linkedArticle,
  className,
}: {
  author: PersonLike
  timestamp: string
  badges?: React.ReactNode
  body: string
  linkedArticle?: TicketLinkedArticle
  className?: string
}) {
  return (
    <div className={cn("flex gap-3", className)}>
      <TimelineAvatar person={author} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{author.name}</span>
          <span className="text-muted-foreground">{timestamp}</span>
          {badges}
        </div>
        <div className="mt-2 text-sm leading-6 text-foreground">{body}</div>
        {linkedArticle ? (
          <KnowledgeArticleLinkCard
            article={linkedArticle}
            className="mt-3 max-w-xl"
          />
        ) : null}
      </div>
    </div>
  )
}

function TimelineMessageCard({ item }: { item: TicketTimelineMessage }) {
  const isOutbound = item.direction === "outbound"

  return (
    <TimelineEntry
      author={item.author}
      timestamp={item.timestamp}
      body={item.body}
      linkedArticle={item.linkedArticle}
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

function ComposerShell({
  currentUser,
  header,
  children,
}: {
  currentUser: PersonLike
  header?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="shrink-0 bg-background/95 px-6 py-5 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <TimelineAvatar person={currentUser} />
        <div className="min-w-0 flex-1 overflow-hidden rounded-3xl border bg-background shadow-sm">
          {header ? (
            <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3 text-sm">
              {header}
            </div>
          ) : null}
          {children}
        </div>
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
  linkedArticle,
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
  linkedArticle?: KnowledgeArticle | null
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

            return (
              <ActivityTimelineEventItem
                key={item.id}
                item={mapTicketEventToActivityItem(item)}
              />
            )
          })}
        </div>
      </div>

      <ComposerShell
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
          className="min-h-40 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        {linkedArticle ? (
          <div className="border-t px-4 py-3">
            <KnowledgeArticleLinkCard
              article={{
                title: linkedArticle.title,
                url: getArticleUrl(linkedArticle),
                category: getArticleCategoryLabel(linkedArticle),
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
      </ComposerShell>
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
                    Reply from {selectedReplyAccountLabel ?? "Support"} and keep
                    the thread in sync.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "knowledge" ? (
            <TicketKnowledgePanel
              ticket={ticket}
              onInsertArticle={onInsertKnowledgeArticle}
              onCreateArticle={onCreateKnowledgeArticle}
            />
          ) : null}
        </>
      )}
    />
  )
}

function TicketKnowledgePanel({
  ticket: _ticket,
  onInsertArticle,
  onCreateArticle,
}: {
  ticket: Ticket
  onInsertArticle: (article: KnowledgeArticle) => void
  onCreateArticle: () => void
}) {
  const [selectedArticle, setSelectedArticle] =
    React.useState<KnowledgeArticle | null>(null)
  const [articleQuery, setArticleQuery] = React.useState("")
  const normalizedQuery = articleQuery.trim().toLowerCase()
  const filterArticle = (article: KnowledgeArticle) => {
    if (!normalizedQuery) return true

    return [article.title, article.summary, article.category]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  }
  const filteredArticles = knowledgeArticles.filter(filterArticle)

  if (selectedArticle) {
    return (
      <KnowledgeArticlePreview
        article={selectedArticle}
        onBack={() => setSelectedArticle(null)}
        onInsertArticle={onInsertArticle}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={articleQuery}
            onChange={(event) => setArticleQuery(event.target.value)}
            placeholder="Search articles..."
            className="h-11 rounded-xl border-border/70 bg-background pl-9 text-sm"
          />
        </div>
        <Button
          type="button"
          variant="default"
          size="icon-lg"
          className="size-11 shrink-0 rounded-xl"
          onClick={onCreateArticle}
          aria-label="Create new article"
        >
          <IconPlus className="size-4" />
        </Button>
      </div>

      <KnowledgeArticleList
        articles={filteredArticles}
        onPreviewArticle={setSelectedArticle}
        onInsertArticle={onInsertArticle}
      />
    </div>
  )
}

function getArticleCategoryLabel(article: KnowledgeArticle) {
  if (article.category === "subscription") return "Tickets & workflows"
  if (article.category === "technical") return "Tickets & workflows"
  if (article.category === "billing") return "Billing"
  if (article.category === "account-login") return "Settings"
  return "Help center"
}

function getArticleUrl(article: KnowledgeArticle) {
  return `https://help.graycsm.local/articles/${article.id}`
}

function KnowledgeArticleList({
  articles,
  onPreviewArticle,
  onInsertArticle,
}: {
  articles: KnowledgeArticle[]
  onPreviewArticle: (article: KnowledgeArticle) => void
  onInsertArticle: (article: KnowledgeArticle) => void
}) {
  if (articles.length === 0) {
    return (
      <section>
        <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          No matching articles.
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="space-y-1">
        {articles.map((article) => (
          <article
            key={article.id}
            className="rounded-xl px-2 py-2 transition hover:bg-muted/50"
          >
            <div className="flex items-start gap-3">
              <div className="grid min-w-0 flex-1 grid-cols-[auto_1fr] items-start gap-x-3">
                <span className="pt-0.5 text-muted-foreground">
                  <IconFileText className="size-4" />
                </span>
                <div className="min-w-0 pr-1">
                  <button
                    type="button"
                    className="min-w-0 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    onClick={() => onPreviewArticle(article)}
                  >
                    <span className="block truncate text-sm font-semibold leading-5 text-foreground">
                      {article.title}
                    </span>
                    <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs">
                      <span className="truncate text-muted-foreground">
                        {getArticleCategoryLabel(article)}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="shrink-0 text-muted-foreground">
                        {article.updatedAt.replace("Updated ", "")}
                      </span>
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="mt-1 h-6 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => onInsertArticle(article)}
                  >
                    <IconPlus className="size-3.5" />
                    <span className="underline underline-offset-2">Suggest article</span>
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="mt-0.5 shrink-0 text-muted-foreground"
                aria-label={`More actions for ${article.title}`}
              >
                <IconDots className="size-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function KnowledgeArticlePreview({
  article,
  onBack,
  onInsertArticle,
}: {
  article: KnowledgeArticle
  onBack: () => void
  onInsertArticle: (article: KnowledgeArticle) => void
}) {
  const imageMedia =
    article.media?.filter((media) => media.type === "image") ?? []

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="ghost"
        className="h-8 rounded-xl px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={onBack}
      >
        <IconArrowLeft className="size-4" />
        Back
      </Button>

      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
          <IconFileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {article.title}
          </h3>
          <div className="mt-1 flex min-w-0 items-center gap-1 text-xs">
            <span className="truncate text-muted-foreground">
              {getArticleCategoryLabel(article)}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="shrink-0 text-muted-foreground">
              {article.updatedAt.replace("Updated ", "")}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <p className="text-sm leading-6 text-foreground/80">
        {article.summary}
      </p>

      {imageMedia.length ? (
        <div className="space-y-3">
          {imageMedia.map((media) => (
              <div
                key={media.title}
                className="overflow-hidden rounded bg-background"
              >
                {media.src ? (
                  <Image
                    src={media.src}
                    alt={media.title}
                    width={720}
                    height={405}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="aspect-video bg-muted" />
                )}
              </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {article.quickPath ? (
          <div className="rounded-xl border bg-muted/30 p-3 text-sm leading-6">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
              Path
            </div>
            <div className="mt-1 text-foreground/85">{article.quickPath}</div>
          </div>
        ) : null}

        {article.sections.map((section, index) => {
          const isReply = section.title
            .toLowerCase()
            .includes("suggested customer reply")

          return (
            <section key={section.title} className="flex gap-3 text-sm leading-6">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-foreground">
                  {section.title}
                </h4>
                <p
                  className={cn(
                    "mt-1 text-foreground/75",
                    isReply &&
                      "rounded-xl border bg-muted/30 px-3 py-2 text-foreground/80"
                  )}
                >
                  {section.body}
                </p>
              </div>
            </section>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={() => onInsertArticle(article)}
        >
          <IconPlus className="size-4" />
          <span className="underline underline-offset-2">Suggest article</span>
        </Button>
        <Button type="button" variant="outline" className="h-10 rounded-xl">
          <IconCopy className="size-4" />
          Copy link
        </Button>
      </div>
    </div>
  )
}
