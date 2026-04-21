"use client"

import { useMemo, useState } from "react"

import { buildStats } from "@/components/tickets/tickets-page-helpers"
import { useTicketsPageMutations } from "@/components/tickets/use-tickets-page-mutations"
import { useTicketsPageQueryState } from "@/components/tickets/use-tickets-page-query-state"
import { filterTicketsByView } from "@/lib/tickets/mock-data"
import { currentUser } from "@/lib/current-user"
import type {
  TicketAssignee,
  TicketPerson,
} from "@/lib/tickets/types"
import { useIsMobile } from "@/hooks/use-mobile"
import type { TicketSortPreset } from "./ticket-table"

type UseTicketsPageStateArgs = {
  initialView?: string | null
  initialLayout?: string | null
}

export function useTicketsPageState({
  initialView = "all",
  initialLayout = "board",
}: UseTicketsPageStateArgs = {}) {
  const isMobile = useIsMobile()

  const {
    activeView,
    activeTicketId,
    activeLayout,
    handleLayoutModeChange,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    isStatsExpanded,
    setIsStatsExpanded,
    createContextSearchParams,
    replaceSearchParams,
  } = useTicketsPageQueryState({ initialView, initialLayout })

  const {
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
  } = useTicketsPageMutations({
    activeTicketId,
    createContextSearchParams,
    replaceSearchParams,
  })

  const [sortPreset, setSortPreset] = useState<TicketSortPreset>("boardOrder")

  const visibleByView = useMemo(
    () => filterTicketsByView(ticketItems, activeView),
    [activeView, ticketItems]
  )

  const stats = useMemo(() => buildStats(visibleByView), [visibleByView])

  const filteredTickets = useMemo(() => {
    return visibleByView.filter((ticket) => {
      const matchesStatus =
        statusFilter === "all" ? true : ticket.queueStatus === statusFilter
      const normalizedQuery = query.trim().toLowerCase()
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${ticket.subject} ${ticket.ticketNumber}`
              .toLowerCase()
              .includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [query, statusFilter, visibleByView])

  const visibleAssigneeOptions = useMemo(() => {
    const optionsMap = new Map<string, TicketAssignee>()

    filteredTickets.forEach((ticket) => {
      if (!ticket.assignee) return
      if (optionsMap.has(ticket.assignee.name)) return
      optionsMap.set(ticket.assignee.name, ticket.assignee)
    })

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [filteredTickets])

  const drawerAssigneeOptions = useMemo(() => {
    const optionsMap = new Map<string, TicketAssignee>()

    ticketItems.forEach((ticket) => {
      if (!ticket.assignee) return
      if (optionsMap.has(ticket.assignee.name)) return
      optionsMap.set(ticket.assignee.name, ticket.assignee)
    })

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [ticketItems])

  const drawerPeopleOptions = useMemo(() => {
    const optionsMap = new Map<string, TicketPerson>()

    ticketItems.forEach((ticket) => {
      const candidates = [
        ticket.requester,
        ticket.assignee,
        ...(ticket.followers ?? []),
      ].filter(Boolean) as TicketPerson[]

      candidates.forEach((person) => {
        if (!optionsMap.has(person.name)) {
          optionsMap.set(person.name, person)
        }
      })
    })

    if (!optionsMap.has(currentUser.name)) {
      optionsMap.set(currentUser.name, {
        name: currentUser.name,
        avatarUrl: currentUser.avatar,
        email: currentUser.email,
      })
    }

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [ticketItems])

  return {
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
  }
}
