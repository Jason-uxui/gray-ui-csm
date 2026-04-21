"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconPlus,
  IconX,
} from "@tabler/icons-react"

import { TicketBoard } from "@/components/tickets/ticket-board"
import {
  areTicketAssigneesEqual,
  buildBulkExportCsv,
  formatLocalDateForFilename,
} from "@/components/tickets/tickets-bulk-utils"
import { TicketDrawer } from "@/components/tickets/ticket-drawer"
import { ticketsPageCopy } from "@/components/tickets/tickets-page.copy"
import { TicketSearchToolbar } from "@/components/tickets/ticket-search-toolbar"
import {
  TicketsPageHeader,
  TicketsTableActions,
  TicketsSelectionActionBar,
} from "@/components/tickets/tickets-page-sections"
import { TicketStats } from "@/components/tickets/ticket-stats"
import { TicketTable } from "@/components/tickets/ticket-table"
import { useTicketsPageState } from "@/components/tickets/use-tickets-page-state"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import type { Ticket } from "@/lib/tickets/types"

type TicketsPageProps = {
  initialView?: string | null
  initialLayout?: string | null
}

type BulkFeedbackTone = "success" | "warning" | "error"

type BulkFeedback = {
  id: number
  tone: BulkFeedbackTone
  message: string
  actionLabel?: string
  onAction?: () => void
}

const BULK_FEEDBACK_DURATION_MS = 8_000
const BULK_FEEDBACK_EXIT_MS = 220

export function TicketsPage({
  initialView = "all",
  initialLayout = "board",
}: TicketsPageProps) {
  const {
    isMobile,
    activeLayout,
    handleLayoutModeChange,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    sortPreset,
    setSortPreset,
    stats,
    isStatsExpanded,
    setIsStatsExpanded,
    filteredTickets,
    ticketItems,
    tableToolbarProps,
    setTableToolbarProps,
    visibleAssigneeOptions,
    updateSelectedTickets,
    deleteTicketsByIds,
    restoreTickets,
    handleOpenTicket,
    handleVisibleTicketsChange,
    handleMoveTicket,
    activeTicket,
    drawerMode,
    drawerAssigneeOptions,
    drawerPeopleOptions,
    activeDraft,
    activeReplyFrom,
    drawerOrigin,
    handleDraftMessageChange,
    handleDrawerOpenChange,
    updateTicketItem,
    handleSubmitMessage,
    handleReplyFromAddressChange,
    isDiscardDraftDialogOpen,
    setIsDiscardDraftDialogOpen,
    closeTicketImmediately,
    handleCreateTicket,
  } = useTicketsPageState({ initialView, initialLayout })
  const [bulkFeedback, setBulkFeedback] = useState<BulkFeedback | null>(null)
  const [isBulkFeedbackVisible, setIsBulkFeedbackVisible] = useState(false)
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    open: boolean
    snapshotTickets: Ticket[]
  }>({
    open: false,
    snapshotTickets: [],
  })
  const pageContentRef = useRef<HTMLDivElement | null>(null)
  const [pageContentOverlayStyle, setPageContentOverlayStyle] =
    useState<CSSProperties>({
      left: 0,
      width: "100%",
    })
  const feedbackTimeoutRef = useRef<number | null>(null)
  const feedbackExitTimeoutRef = useRef<number | null>(null)

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
    }
  }, [])

  const clearFeedbackExitTimer = useCallback(() => {
    if (feedbackExitTimeoutRef.current !== null) {
      window.clearTimeout(feedbackExitTimeoutRef.current)
      feedbackExitTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearFeedbackTimer()
      clearFeedbackExitTimer()
    }
  }, [clearFeedbackExitTimer, clearFeedbackTimer])

  const updateOverlayBounds = useCallback(() => {
    const pageContent = pageContentRef.current
    if (!pageContent) return

    const { left, width } = pageContent.getBoundingClientRect()
    const roundedLeft = Math.round(left)
    const roundedWidth = Math.round(width)

    setPageContentOverlayStyle((currentStyle) => {
      if (
        currentStyle.left === roundedLeft &&
        currentStyle.width === `${roundedWidth}px`
      ) {
        return currentStyle
      }

      return {
        left: roundedLeft,
        width: `${roundedWidth}px`,
      }
    })
  }, [])

  useEffect(() => {
    updateOverlayBounds()

    const pageContent = pageContentRef.current
    if (!pageContent || typeof ResizeObserver === "undefined") return

    const resizeObserver = new ResizeObserver(() => {
      updateOverlayBounds()
    })

    resizeObserver.observe(pageContent)
    window.addEventListener("resize", updateOverlayBounds)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateOverlayBounds)
    }
  }, [updateOverlayBounds])

  const closeBulkFeedback = useCallback(
    (expectedId?: number) => {
      setIsBulkFeedbackVisible(false)
      clearFeedbackExitTimer()
      feedbackExitTimeoutRef.current = window.setTimeout(() => {
        setBulkFeedback((currentFeedback) => {
          if (
            expectedId !== undefined &&
            currentFeedback &&
            currentFeedback.id !== expectedId
          ) {
            return currentFeedback
          }
          return null
        })
        feedbackExitTimeoutRef.current = null
      }, BULK_FEEDBACK_EXIT_MS)
    },
    [clearFeedbackExitTimer]
  )

  const pushBulkFeedback = useCallback(
    (nextFeedback: Omit<BulkFeedback, "id">) => {
      clearFeedbackTimer()
      clearFeedbackExitTimer()

      const feedbackWithId: BulkFeedback = {
        id: Date.now(),
        ...nextFeedback,
      }

      setBulkFeedback(feedbackWithId)
      setIsBulkFeedbackVisible(false)
      window.requestAnimationFrame(() => {
        setIsBulkFeedbackVisible(true)
      })
      feedbackTimeoutRef.current = window.setTimeout(() => {
        closeBulkFeedback(feedbackWithId.id)
        feedbackTimeoutRef.current = null
      }, BULK_FEEDBACK_DURATION_MS)
    },
    [clearFeedbackExitTimer, clearFeedbackTimer, closeBulkFeedback]
  )

  const getSelectedTicketsSnapshot = useCallback(() => {
    const selectedRowIds = tableToolbarProps?.selectedRowIds ?? []
    if (selectedRowIds.length === 0) return []

    const selectedIdSet = new Set(selectedRowIds)
    return ticketItems.filter((ticket) => selectedIdSet.has(ticket.id))
  }, [tableToolbarProps, ticketItems])

  const runBulkUpdate = useCallback(
    (
      actionLabel: string,
      updater: (ticket: Ticket) => Ticket,
      didChange: (ticket: Ticket) => boolean
    ) => {
      const snapshotTickets = getSelectedTicketsSnapshot()
      if (snapshotTickets.length === 0) {
        pushBulkFeedback({
          tone: "warning",
          message: ticketsPageCopy.noSelectionBulkAction,
        })
        return
      }

      const changedCount = snapshotTickets.filter(didChange).length

      if (changedCount === 0) {
        pushBulkFeedback({
          tone: "warning",
          message: ticketsPageCopy.bulkUpdateNoChanges(actionLabel),
        })
        return
      }

      try {
        updateSelectedTickets(updater)
      } catch {
        pushBulkFeedback({
          tone: "error",
          message: ticketsPageCopy.bulkUpdateFailed(actionLabel),
        })
        return
      }

      const unchangedCount = snapshotTickets.length - changedCount
      if (unchangedCount > 0) {
        pushBulkFeedback({
          tone: "warning",
          message: ticketsPageCopy.bulkUpdatePartiallyApplied(
            changedCount,
            snapshotTickets.length,
            actionLabel,
            unchangedCount
          ),
          actionLabel: "Undo",
          onAction: () => restoreTickets(snapshotTickets),
        })
        return
      }

      pushBulkFeedback({
        tone: "success",
        message: ticketsPageCopy.bulkUpdateApplied(changedCount, actionLabel),
        actionLabel: "Undo",
        onAction: () => restoreTickets(snapshotTickets),
      })
    },
    [
      getSelectedTicketsSnapshot,
      pushBulkFeedback,
      restoreTickets,
      updateSelectedTickets,
    ]
  )

  const requestDeleteSelectedTickets = useCallback(() => {
    const snapshotTickets = getSelectedTicketsSnapshot()
    if (snapshotTickets.length === 0) {
      pushBulkFeedback({
        tone: "warning",
        message: ticketsPageCopy.noSelectionDelete,
      })
      return
    }

    setDeleteConfirmState({
      open: true,
      snapshotTickets,
    })
  }, [getSelectedTicketsSnapshot, pushBulkFeedback])

  const handleExportSelectedTickets = useCallback(() => {
    const snapshotTickets = getSelectedTicketsSnapshot()
    if (snapshotTickets.length === 0) {
      pushBulkFeedback({
        tone: "warning",
        message: ticketsPageCopy.noSelectionExport,
      })
      return
    }

    try {
      const csvPayload = buildBulkExportCsv(snapshotTickets)
      const csvBlob = new Blob([`\uFEFF${csvPayload}`], {
        type: "text/csv;charset=utf-8;",
      })
      const downloadUrl = URL.createObjectURL(csvBlob)
      const downloadAnchor = document.createElement("a")
      const exportDate = formatLocalDateForFilename()

      downloadAnchor.href = downloadUrl
      downloadAnchor.download = `tickets-${exportDate}.csv`
      downloadAnchor.rel = "noopener"
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      URL.revokeObjectURL(downloadUrl)

      pushBulkFeedback({
        tone: "success",
        message: ticketsPageCopy.csvExportApplied(snapshotTickets.length),
      })
    } catch {
      pushBulkFeedback({
        tone: "error",
        message: ticketsPageCopy.csvExportFailed,
      })
    }
  }, [getSelectedTicketsSnapshot, pushBulkFeedback])

  const handleDeleteSelectedTickets = useCallback(() => {
    const snapshotTickets = deleteConfirmState.snapshotTickets
    setDeleteConfirmState({
      open: false,
      snapshotTickets: [],
    })

    if (snapshotTickets.length === 0) return

    const protectedTickets = snapshotTickets.filter(
      (ticket) => ticket.queueStatus === "closed"
    )
    const deletableTickets = snapshotTickets.filter(
      (ticket) => ticket.queueStatus !== "closed"
    )

    if (deletableTickets.length === 0) {
      pushBulkFeedback({
        tone: "error",
        message: ticketsPageCopy.deleteProtectedOnly,
      })
      return
    }

    try {
      deleteTicketsByIds(deletableTickets.map((ticket) => ticket.id))
      tableToolbarProps?.clearSelection()
    } catch {
      pushBulkFeedback({
        tone: "error",
        message: ticketsPageCopy.deleteFailed,
        actionLabel: ticketsPageCopy.deleteRetryLabel,
        onAction: requestDeleteSelectedTickets,
      })
      return
    }

    if (protectedTickets.length > 0) {
      pushBulkFeedback({
        tone: "warning",
        message: ticketsPageCopy.deletePartiallyApplied(
          deletableTickets.length,
          protectedTickets.length
        ),
        actionLabel: "Undo",
        onAction: () => restoreTickets(deletableTickets),
      })
      return
    }

    pushBulkFeedback({
      tone: "success",
      message: ticketsPageCopy.deleteApplied(deletableTickets.length),
      actionLabel: "Undo",
      onAction: () => restoreTickets(deletableTickets),
    })
  }, [
    deleteConfirmState.snapshotTickets,
    deleteTicketsByIds,
    pushBulkFeedback,
    requestDeleteSelectedTickets,
    restoreTickets,
    tableToolbarProps,
  ])

  const hasTableSelection =
    activeLayout === "table" && (tableToolbarProps?.selectedRowCount ?? 0) > 0

  return (
    <div
      ref={pageContentRef}
      className="flex h-full min-h-0 flex-col gap-4 max-sm:gap-3"
    >
      <TicketsPageHeader
        isStatsExpanded={isStatsExpanded}
        onToggleStats={() =>
          setIsStatsExpanded((previousValue) => !previousValue)
        }
        onCreateTicket={handleCreateTicket}
      />

      {isStatsExpanded ? (
        <div id="ticket-metrics">
          <TicketStats stats={stats} />
        </div>
      ) : null}

      <TicketSearchToolbar
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        layoutMode={activeLayout}
        onLayoutModeChange={handleLayoutModeChange}
        tableActions={
          activeLayout === "table" ? (
            <TicketsTableActions
              tableToolbarProps={tableToolbarProps}
              sortPreset={sortPreset}
              onSortPresetChange={setSortPreset}
            />
          ) : null
        }
      />

      {activeLayout === "table" ? (
        <div className="min-h-0 flex-1">
          <TicketTable
            tickets={filteredTickets}
            sortPreset={sortPreset}
            compactColumns={isMobile}
            onOpenTicket={handleOpenTicket}
            onTicketsChange={handleVisibleTicketsChange}
            onToolbarPropsChange={setTableToolbarProps}
          />
        </div>
      ) : (
        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
          <TicketBoard
            tickets={filteredTickets}
            onOpenTicket={handleOpenTicket}
            onMoveTicket={handleMoveTicket}
          />
        </div>
      )}

      {activeLayout === "table" && !bulkFeedback ? (
        <TicketsSelectionActionBar
          tableToolbarProps={tableToolbarProps}
          visibleAssigneeOptions={visibleAssigneeOptions}
          onBulkStatusChange={(status) =>
            runBulkUpdate(
              "status",
              (ticket) => ({ ...ticket, queueStatus: status }),
              (ticket) => ticket.queueStatus !== status
            )
          }
          onBulkPriorityChange={(priority) =>
            runBulkUpdate(
              "priority",
              (ticket) => ({ ...ticket, priority }),
              (ticket) => ticket.priority !== priority
            )
          }
          onBulkAssigneeChange={(assignee) =>
            runBulkUpdate(
              "assignee",
              (ticket) => ({ ...ticket, assignee }),
              (ticket) =>
                !areTicketAssigneesEqual(ticket.assignee, assignee)
            )
          }
          onBulkHealthChange={(health) =>
            runBulkUpdate(
              "health",
              (ticket) => ({ ...ticket, health }),
              (ticket) => ticket.health !== health
            )
          }
          onBulkChannelChange={(channel) =>
            runBulkUpdate(
              "channel",
              (ticket) => ({ ...ticket, channel }),
              (ticket) => ticket.channel !== channel
            )
          }
          onBulkEscalatedChange={(escalated) =>
            runBulkUpdate(
              "escalated flag",
              (ticket) => ({ ...ticket, escalated }),
              (ticket) => ticket.escalated !== escalated
            )
          }
          onBulkPastDueChange={(pastDue) =>
            runBulkUpdate(
              "past-due flag",
              (ticket) => ({ ...ticket, pastDue }),
              (ticket) => ticket.pastDue !== pastDue
            )
          }
          onExportSelection={handleExportSelectedTickets}
          onDeleteSelection={requestDeleteSelectedTickets}
          overlayStyle={pageContentOverlayStyle}
        />
      ) : null}

      {activeLayout === "table" && bulkFeedback ? (
        <div
          className="pointer-events-none fixed z-50 flex justify-center px-2 sm:px-3"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
            ...pageContentOverlayStyle,
          }}
        >
          <div
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-2xl border border-zinc-800/90 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 shadow-xl dark:border-zinc-300/80 dark:bg-zinc-100 dark:text-zinc-900",
              "transform-gpu transition-[opacity,transform] duration-220 ease-out motion-reduce:transition-none",
              isBulkFeedbackVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            )}
          >
            {bulkFeedback.tone === "success" ? (
              <IconCircleCheck className="size-4 text-emerald-400 dark:text-emerald-600" />
            ) : bulkFeedback.tone === "warning" ? (
              <IconAlertTriangle className="size-4 text-amber-400 dark:text-amber-600" />
            ) : (
              <IconAlertCircle className="size-4 text-rose-400 dark:text-rose-600" />
            )}
            <span className="font-medium">{bulkFeedback.message}</span>

            {bulkFeedback.actionLabel && bulkFeedback.onAction ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg px-2.5 text-inherit hover:bg-white/10 hover:text-inherit dark:hover:bg-black/8 dark:hover:text-inherit"
                onClick={() => {
                  bulkFeedback.onAction?.()
                  clearFeedbackTimer()
                  closeBulkFeedback(bulkFeedback.id)
                }}
              >
                {bulkFeedback.actionLabel}
              </Button>
            ) : null}

            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-lg text-inherit hover:bg-white/10 hover:text-inherit dark:hover:bg-black/8 dark:hover:text-inherit"
              onClick={() => {
                clearFeedbackTimer()
                closeBulkFeedback(bulkFeedback.id)
              }}
              aria-label={ticketsPageCopy.dismissBulkFeedbackAriaLabel}
            >
              <IconX className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <TicketDrawer
        open={activeTicket !== null}
        mode={drawerMode}
        ticket={activeTicket}
        assigneeOptions={drawerAssigneeOptions}
        peopleOptions={drawerPeopleOptions}
        draftMessage={activeDraft}
        replyFromAddress={activeReplyFrom}
        origin={drawerOrigin}
        onDraftMessageChange={handleDraftMessageChange}
        onOpenChange={handleDrawerOpenChange}
        onUpdateTicket={updateTicketItem}
        onSubmitMessage={handleSubmitMessage}
        onReplyFromAddressChange={handleReplyFromAddressChange}
      />

      <ConfirmDialog
        open={isDiscardDraftDialogOpen}
        onOpenChange={setIsDiscardDraftDialogOpen}
        title={ticketsPageCopy.discardDraftTitle}
        description={ticketsPageCopy.discardDraftDescription}
        cancelLabel={ticketsPageCopy.discardDraftCancelLabel}
        confirmLabel={ticketsPageCopy.discardDraftConfirmLabel}
        confirmVariant="default"
        onConfirm={() => {
          setIsDiscardDraftDialogOpen(false)
          closeTicketImmediately()
        }}
      />

      <ConfirmDialog
        open={deleteConfirmState.open}
        onOpenChange={(open) =>
          setDeleteConfirmState((currentState) => ({
            ...currentState,
            open,
            snapshotTickets: open ? currentState.snapshotTickets : [],
          }))
        }
        title={ticketsPageCopy.deleteDialogTitle(
          deleteConfirmState.snapshotTickets.length
        )}
        description={ticketsPageCopy.deleteDialogDescription}
        cancelLabel={ticketsPageCopy.deleteDialogCancelLabel}
        confirmLabel={ticketsPageCopy.deleteDialogConfirmLabel}
        confirmVariant="destructive"
        onConfirm={handleDeleteSelectedTickets}
      />

      {isMobile && activeTicket === null ? (
        <Button
          size="icon"
          className="fixed right-4 z-40 size-11 rounded-full shadow-lg"
          style={{
            bottom: hasTableSelection
              ? "calc(env(safe-area-inset-bottom, 0px) + 5.25rem)"
              : "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          }}
          onClick={handleCreateTicket}
          aria-label={ticketsPageCopy.createTicketAriaLabel}
        >
          <IconPlus className="size-[18px]" />
          <span className="sr-only">{ticketsPageCopy.createTicketSrOnly}</span>
        </Button>
      ) : null}
    </div>
  )
}
