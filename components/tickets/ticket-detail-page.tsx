"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { arrayMove } from "@dnd-kit/sortable"
import { SupportIcon } from "./remote-assist/support-icons"
import {
  IconArrowLeft,
  IconArrowsJoin,
  IconCheck,
  IconChevronDown,
  IconDots,
  IconPhone,
  IconRotateClockwise,
  IconUsers,
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { useTicketAssignment } from "./use-ticket-assignment"
import { TicketAgentPanel } from "./ticket-agent-panel"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { SessionScenarioItems } from "./remote-assist/session-scenarios"
import { ticketContacts } from "@/lib/tickets/detail-data"
import { supportAgents } from "@/lib/tickets/agents"
import { uniqueRecipientContacts } from "@/lib/tickets/remote-assist/recipient-suggestions"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { useRemoteAssist } from "./remote-assist/use-remote-assist"
import { RemoteInviteDialog } from "./remote-assist/remote-invite-dialog"
import { RemoteSessionWorkspace } from "./remote-assist/remote-session-workspace"
import { PhoneSupportPanel } from "./remote-assist/phone-support-panel"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { defaultInvitation } from "@/lib/tickets/remote-assist/mock-data"
import {
  sessionTimeline,
  timeLabel,
} from "@/lib/tickets/remote-assist/presentation"
import type { RemoteSession } from "@/lib/tickets/remote-assist/types"
import {
  SideConversationProvider,
  SideConversationLauncher,
  useSideConversation,
} from "./ticket-side-conversation"

type TicketDetailPageProps = {
  ticket: Ticket
  detail: TicketDetail
  initialTab?: TicketDetailTab
}

type CreateTicketTaskPayload = {
  id: string
  title: string
}

function TicketDetailPageContent({
  ticket: initialTicket,
  detail,
  initialTab = "conversation",
}: TicketDetailPageProps) {
  const [ticket, setTicket] = useState(initialTicket)
  const [peopleOpen, setPeopleOpen] = useState(false)
  const sideConversation = useSideConversation()
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
  const [ticketToast, setTicketToast] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [resendSource, setResendSource] = useState<RemoteSession | null>(null)
  const [resetSupportOpen, setResetSupportOpen] = useState(false)

  const { handleTransfer, handleFollowersChange } = useTicketAssignment({
    ticket,
    setTicket,
    setTimeline,
    notify: setTicketToast,
  })

  const isRightPanelOpen =
    !isMobile && (isDesktopRightPanelOpen || sideConversation.desktopActive)

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

  const agent = ticket.assignee ?? {
    name: currentUser.name,
    avatarUrl: currentUser.avatar,
    email: currentUser.email,
  }
  const support = useRemoteAssist(ticket, detail.customer, {
    name: currentUser.name,
    avatarUrl: currentUser.avatar,
    email: currentUser.email,
  })
  const assistId = searchParams.get("assist")
  const invitationContacts = useMemo(
    () =>
      uniqueRecipientContacts([
        detail.customer,
        ...ticketContacts,
        ...supportAgents,
        ...support.sessions.flatMap((session) => [
          session.customer,
          ...(session.recipientEmails ?? []).map((email) => ({
            name: email,
            email,
          })),
        ]),
      ]),
    [detail.customer, support.sessions]
  )
  const selectedSession = support.sessions.find(
    (session) => session.id === assistId
  )
  const conversationItems = [
    ...timeline,
    ...sessionTimeline(support.sessions),
  ].filter((item) => item.kind === "message" || item.kind === "event")
  const activityItems = [
    ...timeline,
    ...support.sessions.flatMap((session) =>
      session.events.map((event) => ({
        id: event.id,
        kind: "event" as const,
        timestamp: timeLabel(event.at),
        title: event.title,
        detail: event.detail,
      }))
    ),
  ].filter((item): item is TicketTimelineEvent => item.kind === "event")
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

  const openSupportSession = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("assist", id)
    router.replace(`${pathname}?${params}`, { scroll: false })
  }
  const closeSupportSession = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("assist")
    params.set("tab", "conversation")
    router.replace(`${pathname}?${params}`, { scroll: false })
  }
  const endSupportSession = (session: RemoteSession) => {
    support.update(session.id, { type: "end", at: Date.now() })
    closeSupportSession()
  }
  const resendSupportInvitation = (session: RemoteSession) => {
    closeSupportSession()
    setResendSource(session)
    setInviteOpen(true)
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

    setTicketToast(
      `${selectedTickets.length + 1} tickets merged into ${destinationLabel}`
    )
  }

  useEffect(() => {
    if (!ticketToast) return
    // Keep the toast fully visible for four seconds after its entrance.
    const timer = window.setTimeout(
      () => setTicketToast(null),
      MERGE_TOAST_LIFETIME_MS
    )
    return () => window.clearTimeout(timer)
  }, [ticketToast])

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

  if (selectedSession?.kind === "remote") {
    return (
      <RemoteSessionWorkspace
        key={selectedSession.id}
        session={selectedSession}
        now={support.now}
        ticket={ticket}
        detail={detail}
        queueStatus={queueStatus}
        assignee={assignee}
        onAction={(action) => support.update(selectedSession.id, action)}
        onBack={() => router.push("/tickets")}
        onEnd={() => endSupportSession(selectedSession)}
        onResend={() => resendSupportInvitation(selectedSession)}
        onTransfer={handleTransfer}
        onFollowersChange={handleFollowersChange}
        onCreateArticle={handleCreateKnowledgeArticle}
      />
    )
  }

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
                <DropdownMenuItem
                  disabled={
                    !support.hydrated || support.active?.kind === "phone"
                  }
                  onClick={() => {
                    if (support.active) openSupportSession(support.active.id)
                    else {
                      setResendSource(null)
                      setInviteOpen(true)
                    }
                  }}
                >
                  <SupportIcon name="menu-monitor" />
                  Remote Assist
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={
                    !support.hydrated || support.active?.kind === "remote"
                  }
                  onClick={() => {
                    if (support.active) openSupportSession(support.active.id)
                    else {
                      const id = support.create(
                        defaultInvitation(detail.customer, ticket),
                        "phone"
                      )
                      if (id) openSupportSession(id)
                    }
                  }}
                >
                  <IconPhone className="size-4" stroke={1.5} />
                  Call customer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateTab("activity")}>
                  <SupportIcon name="menu-list" />
                  View activity log
                </DropdownMenuItem>
                {support.active?.kind === "phone" && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <IconPhone className="size-4" stroke={1.5} />
                      Call scenarios
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-[70dvh] w-64 overflow-y-auto">
                      <SessionScenarioItems
                        session={support.active}
                        onAction={(action) =>
                          support.update(support.active!.id, action)
                        }
                      />
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                <DropdownMenuItem onClick={() => updateTab("notes")}>
                  <SupportIcon name="menu-file" />
                  Open internal notes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/tickets")}>
                  <SupportIcon name="menu-back" />
                  Back to ticket list
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!support.sessions.length && !support.error}
                  onClick={() => setResetSupportOpen(true)}
                >
                  <IconRotateClockwise className="size-4" stroke={1.5} />
                  Reset Remote Assist demo
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

      {assistId && support.hydrated && !selectedSession && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
        >
          This demo session is not available in this browser tab.
          <Button variant="outline" size="sm" onClick={closeSupportSession}>
            Return to ticket
          </Button>
        </div>
      )}
      {support.error && (
        <p role="status" className="shrink-0 text-sm text-destructive">
          {support.error}
        </p>
      )}
      <Button
        variant="outline"
        className="self-end xl:hidden"
        onClick={() => setPeopleOpen(true)}
      >
        <IconUsers className="size-4" />
        People & assignment
      </Button>
      <SideConversationLauncher />
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
                onOpenSession={openSupportSession}
                onSessionAction={support.update}
                onResendSession={resendSupportInvitation}
                sessionNow={support.now}
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
          onToggleOpen={() => {
            if (sideConversation.desktopActive)
              setActiveRightPanelSection("details")
            sideConversation.setDesktopActive(false)
            setIsDesktopRightPanelOpen(!isRightPanelOpen)
          }}
          activeSection={activeRightPanelSection}
          onSelectSection={(nextSection) => {
            setActiveRightPanelSection(nextSection)
            setIsDesktopRightPanelOpen(true)
          }}
          queueStatus={queueStatus}
          ticket={ticket}
          detail={detail}
          assignee={assignee}
          onTransfer={handleTransfer}
          onFollowersChange={handleFollowersChange}
          selectedReplyAccountLabel={selectedReplyAccount?.label}
          onInsertKnowledgeArticle={insertKnowledgeArticle}
          onCreateKnowledgeArticle={handleCreateKnowledgeArticle}
          isSendingReply={isSendingReply}
        />
      </div>

      <Sheet open={peopleOpen} onOpenChange={setPeopleOpen}>
        <SheetContent className="data-[side=right]:w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>People & assignment</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <TicketAgentPanel
              ticket={ticket}
              onTransfer={handleTransfer}
              onFollowersChange={handleFollowersChange}
            />
          </div>
        </SheetContent>
      </Sheet>

      <MergeTicketsDialog
        open={isMergeDialogOpen}
        onOpenChange={setIsMergeDialogOpen}
        currentTicket={ticket}
        tickets={tickets}
        unavailableTicketIds={mergedTicketIds}
        onMerge={handleMergeTickets}
      />

      {inviteOpen && (
        <RemoteInviteDialog
          contacts={invitationContacts}
          customer={resendSource?.customer ?? detail.customer}
          initialDraft={
            resendSource
              ? {
                  email: resendSource.customer.email ?? "",
                  recipients: resendSource.recipientEmails,
                  subject: resendSource.subject,
                  message: resendSource.invitationMessage,
                }
              : defaultInvitation(detail.customer, ticket)
          }
          onClose={() => {
            setInviteOpen(false)
            setResendSource(null)
          }}
          onSend={(draft) => {
            const id = support.create(draft)
            if (!id) return false
            setInviteOpen(false)
            setResendSource(null)
            updateTab("conversation")
            return true
          }}
        />
      )}
      {support.active?.kind === "phone" && (
        <PhoneSupportPanel
          key={support.active.id}
          session={support.active}
          now={support.now}
          onAction={(action) => support.update(support.active!.id, action)}
          onEnd={() => endSupportSession(support.active!)}
        />
      )}
      <ConfirmDialog
        open={resetSupportOpen}
        onOpenChange={setResetSupportOpen}
        title="Reset Remote Assist demo?"
        description="This clears only the remote sessions and calls saved in this browser tab for this ticket."
        confirmLabel="Reset demo"
        onConfirm={() => {
          support.reset()
          closeSupportSession()
          setResetSupportOpen(false)
        }}
      />

      {ticketToast ? (
        <div
          role="status"
          aria-live="polite"
          className="merge-completion-toast fixed top-4 left-1/2 z-[80] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-popover px-4 py-3 text-sm font-medium text-popover-foreground shadow-xl"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <IconCheck className="size-3.5" />
          </span>
          {ticketToast}
        </div>
      ) : null}
    </div>
  )
}

export function TicketDetailPage(props: TicketDetailPageProps) {
  return (
    <SideConversationProvider key={props.ticket.id} ticket={props.ticket}>
      <TicketDetailPageContent {...props} />
    </SideConversationProvider>
  )
}
