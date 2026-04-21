import { notFound } from "next/navigation"

import { TicketDetailPage } from "@/components/tickets/ticket-detail-page"
import { buildTicketDetail } from "@/lib/tickets/detail-data"
import { tickets } from "@/lib/tickets/mock-data"

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

export default async function Page({
  params,
  searchParams,
}: TicketDetailRouteProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const ticket = tickets.find((entry) => entry.id === resolvedParams.ticketId)

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
