"use client"

import * as React from "react"

import {
  IconAlertTriangle,
  IconBuilding,
  IconClockExclamation,
  IconCurrencyDollar,
  IconLayoutList,
  IconMail,
  IconUser,
} from "@tabler/icons-react"

import {
  DataGrid,
  type DataGridColumn,
  type DataGridToolbarRenderProps,
} from "@/components/data-grid"
import type { CustomerDrawerTriggerContext } from "@/components/customers/customer-drawer"
import { CustomerInitialAvatar } from "@/components/customers/customer-initial-avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getCustomerBrandPresentation } from "@/components/customers/customer-brand"
import {
  customerHealthToneClassName,
  getCustomerInitials,
} from "@/lib/customers/presentation"
import { customerHealthLabels } from "@/lib/customers/types"
import type { Customer, CustomerHealth } from "@/lib/customers/types"
import { cn } from "@/lib/utils"

export type CustomerColumnId =
  | "customer"
  | "email"
  | "organization"
  | "segment"
  | "health"
  | "openTickets"
  | "annualValue"
  | "lastTouch"
  | "owner"

type CustomersTableProps = {
  customers: Customer[]
  onCustomersChange: (customers: Customer[]) => void
  onOpenCustomerDrawer?: (context: CustomerDrawerTriggerContext) => void
  onToolbarPropsChange?: (
    props: DataGridToolbarRenderProps<CustomerColumnId> | null
  ) => void
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("en-US")

const customerColumns: DataGridColumn<CustomerColumnId>[] = [
  {
    id: "customer",
    label: "Name",
    icon: IconUser,
    defaultWidth: 220,
    minWidth: 200,
  },
  {
    id: "email",
    label: "Email",
    icon: IconMail,
    defaultWidth: 250,
    minWidth: 220,
  },
  {
    id: "organization",
    label: "Organization",
    icon: IconBuilding,
    defaultWidth: 230,
    minWidth: 200,
  },
  {
    id: "segment",
    label: "Plan",
    icon: IconLayoutList,
    defaultWidth: 152,
    minWidth: 132,
  },
  {
    id: "health",
    label: "Health",
    icon: IconAlertTriangle,
    defaultWidth: 148,
    minWidth: 132,
  },
  {
    id: "openTickets",
    label: "Open tickets",
    icon: IconClockExclamation,
    defaultWidth: 132,
    minWidth: 120,
  },
  {
    id: "annualValue",
    label: "ARR",
    icon: IconCurrencyDollar,
    defaultWidth: 144,
    minWidth: 132,
  },
  {
    id: "lastTouch",
    label: "Last touch",
    icon: IconClockExclamation,
    defaultWidth: 156,
    minWidth: 140,
  },
  {
    id: "owner",
    label: "Owner",
    icon: IconUser,
    defaultWidth: 160,
    minWidth: 140,
  },
]

function formatCompactCurrency(value: number) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}k`
  }

  return currencyFormatter.format(value)
}

function CustomerHealthBadge({ health }: { health: CustomerHealth }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "justify-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        customerHealthToneClassName[health]
      )}
    >
      {customerHealthLabels[health]}
    </Badge>
  )
}

function renderStaticCustomerCell(
  customer: Customer,
  columnId: CustomerColumnId
): React.ReactNode {
  if (columnId === "customer") {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <CustomerInitialAvatar name={customer.primaryContactName} size="sm" />
        <div className="truncate text-sm font-medium text-foreground">
          {customer.primaryContactName}
        </div>
      </div>
    )
  }

  if (columnId === "email") {
    return (
      <div className="truncate text-sm font-medium text-foreground">
        {customer.primaryContactEmail}
      </div>
    )
  }

  if (columnId === "organization") {
    const brand = getCustomerBrandPresentation(
      customer.id,
      customer.companyName
    )
    const BrandIcon = brand.icon

    return (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-6 border bg-background" size="sm">
          <AvatarFallback
            className={cn("text-[10px] font-semibold", brand.className)}
          >
            {BrandIcon ? <BrandIcon className="size-3.5" /> : brand.fallback}
          </AvatarFallback>
        </Avatar>
        <div className="truncate text-sm font-medium text-foreground">
          {customer.companyName}
        </div>
      </div>
    )
  }

  if (columnId === "segment") {
    return (
      <div className="truncate text-sm font-medium text-foreground">
        {customer.plan} · {customer.segment}
      </div>
    )
  }

  if (columnId === "health") {
    return <CustomerHealthBadge health={customer.health} />
  }

  if (columnId === "openTickets") {
    return (
      <div className="text-sm font-medium text-foreground">
        {numberFormatter.format(customer.openTickets)}
      </div>
    )
  }

  if (columnId === "annualValue") {
    return (
      <div className="text-sm font-medium text-foreground">
        {formatCompactCurrency(customer.annualValue)}
      </div>
    )
  }

  if (columnId === "lastTouch") {
    return (
      <div className="text-sm font-medium text-foreground">
        {customer.lastTouchLabel}
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="sm">
        {customer.owner.avatarUrl ? (
          <AvatarImage
            src={customer.owner.avatarUrl}
            alt={customer.owner.name}
          />
        ) : null}
        <AvatarFallback className="text-[10px] font-semibold">
          {getCustomerInitials(customer.owner.name)}
        </AvatarFallback>
      </Avatar>
      <div className="truncate text-sm font-medium text-foreground">
        {customer.owner.name}
      </div>
    </div>
  )
}

export function CustomersTable({
  customers,
  onCustomersChange,
  onOpenCustomerDrawer,
  onToolbarPropsChange,
}: CustomersTableProps) {
  return (
    <div className="h-full min-h-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Customer, CustomerColumnId>
        rows={customers}
        columns={customerColumns}
        getRowLabel={(customer) => customer.companyName}
        renderCell={(customer, column) =>
          renderStaticCustomerCell(customer, column.id)
        }
        isEditableColumn={(columnId) =>
          columnId === "customer" ||
          columnId === "email" ||
          columnId === "organization"
        }
        getCellEditValue={(customer, columnId) => {
          if (columnId === "customer") return customer.primaryContactName
          if (columnId === "email") return customer.primaryContactEmail
          if (columnId === "organization") return customer.companyName
          return ""
        }}
        applyCellEdit={(customer, columnId, nextValue) => {
          const normalizedValue = nextValue.trim()
          if (normalizedValue.length === 0) return customer

          if (columnId === "customer") {
            return {
              ...customer,
              primaryContactName: normalizedValue,
            }
          }

          if (columnId === "email") {
            return {
              ...customer,
              primaryContactEmail: normalizedValue,
            }
          }

          if (columnId === "organization") {
            return {
              ...customer,
              companyName: normalizedValue,
            }
          }

          return customer
        }}
        onRowsChange={onCustomersChange}
        onToolbarPropsChange={onToolbarPropsChange ?? undefined}
        canOpenDrawer={(columnId) =>
          columnId === "customer" && onOpenCustomerDrawer !== undefined
        }
        onOpenDrawerCell={
          onOpenCustomerDrawer
            ? (cell) => {
                if (cell.columnId !== "customer") return

                onOpenCustomerDrawer({
                  customerId: cell.rowId,
                  source: "table",
                  originRect: cell.originRect,
                })
              }
            : undefined
        }
        getDrawerCellValue={(customer, columnId) =>
          renderStaticCustomerCell(customer, columnId)
        }
        renderSummary={(column, visibleRows) => {
          const visibleAverageCsat =
            visibleRows.length > 0
              ? visibleRows.reduce((sum, customer) => sum + customer.csat, 0) /
                visibleRows.length
              : 0

          if (column.id === "organization") {
            return `${visibleRows.length} accounts`
          }

          if (column.id === "openTickets") {
            return numberFormatter.format(
              visibleRows.reduce(
                (sum, customer) => sum + customer.openTickets,
                0
              )
            )
          }

          if (column.id === "annualValue") {
            return formatCompactCurrency(
              visibleRows.reduce(
                (sum, customer) => sum + customer.annualValue,
                0
              )
            )
          }

          if (column.id === "health") {
            return `${visibleAverageCsat.toFixed(1)} avg CSAT`
          }

          return ""
        }}
        stickySummaryFooter
        fillAvailableHeight
        disablePointerDismissal={false}
        tableContainerClassName="scrollbar-hidden h-full overflow-x-auto overflow-y-hidden"
      />
    </div>
  )
}
