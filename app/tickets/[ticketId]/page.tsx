import { notFound } from "next/navigation"

import { TicketDetailPage } from "@/components/tickets/ticket-detail-page"
import { currentUser } from "@/lib/current-user"
import { customerDirectory } from "@/lib/customers/mock-data"
import { buildTicketDetail } from "@/lib/tickets/detail-data"
import { tickets } from "@/lib/tickets/mock-data"
import type { Ticket } from "@/lib/tickets/types"

type TicketDetailRouteProps = {
  params: Promise<{
    ticketId: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

const validTabs = ["conversation", "task", "activity", "notes"] as const

function normalizeTab(tab: string | undefined) {
  if (tab && validTabs.includes(tab as (typeof validTabs)[number])) {
    return tab as (typeof validTabs)[number]
  }

  return "conversation"
}

function findCustomerTicket(ticketId: string): Ticket | undefined {
  for (const customer of customerDirectory) {
    const recentTicket = customer.recentTickets.find(
      (ticket) => ticket.id === ticketId
    )

    if (!recentTicket) continue

    const subject = recentTicket.subject.toLowerCase()
    const category = subject.includes("billing")
      ? "billing"
      : subject.includes("automation") ||
          subject.includes("export") ||
          subject.includes("sync")
        ? "technical"
        : "other"

    return {
      id: recentTicket.id,
      ticketNumber: recentTicket.id,
      subject: recentTicket.subject,
      queueStatus: recentTicket.status,
      boardOrder: 0,
      health:
        customer.health === "at_risk"
          ? "breached"
          : customer.health === "watch"
            ? "warning"
            : "on-track",
      channel: "email",
      trend: "flat",
      requester: {
        name: customer.primaryContactName,
        email: customer.primaryContactEmail,
      },
      assignee: customer.owner,
      followers: [],
      tags: customer.productAreas,
      ticketType: category === "billing" ? "question" : "incident",
      category,
      priority: recentTicket.priority,
      mine: customer.owner.email === currentUser.email,
      escalated: customer.health === "at_risk",
      pastDue: customer.health === "at_risk",
    }
  }

  return undefined
}

export default async function Page({
  params,
  searchParams,
}: TicketDetailRouteProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const ticket =
    tickets.find((entry) => entry.id === resolvedParams.ticketId) ??
    findCustomerTicket(resolvedParams.ticketId)

  if (!ticket) {
    notFound()
  }

  const detail = buildTicketDetail(ticket)

  return (
    <TicketDetailPage
      key={ticket.id}
      ticket={ticket}
      detail={detail}
      initialTab={normalizeTab(resolvedSearchParams.tab)}
    />
  )
}
