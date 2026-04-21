"use client"

import { useMemo, useState } from "react"
import type { MouseEvent } from "react"

import {
  createDraftTicket,
  getNextTicketSequence,
  NEW_TICKET_ID,
} from "@/components/tickets/tickets-page-helpers"
import {
  createSubmittedTicket,
  getQueueStatusAfterSubmit,
  mergeVisibleTicketUpdates,
  moveTicketToQueue,
  omitRecordKey,
  patchTicketById,
  patchTicketsByIds,
} from "@/components/tickets/tickets-page-mutation-helpers"
import { tickets as initialTickets } from "@/lib/tickets/mock-data"
import type {
  Ticket,
  TicketDrawerOrigin,
  TicketQueueStatus,
  TicketSubmitAction,
} from "@/lib/tickets/types"
import type { DataGridToolbarRenderProps } from "@/components/data-grid"
import type { TicketColumnId } from "./ticket-table"

type UseTicketsPageMutationsArgs = {
  activeTicketId: string | null
  createContextSearchParams: () => URLSearchParams
  replaceSearchParams: (nextSearchParams: URLSearchParams) => void
}

export function useTicketsPageMutations({
  activeTicketId,
  createContextSearchParams,
  replaceSearchParams,
}: UseTicketsPageMutationsArgs) {
  const [ticketItems, setTicketItems] = useState(initialTickets)
  const [tableToolbarProps, setTableToolbarProps] =
    useState<DataGridToolbarRenderProps<TicketColumnId> | null>(null)
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({})
  const [replyFromByTicketId, setReplyFromByTicketId] = useState<
    Record<string, string>
  >({})
  const [createTicketDraft, setCreateTicketDraft] = useState<Ticket | null>(
    null
  )
  const [drawerOrigin, setDrawerOrigin] = useState<TicketDrawerOrigin | null>(
    null
  )
  const [isDiscardDraftDialogOpen, setIsDiscardDraftDialogOpen] =
    useState(false)

  const activeTicket = useMemo(
    () =>
      activeTicketId === NEW_TICKET_ID
        ? createTicketDraft
        : activeTicketId
          ? (ticketItems.find((ticket) => ticket.id === activeTicketId) ?? null)
          : null,
    [activeTicketId, createTicketDraft, ticketItems]
  )

  const drawerMode: "create" | "edit" =
    activeTicketId === NEW_TICKET_ID ? "create" : "edit"

  const activeDraft = activeTicketId ? (messageDrafts[activeTicketId] ?? "") : ""
  const activeReplyFrom = activeTicketId
    ? replyFromByTicketId[activeTicketId]
    : undefined

  const handleVisibleTicketsChange = (nextVisibleTickets: Ticket[]) => {
    setTicketItems((previousTickets) =>
      mergeVisibleTicketUpdates(previousTickets, nextVisibleTickets)
    )
  }

  const updateTicketItem = (
    ticketId: string,
    updater: (currentTicket: Ticket) => Ticket
  ) => {
    if (ticketId === NEW_TICKET_ID) {
      setCreateTicketDraft((currentDraft) =>
        currentDraft ? updater(currentDraft) : currentDraft
      )
      return
    }

    setTicketItems((previousTickets) =>
      patchTicketById(previousTickets, ticketId, updater)
    )
  }

  const updateSelectedTickets = (updater: (ticket: Ticket) => Ticket) => {
    const selectedRowIds = tableToolbarProps?.selectedRowIds ?? []
    if (selectedRowIds.length === 0) return

    setTicketItems((previousTickets) =>
      patchTicketsByIds(previousTickets, selectedRowIds, updater)
    )
  }

  const deleteTicketsByIds = (ticketIds: string[]) => {
    if (ticketIds.length === 0) return
    const selectedIds = new Set(ticketIds)

    setTicketItems((previousTickets) =>
      previousTickets.filter((ticket) => !selectedIds.has(ticket.id))
    )
  }

  const restoreTickets = (snapshotTickets: Ticket[]) => {
    if (snapshotTickets.length === 0) return

    const snapshotMap = new Map(
      snapshotTickets.map((ticket) => [ticket.id, ticket])
    )

    setTicketItems((previousTickets) => {
      const nextTickets = previousTickets.map(
        (ticket) => snapshotMap.get(ticket.id) ?? ticket
      )

      // Reinsert tickets removed by destructive actions (e.g. delete).
      const existingIds = new Set(nextTickets.map((ticket) => ticket.id))
      const missingSnapshotTickets = snapshotTickets.filter(
        (ticket) => !existingIds.has(ticket.id)
      )

      return missingSnapshotTickets.length > 0
        ? [...missingSnapshotTickets, ...nextTickets]
        : nextTickets
    })
  }

  const handleMoveTicket = (
    ticketId: string,
    queueStatus: TicketQueueStatus,
    insertBeforeTicketId?: string | null
  ) => {
    setTicketItems((previousTickets) => {
      return moveTicketToQueue(
        previousTickets,
        ticketId,
        queueStatus,
        insertBeforeTicketId
      )
    })
  }

  const handleOpenTicket = (ticketId: string, origin?: TicketDrawerOrigin) => {
    setDrawerOrigin(origin ?? null)
    const nextSearchParams = createContextSearchParams()
    nextSearchParams.set("ticket", ticketId)
    replaceSearchParams(nextSearchParams)
  }

  const handleCreateTicket = (event?: MouseEvent<HTMLButtonElement>) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      setDrawerOrigin({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      })
    }

    const nextSequence = getNextTicketSequence(ticketItems)
    setCreateTicketDraft(createDraftTicket(nextSequence))

    const nextSearchParams = createContextSearchParams()
    nextSearchParams.set("ticket", NEW_TICKET_ID)
    replaceSearchParams(nextSearchParams)
  }

  const clearCreateDraftArtifacts = () => {
    setCreateTicketDraft(null)
    setMessageDrafts((currentDrafts) =>
      omitRecordKey(currentDrafts, NEW_TICKET_ID)
    )
    setReplyFromByTicketId((currentAddresses) =>
      omitRecordKey(currentAddresses, NEW_TICKET_ID)
    )
  }

  const closeTicketImmediately = () => {
    const nextSearchParams = createContextSearchParams()
    nextSearchParams.delete("ticket")

    if (activeTicketId === NEW_TICKET_ID) {
      clearCreateDraftArtifacts()
    }

    replaceSearchParams(nextSearchParams)
  }

  const handleCloseTicket = () => {
    if (activeTicketId && activeDraft.trim().length > 0) {
      setIsDiscardDraftDialogOpen(true)
      return
    }

    closeTicketImmediately()
  }

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseTicket()
    }
  }

  const handleDraftMessageChange = (nextDraft: string) => {
    if (!activeTicketId) return

    setMessageDrafts((currentDrafts) => ({
      ...currentDrafts,
      [activeTicketId]: nextDraft,
    }))
  }

  const handleSubmitMessage = (
    ticketId: string,
    action: TicketSubmitAction = "send"
  ) => {
    if (ticketId === NEW_TICKET_ID) {
      if (!createTicketDraft) return

      const subject = createTicketDraft.subject.trim()
      if (!subject) return

      setTicketItems((previousTickets) => {
        return createSubmittedTicket(previousTickets, createTicketDraft, subject)
      })

      clearCreateDraftArtifacts()

      const nextSearchParams = createContextSearchParams()
      nextSearchParams.delete("ticket")
      replaceSearchParams(nextSearchParams)
      return
    }

    const draft = messageDrafts[ticketId]?.trim()
    if (!draft) return

    setMessageDrafts((currentDrafts) => ({
      ...currentDrafts,
      [ticketId]: "",
    }))

    updateTicketItem(ticketId, (ticket) => ({
      ...ticket,
      queueStatus: getQueueStatusAfterSubmit(ticket.queueStatus, action),
    }))
  }

  const handleReplyFromAddressChange = (
    ticketId: string,
    nextAddress: string
  ) => {
    setReplyFromByTicketId((currentAddresses) => ({
      ...currentAddresses,
      [ticketId]: nextAddress,
    }))
  }

  return {
    ticketItems,
    tableToolbarProps,
    setTableToolbarProps,
    updateSelectedTickets,
    deleteTicketsByIds,
    restoreTickets,
    handleVisibleTicketsChange,
    updateTicketItem,
    handleMoveTicket,
    handleOpenTicket,
    handleCreateTicket,
    activeTicket,
    drawerMode,
    drawerOrigin,
    activeDraft,
    activeReplyFrom,
    handleDraftMessageChange,
    handleDrawerOpenChange,
    handleSubmitMessage,
    handleReplyFromAddressChange,
    isDiscardDraftDialogOpen,
    setIsDiscardDraftDialogOpen,
    closeTicketImmediately,
  }
}
