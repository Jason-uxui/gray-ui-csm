"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { arrayMove } from "@dnd-kit/sortable"
import {
  IconArrowLeft,
  IconArrowsJoin,
  IconCheck,
  IconChevronDown,
  IconDots,
} from "@tabler/icons-react"

import {
  detailTabs,
  getAssigneePerson,
  getTicketNumberLabel,
  getTicketTypeLabel,
  type RightPanelSection,
  statusLabel,
  statusToneClassName,
  channelLabel,
  priorityLabel,
} from "@/components/tickets/ticket-detail-helpers"
import {
  ActivityTabContent,
  ConversationTabContent,
  NotesTabContent,
  TaskTabContent,
  TicketDetailRightPanel,
} from "@/components/tickets/ticket-detail-sections"
import { TicketPriorityIndicator } from "@/components/ticket-priority-indicator"
import { MergeTicketsDialog } from "@/components/tickets/merge-tickets-dialog"
import { useTicketReplyFlow } from "@/components/tickets/use-ticket-reply-flow"
import { useTicketTasks } from "@/components/tickets/use-ticket-tasks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MERGE_TOAST_LIFETIME_MS,
  waitForMergePreview,
} from "@/lib/tickets/merge-motion"
import { currentUser, replyFromAccounts } from "@/lib/current-user"
import type {
  Ticket,
  TicketPerson,
  TicketQueueStatus,
} from "@/lib/tickets/types"
import type {
  TicketDetail,
  TicketDetailTab,
  TicketNote,
  TicketTask,
  TicketTimelineEvent,
  TicketTimelineItem,
} from "@/lib/tickets/detail-data"
import { createTicketTask, createTicketTaskId } from "@/lib/tickets/task-utils"
import { tickets } from "@/lib/tickets/mock-data"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type TicketDetailPageProps = {
  ticket: Ticket
  detail: TicketDetail
  initialTab?: TicketDetailTab
}

type CreateTicketTaskPayload = {
  id: string
  title: string
}

export function TicketDetailPage({
  ticket,
  detail,
  initialTab = "conversation",
}: TicketDetailPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchTab = searchParams.get("tab")
  const isMobile = useIsMobile()

  const [queueStatus, setQueueStatus] = useState<TicketQueueStatus>(
    ticket.queueStatus
  )
  const [timeline, setTimeline] = useState(detail.timeline)
  const { tasks, updateTasks } = useTicketTasks(ticket.id, detail.tasks)
  const [notes, setNotes] = useState(detail.notes)
  const [noteDraft, setNoteDraft] = useState("")
  const [isDesktopRightPanelOpen, setIsDesktopRightPanelOpen] = useState(true)
  const [activeRightPanelSection, setActiveRightPanelSection] =
    useState<RightPanelSection>("details")
  const [replyFrom, setReplyFrom] = useState<string>(
    replyFromAccounts[0]?.address ?? ""
  )
  const [templateQuery, setTemplateQuery] = useState("")
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false)
  const [mergeToast, setMergeToast] = useState<string | null>(null)

  const isRightPanelOpen = !isMobile && isDesktopRightPanelOpen

  const selectedReplyAccount =
    replyFromAccounts.find((account) => account.address === replyFrom) ??
    replyFromAccounts[0]

  const taskAssigneeOptions = useMemo(() => {
    const optionsMap = new Map<string, TicketPerson>()

    const pushOption = (person?: TicketPerson) => {
      if (!person?.name) return
      if (optionsMap.has(person.name)) return
      optionsMap.set(person.name, person)
    }

    pushOption(ticket.assignee)
    pushOption(ticket.requester)
    pushOption(detail.customer)
    pushOption({
      name: currentUser.name,
      email: currentUser.email,
      avatarUrl: currentUser.avatar,
    })
    notes.forEach((note) => pushOption(note.author))

    return Array.from(optionsMap.values())
  }, [detail.customer, notes, ticket.assignee, ticket.requester])

  const conversationItems = timeline.filter(
    (item) => item.kind === "message" || item.kind === "event"
  )
  const activityItems = timeline.filter(
    (item): item is TicketTimelineEvent => item.kind === "event"
  )
  const mergedTicketIds = useMemo(
    () =>
      timeline.flatMap((item) =>
        item.kind === "event" && item.mergeDetails
          ? item.mergeDetails.tickets
              .map((mergedTicket) => mergedTicket.id)
              .filter((id) => id !== ticket.id)
          : []
      ),
    [ticket.id, timeline]
  )

  const agent = ticket.assignee ?? {
    name: currentUser.name,
    avatarUrl: currentUser.avatar,
    email: currentUser.email,
  }

  const activeTab = detailTabs.some((tab) => tab.value === searchTab)
    ? (searchTab as TicketDetailTab)
    : initialTab

  const updateTab = (nextTab: TicketDetailTab) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("tab", nextTab)

    router.replace(`${pathname}?${nextSearchParams.toString()}`, {
      scroll: false,
    })
  }

  const appendTimelineEvent = (event: TicketTimelineItem) => {
    setTimeline((currentTimeline) => [...currentTimeline, event])
  }

  const handleMergeTickets = async (
    selectedTickets: Ticket[],
    note: string,
    signal: AbortSignal
  ) => {
    // Local preview only: make the pending state observable and cancellable.
    // A production integration should await its API transaction here instead.
    await waitForMergePreview(signal)
    const mergedTicketLabels = selectedTickets
      .map((selectedTicket) => getTicketNumberLabel(selectedTicket))
      .join(", ")
    const destinationLabel = getTicketNumberLabel(ticket)

    appendTimelineEvent({
      id: `${ticket.id}-merge-${Date.now()}`,
      kind: "event",
      timestamp: "Now",
      title: "Tickets merged",
      detail: `${mergedTicketLabels} merged into ${destinationLabel}${
        note ? ` · ${note}` : ""
      }`,
      tone: "success",
      mergeDetails: {
        author: {
          name: currentUser.name,
          avatarUrl: currentUser.avatar,
          email: currentUser.email,
        },
        destinationLabel,
        tickets: [ticket, ...selectedTickets].map((mergedTicket) => ({
          id: mergedTicket.id,
          label: getTicketNumberLabel(mergedTicket),
          subject: mergedTicket.subject,
          queueStatus: mergedTicket.queueStatus,
        })),
        note: note || undefined,
      },
    })

    setMergeToast(
      `${selectedTickets.length + 1} tickets merged into ${destinationLabel}`
    )
  }

  useEffect(() => {
    if (!mergeToast) return
    // Keep the toast fully visible for four seconds after its entrance.
    const timer = window.setTimeout(
      () => setMergeToast(null),
      MERGE_TOAST_LIFETIME_MS
    )
    return () => window.clearTimeout(timer)
  }, [mergeToast])

  const handleAddInternalNote = () => {
    const trimmedNote = noteDraft.trim()
    if (!trimmedNote) return

    const nextNote: TicketNote = {
      id: `${ticket.id}-note-${Date.now()}`,
      author: agent,
      timestamp: "Now",
      body: trimmedNote,
    }

    setNotes((currentNotes) => [nextNote, ...currentNotes])
    appendTimelineEvent({
      id: `${ticket.id}-internal-note-${Date.now()}`,
      kind: "note",
      timestamp: "Now",
      author: agent,
      body: trimmedNote,
    })
    setNoteDraft("")
  }

  const handleCreateKnowledgeArticle = () => {
    router.push(`/knowledge-base?sourceTicket=${ticket.id}`)
  }

  const handleToggleTask = (taskId: string) => {
    updateTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === taskId
          ? {
              ...currentTask,
              status: currentTask.status === "done" ? "todo" : "done",
            }
          : currentTask
      )
    )
  }

  const handleCreateTask = ({ id, title }: CreateTicketTaskPayload) => {
    updateTasks((currentTasks) => [
      createTicketTask({ id, title, assignee: ticket.assignee }),
      ...currentTasks,
    ])
  }

  const handleUpdateTask = (
    taskId: string,
    patch: Partial<Pick<TicketTask, "title" | "status" | "due" | "assignee">>
  ) => {
    updateTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === taskId ? { ...currentTask, ...patch } : currentTask
      )
    )
  }

  const handleDuplicateTask = (taskId: string) => {
    updateTasks((currentTasks) => {
      const index = currentTasks.findIndex(
        (currentTask) => currentTask.id === taskId
      )
      if (index < 0) return currentTasks

      const sourceTask = currentTasks[index]
      const duplicatedTask: TicketTask = {
        ...sourceTask,
        id: createTicketTaskId(ticket.id),
        title: `${sourceTask.title} (copy)`,
      }

      const nextTasks = [...currentTasks]
      nextTasks.splice(index + 1, 0, duplicatedTask)
      return nextTasks
    })
  }

  const handleDeleteTask = (taskId: string) => {
    updateTasks((currentTasks) =>
      currentTasks.filter((currentTask) => currentTask.id !== taskId)
    )
  }

  const handleReorderTasks = (activeTaskId: string, overTaskId: string) => {
    updateTasks((currentTasks) => {
      const fromIndex = currentTasks.findIndex(
        (currentTask) => currentTask.id === activeTaskId
      )
      const toIndex = currentTasks.findIndex(
        (currentTask) => currentTask.id === overTaskId
      )

      if (fromIndex < 0 || toIndex < 0) return currentTasks

      return arrayMove(currentTasks, fromIndex, toIndex)
    })
  }

  const ticketNumberLabel = getTicketNumberLabel(ticket)
  const assignee = getAssigneePerson(ticket)
  const {
    draftLinkedArticle,
    draftMessage,
    insertKnowledgeArticle,
    insertMacro,
    isSendingReply,
    pendingReply,
    setDraftMessage,
    submitReply,
  } = useTicketReplyFlow({
    activeTab,
    agent,
    onAppendTimelineItem: appendTimelineEvent,
    onQueueStatusChange: setQueueStatus,
    onSwitchToConversationTab: () => updateTab("conversation"),
    ticket,
  })

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-center justify-between gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-2 sm:px-3"
          onClick={() => router.push("/tickets")}
          aria-label="Back to tickets"
        >
          <IconArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to Tickets</span>
          <span className="sr-only sm:hidden">Back to Tickets</span>
        </Button>
        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-9 rounded-xl"
                  aria-label="More actions"
                />
              }
            >
              <IconDots className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => updateTab("activity")}>
                  View activity log
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateTab("notes")}>
                  Open internal notes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/tickets")}>
                  Back to ticket list
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="size-9 rounded-xl"
                  aria-label="Merge tickets"
                  onClick={() => setIsMergeDialogOpen(true)}
                />
              }
            >
              <IconArrowsJoin className="size-5" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Merge tickets</TooltipContent>
          </Tooltip>

          <div className="inline-flex overflow-hidden rounded-2xl border border-transparent">
            <Button
              type="button"
              className="flex-1 rounded-r-none sm:flex-none"
              onClick={() => submitReply("closed")}
            >
              <span className="sm:hidden">Close</span>
              <span className="hidden sm:inline">Submit as Closed</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="default"
                    size="icon-sm"
                    className="btn-primary-chrome h-9 rounded-l-none border-l border-l-white/10 px-2"
                    aria-label="More submit actions"
                  />
                }
              >
                <IconChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => submitReply("pending")}>
                    Submit as Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => submitReply("resolved")}>
                    Submit as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => submitReply(undefined)}>
                    Send reply only
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <section className="shrink-0">
        <div className="space-y-3 px-1 pt-1 sm:pt-5 sm:pl-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {ticketNumberLabel}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                statusToneClassName[queueStatus]
              )}
            >
              {statusLabel[queueStatus]}
            </Badge>
            {ticket.escalated ? (
              <Badge
                variant="destructive"
                className="rounded-full px-2.5 py-1 text-[11px]"
              >
                Escalated
              </Badge>
            ) : null}
          </div>

          <h1 className="max-w-5xl text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {ticket.subject}
          </h1>

          <div className="flex items-center gap-4 overflow-x-auto text-sm whitespace-nowrap text-muted-foreground max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden">
            <div className="inline-flex items-center gap-2">
              <span>Channel</span>
              <Badge
                variant="outline"
                className="h-5 rounded-full px-2 text-[11px]"
              >
                {channelLabel[ticket.channel]}
              </Badge>
            </div>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <div className="inline-flex items-center gap-2">
              <span>Type</span>
              <span className="font-medium text-foreground">
                {getTicketTypeLabel(ticket)}
              </span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <TicketPriorityIndicator priority={ticket.priority} />
                Priority
              </span>
              <span className="font-medium text-foreground">
                {priorityLabel[ticket.priority]}
              </span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <div className="inline-flex items-center gap-2">
              <span>Account</span>
              <span className="font-medium text-foreground">
                {detail.accountName}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div
        className={cn(
          "grid min-h-0 flex-1 gap-4",
          isRightPanelOpen
            ? "xl:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)]"
            : "xl:grid-cols-[minmax(0,1fr)_3.5rem]"
        )}
      >
        <section className="min-h-0 overflow-hidden pt-4 sm:pt-8 lg:pt-10">
          <Tabs
            value={activeTab}
            onValueChange={(value) => updateTab(value as TicketDetailTab)}
            className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col"
          >
            <div className="shrink-0 border-b px-4">
              <TabsList
                variant="line"
                className="w-full justify-start gap-2 rounded-none p-0"
              >
                {detailTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent
              value="conversation"
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
            >
              <ConversationTabContent
                conversationItems={conversationItems}
                pendingReply={pendingReply}
                isSendingReply={isSendingReply}
                ticket={ticket}
                currentUser={{
                  name: currentUser.name,
                  avatarUrl: currentUser.avatar,
                  email: currentUser.email,
                }}
                replyAccounts={replyFromAccounts}
                selectedReplyAccount={selectedReplyAccount}
                replyFrom={replyFrom}
                onReplyFromChange={setReplyFrom}
                onManageAccounts={() => router.push("/customers")}
                draftMessage={draftMessage}
                onDraftMessageChange={setDraftMessage}
                linkedArticle={draftLinkedArticle}
                templateQuery={templateQuery}
                onTemplateQueryChange={setTemplateQuery}
                onMacroInsert={insertMacro}
                onSubmitReply={submitReply}
              />
            </TabsContent>

            <TabsContent
              value="task"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <TaskTabContent
                ticketId={ticket.id}
                tasks={tasks}
                assigneeOptions={taskAssigneeOptions}
                onToggleTask={handleToggleTask}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onDuplicateTask={handleDuplicateTask}
                onReorderTasks={handleReorderTasks}
              />
            </TabsContent>

            <TabsContent
              value="activity"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <ActivityTabContent activityItems={activityItems} />
            </TabsContent>

            <TabsContent
              value="notes"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <NotesTabContent
                notes={notes}
                currentUser={{
                  name: currentUser.name,
                  avatarUrl: currentUser.avatar,
                  email: currentUser.email,
                }}
                noteDraft={noteDraft}
                onNoteDraftChange={setNoteDraft}
                onAddNote={handleAddInternalNote}
              />
            </TabsContent>
          </Tabs>
        </section>

        <TicketDetailRightPanel
          open={isRightPanelOpen}
          onToggleOpen={() => setIsDesktopRightPanelOpen((isOpen) => !isOpen)}
          activeSection={activeRightPanelSection}
          onSelectSection={(nextSection) => {
            setActiveRightPanelSection(nextSection)
            setIsDesktopRightPanelOpen(true)
          }}
          queueStatus={queueStatus}
          ticket={ticket}
          detail={detail}
          assignee={assignee}
          selectedReplyAccountLabel={selectedReplyAccount?.label}
          onInsertKnowledgeArticle={insertKnowledgeArticle}
          onCreateKnowledgeArticle={handleCreateKnowledgeArticle}
          isSendingReply={isSendingReply}
        />
      </div>

      <MergeTicketsDialog
        open={isMergeDialogOpen}
        onOpenChange={setIsMergeDialogOpen}
        currentTicket={ticket}
        tickets={tickets}
        unavailableTicketIds={mergedTicketIds}
        onMerge={handleMergeTickets}
      />

      {mergeToast ? (
        <div
          role="status"
          aria-live="polite"
          className="merge-completion-toast fixed top-4 left-1/2 z-[80] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-popover px-4 py-3 text-sm font-medium text-popover-foreground shadow-xl"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <IconCheck className="size-3.5" />
          </span>
          {mergeToast}
        </div>
      ) : null}
    </div>
  )
}
