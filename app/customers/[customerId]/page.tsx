import { notFound } from "next/navigation"

import { CustomerDetailPage } from "@/components/customers/customer-detail-page"
import { customerDirectory } from "@/lib/customers/mock-data"
import {
  normalizeCustomerDetailTab,
  normalizeCustomerTicketPriorityFilter,
  normalizeCustomerTicketTypeFilter,
} from "@/lib/customers/detail-view-model"

type CustomerDetailRouteProps = {
  params: Promise<{
    customerId: string
  }>
  searchParams: Promise<{
    tab?: string
    q?: string
    type?: string
    priority?: string
  }>
}

export default async function Page({
  params,
  searchParams,
}: CustomerDetailRouteProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const customer = customerDirectory.find(
    (entry) => entry.id === resolvedParams.customerId
  )

  if (!customer) {
    notFound()
  }

  return (
    <CustomerDetailPage
      key={customer.id}
      customer={customer}
      initialTab={normalizeCustomerDetailTab(resolvedSearchParams.tab)}
      initialQuery={resolvedSearchParams.q ?? ""}
      initialType={normalizeCustomerTicketTypeFilter(resolvedSearchParams.type)}
      initialPriority={normalizeCustomerTicketPriorityFilter(
        resolvedSearchParams.priority
      )}
    />
  )
}
