"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { useRouter } from "next/navigation"

import {
  CustomerCardGrid,
} from "@/components/customers/customer-card-grid"
import {
  CustomerDrawer,
  type CustomerDrawerTriggerContext,
} from "@/components/customers/customer-drawer"
import {
  CustomersTable,
  type CustomerColumnId,
} from "@/components/customers/customer-table"
import { CustomerSearchToolbar } from "@/components/customers/customer-search-toolbar"
import { type CustomerMetric, CustomerStats } from "@/components/customers/customer-stats"
import {
  CustomersPageHeader,
  CustomersSelectionActionBar,
  CustomersTableActions,
  type CustomerSortPreset,
} from "@/components/customers/customers-page-sections"
import { type DataGridToolbarRenderProps } from "@/components/data-grid"
import {
  customerDirectory,
  filterCustomersByView,
} from "@/lib/customers/mock-data"
import { customerHealthLabels, customerLifecycleLabels } from "@/lib/customers/types"
import type {
  Customer,
  CustomerHealth,
  CustomerLayoutMode,
  CustomerLifecycle,
  CustomerViewKey,
} from "@/lib/customers/types"

type CustomerHealthFilter = "all" | CustomerHealth
type CustomersPageProps = {
  initialView?: string | null
  initialLayout?: string | null
}

const customerViewKeys: CustomerViewKey[] = [
  "all",
  "mine",
  "at-risk",
  "renewal",
  "high-touch",
]
const customerLayoutModes: CustomerLayoutMode[] = ["table", "card"]

const healthPriority: Record<CustomerHealth, number> = {
  at_risk: 3,
  watch: 2,
  healthy: 1,
}

const numberFormatter = new Intl.NumberFormat("en-US")

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function formatCompactCurrency(value: number) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}k`
  }

  return currencyFormatter.format(value)
}

function formatTrendPercent(current: number, previous: number) {
  if (previous <= 0) return "0%"
  const percent = Math.abs(((current - previous) / previous) * 100)
  const rounded = Number.isInteger(percent) ? percent : Number(percent.toFixed(1))
  return `${rounded}%`
}

function mergeVisibleCustomers(
  currentCustomers: Customer[],
  nextVisibleCustomers: Customer[]
) {
  const nextVisibleMap = new Map(
    nextVisibleCustomers.map((customer) => [customer.id, customer])
  )

  return currentCustomers.map(
    (customer) => nextVisibleMap.get(customer.id) ?? customer
  )
}

function exportCustomersToCsv(rows: Customer[]) {
  const csv = [
    [
      "Company",
      "Primary Contact",
      "Owner",
      "Health",
      "Lifecycle",
      "Open Tickets",
      "ARR",
    ].join(","),
    ...rows.map((customer) =>
      [
        customer.companyName,
        customer.primaryContactName,
        customer.owner.name,
        customerHealthLabels[customer.health],
        customerLifecycleLabels[customer.lifecycle],
        customer.openTickets,
        customer.annualValue,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    ),
  ].join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "customers-export.csv"
  anchor.click()
  URL.revokeObjectURL(url)
}

export function CustomersPage({
  initialView = "all",
  initialLayout = "table",
}: CustomersPageProps) {
  const router = useRouter()
  const activeView: CustomerViewKey = customerViewKeys.includes(
    initialView as CustomerViewKey
  )
    ? (initialView as CustomerViewKey)
    : "all"
  const [layoutMode, setLayoutMode] = useState<CustomerLayoutMode>(
    customerLayoutModes.includes(initialLayout as CustomerLayoutMode)
      ? (initialLayout as CustomerLayoutMode)
      : "table"
  )

  const [customers, setCustomers] = useState(customerDirectory)
  const [query, setQuery] = useState("")
  const [healthFilter, setHealthFilter] = useState<CustomerHealthFilter>("all")
  const [lifecycleFilter, setLifecycleFilter] = useState<CustomerLifecycle | "all">(
    "all"
  )
  const [sortPreset, setSortPreset] = useState<CustomerSortPreset>("risk")
  const [isStatsExpanded, setIsStatsExpanded] = useState(false)
  const [tableToolbarProps, setTableToolbarProps] =
    useState<DataGridToolbarRenderProps<CustomerColumnId> | null>(null)
  const [drawerTriggerContext, setDrawerTriggerContext] =
    useState<CustomerDrawerTriggerContext | null>(null)

  const pageContentRef = useRef<HTMLDivElement | null>(null)
  const [pageContentOverlayStyle, setPageContentOverlayStyle] =
    useState<CSSProperties>({ left: 0, width: "100%" })

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const scopedCustomers = filterCustomersByView(customers, activeView)

    return scopedCustomers
      .filter((customer) => {
        const matchesQuery =
          normalizedQuery.length === 0
            ? true
            : [
                customer.companyName,
                customer.primaryContactName,
                customer.primaryContactEmail,
                customer.owner.name,
                customer.plan,
                customer.segment,
              ]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery)

        const matchesHealth =
          healthFilter === "all" ? true : customer.health === healthFilter
        const matchesLifecycle =
          lifecycleFilter === "all" ? true : customer.lifecycle === lifecycleFilter

        return matchesQuery && matchesHealth && matchesLifecycle
      })
      .sort((left, right) => {
        if (sortPreset === "value") {
          return right.annualValue - left.annualValue
        }

        if (sortPreset === "recent") {
          return left.lastTouchSortValue - right.lastTouchSortValue
        }

        if (healthPriority[left.health] !== healthPriority[right.health]) {
          return healthPriority[right.health] - healthPriority[left.health]
        }

        return right.openTickets - left.openTickets
      })
  }, [activeView, customers, healthFilter, lifecycleFilter, query, sortPreset])

  const metrics = useMemo(() => {
    const totalOpenTickets = filteredCustomers.reduce(
      (sum, customer) => sum + customer.openTickets,
      0
    )
    const atRiskRevenue = filteredCustomers
      .filter((customer) => customer.health === "at_risk")
      .reduce((sum, customer) => sum + customer.annualValue, 0)
    const avgCsat =
      filteredCustomers.length > 0
        ? filteredCustomers.reduce((sum, customer) => sum + customer.csat, 0) /
          filteredCustomers.length
        : 0

    const previousTotalCustomers = Math.max(filteredCustomers.length - 2, 0)
    const totalTrend = filteredCustomers.length - previousTotalCustomers

    const previousAtRiskRevenue =
      atRiskRevenue > 0 ? atRiskRevenue + Math.max(20_000, atRiskRevenue * 0.08) : 0
    const riskTrend = atRiskRevenue - previousAtRiskRevenue

    const previousOpenTickets =
      totalOpenTickets > 0 ? totalOpenTickets + Math.max(2, totalOpenTickets * 0.12) : 0
    const loadTrend = totalOpenTickets - previousOpenTickets

    const previousCsat = avgCsat > 0 ? Math.max(avgCsat - 0.3, 0) : 0
    const csatTrend = avgCsat - previousCsat

    const stats: CustomerMetric[] = [
      {
        key: "total",
        label: "Customers in View",
        value: numberFormatter.format(filteredCustomers.length),
        trend: totalTrend > 0 ? "up" : totalTrend < 0 ? "down" : "flat",
        deltaLabel: `${numberFormatter.format(Math.abs(totalTrend))} (${formatTrendPercent(filteredCustomers.length, previousTotalCustomers)})`,
        comparison: "vs last week",
      },
      {
        key: "risk",
        label: "At-Risk Revenue",
        value: currencyFormatter.format(atRiskRevenue),
        trend: riskTrend > 0 ? "up" : riskTrend < 0 ? "down" : "flat",
        deltaLabel: `${formatCompactCurrency(Math.abs(riskTrend))} (${formatTrendPercent(atRiskRevenue, previousAtRiskRevenue)})`,
        comparison: "vs last week",
      },
      {
        key: "load",
        label: "Open Ticket Load",
        value: numberFormatter.format(totalOpenTickets),
        trend: loadTrend > 0 ? "up" : loadTrend < 0 ? "down" : "flat",
        deltaLabel: `${numberFormatter.format(Math.abs(Math.round(loadTrend)))} (${formatTrendPercent(totalOpenTickets, previousOpenTickets)})`,
        comparison: "vs last week",
      },
      {
        key: "csat",
        label: "Average CSAT",
        value: filteredCustomers.length > 0 ? `${avgCsat.toFixed(1)} / 5` : "0.0 / 5",
        trend: csatTrend > 0 ? "up" : csatTrend < 0 ? "down" : "flat",
        deltaLabel: `${csatTrend === 0 ? "0.0" : Math.abs(csatTrend).toFixed(1)} (${formatTrendPercent(avgCsat, previousCsat)})`,
        comparison: "vs last week",
      },
    ]

    return stats
  }, [filteredCustomers])

  const drawerCustomerIndex = useMemo(() => {
    if (!drawerTriggerContext) return -1

    return filteredCustomers.findIndex(
      (customer) => customer.id === drawerTriggerContext.customerId
    )
  }, [drawerTriggerContext, filteredCustomers])

  const drawerCustomer =
    drawerCustomerIndex >= 0 ? filteredCustomers[drawerCustomerIndex] : null

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

  const handleVisibleCustomersChange = useCallback(
    (nextVisibleCustomers: Customer[]) => {
      setCustomers((currentCustomers) =>
        mergeVisibleCustomers(currentCustomers, nextVisibleCustomers)
      )
    },
    []
  )

  const mutateSelectedCustomers = useCallback(
    (updater: (customer: Customer) => Customer) => {
      if (!tableToolbarProps || tableToolbarProps.selectedRowCount === 0) return

      const selectedIds = new Set(tableToolbarProps.selectedRowIds)
      setCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          selectedIds.has(customer.id) ? updater(customer) : customer
        )
      )
      tableToolbarProps.clearSelection()
    },
    [tableToolbarProps]
  )

  const exportSelection = useCallback(() => {
    if (!tableToolbarProps || tableToolbarProps.selectedRowCount === 0) {
      exportCustomersToCsv(filteredCustomers)
      return
    }

    const selectedIds = new Set(tableToolbarProps.selectedRowIds)
    exportCustomersToCsv(
      filteredCustomers.filter((customer) => selectedIds.has(customer.id))
    )
  }, [filteredCustomers, tableToolbarProps])

  const handleLayoutModeChange = useCallback(
    (nextLayoutMode: CustomerLayoutMode) => {
      if (nextLayoutMode === layoutMode) return

      if (nextLayoutMode !== "table" && tableToolbarProps) {
        if (tableToolbarProps.selectedRowCount > 0) {
          tableToolbarProps.clearSelection()
        }
        setTableToolbarProps(null)
      }

      setLayoutMode(nextLayoutMode)
    },
    [layoutMode, tableToolbarProps]
  )

  const openCustomerDrawer = useCallback(
    (context: CustomerDrawerTriggerContext) => {
      setDrawerTriggerContext(context)
    },
    []
  )

  const closeCustomerDrawer = useCallback(() => {
    setDrawerTriggerContext(null)
  }, [])

  const openCustomerDrawerAtIndex = useCallback(
    (nextIndex: number) => {
      const nextCustomer = filteredCustomers[nextIndex]
      if (!nextCustomer) return

      setDrawerTriggerContext((currentContext) => ({
        customerId: nextCustomer.id,
        source: currentContext?.source ?? "table",
        originRect: currentContext?.originRect,
      }))
    },
    [filteredCustomers]
  )

  const handleViewCustomerProfile = useCallback(() => {
    if (!drawerCustomer) return

    router.push(`/customers/${drawerCustomer.id}`)
  }, [drawerCustomer, router])

  return (
    <div
      ref={pageContentRef}
      className="flex h-full min-h-0 flex-col gap-4 max-sm:gap-3"
    >
      <CustomersPageHeader
        isStatsExpanded={isStatsExpanded}
        onToggleStats={() => setIsStatsExpanded((prev) => !prev)}
        onCreateCustomer={() => {
          // Placeholder to match current ticket page behavior.
        }}
        onExportCustomers={exportSelection}
      />

      {isStatsExpanded ? (
        <div id="customer-metrics">
          <CustomerStats metrics={metrics} />
        </div>
      ) : null}

      <CustomerSearchToolbar
        query={query}
        onQueryChange={setQuery}
        healthFilter={healthFilter}
        onHealthFilterChange={setHealthFilter}
        layoutMode={layoutMode}
        onLayoutModeChange={handleLayoutModeChange}
        tableActions={
          <CustomersTableActions
            tableToolbarProps={tableToolbarProps}
            sortPreset={sortPreset}
            onSortPresetChange={setSortPreset}
            lifecycleFilter={lifecycleFilter}
            onLifecycleFilterChange={setLifecycleFilter}
          />
        }
      />

      <div className="min-h-0 flex-1">
        {filteredCustomers.length > 0 ? (
          layoutMode === "table" ? (
            <CustomersTable
              customers={filteredCustomers}
              onCustomersChange={handleVisibleCustomersChange}
              onOpenCustomerDrawer={openCustomerDrawer}
              onToolbarPropsChange={setTableToolbarProps}
            />
          ) : (
            <CustomerCardGrid
              customers={filteredCustomers}
              onOpenCustomerDrawer={openCustomerDrawer}
            />
          )
        ) : (
          <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center">
            <div>
              <p className="text-sm font-medium text-foreground">
                No customers match the current filters
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening the search, or switch back to all lifecycle stages
                to recover the list.
              </p>
            </div>
          </div>
        )}
      </div>

      {layoutMode === "table" ? (
        <CustomersSelectionActionBar
          tableToolbarProps={tableToolbarProps}
          onMarkHealthy={() =>
            mutateSelectedCustomers((customer) => ({
              ...customer,
              health: "healthy",
            }))
          }
          onMoveToWatch={() =>
            mutateSelectedCustomers((customer) => ({ ...customer, health: "watch" }))
          }
          onArchive={() =>
            mutateSelectedCustomers((customer) => ({
              ...customer,
              lifecycle: "archived",
              health: customer.health === "at_risk" ? "watch" : customer.health,
            }))
          }
          onExportSelection={exportSelection}
          overlayStyle={pageContentOverlayStyle}
        />
      ) : null}

      <CustomerDrawer
        open={drawerCustomer !== null}
        customer={drawerCustomer}
        currentIndex={drawerCustomerIndex}
        totalCount={filteredCustomers.length}
        onPrevious={() => openCustomerDrawerAtIndex(drawerCustomerIndex - 1)}
        onNext={() => openCustomerDrawerAtIndex(drawerCustomerIndex + 1)}
        onClose={closeCustomerDrawer}
        onViewProfile={handleViewCustomerProfile}
      />
    </div>
  )
}
