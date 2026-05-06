"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconDots,
  IconFilter,
  IconInfoCircle,
  IconSearch,
  IconPlus,
} from "@tabler/icons-react"

import { type ActivityTimelineItem } from "@/components/activity/activity-timeline"
import { CustomerAssetsFilesTab } from "@/components/customers/customer-assets-files-tab"
import { CustomerInitialAvatar } from "@/components/customers/customer-initial-avatar"
import { CustomerMetricsGrid } from "@/components/customers/customer-metrics-grid"
import { getCustomerBrandPresentation } from "@/components/customers/customer-brand"
import {
  SharedActivityTabContent,
  SharedInternalNotesTabContent,
} from "@/components/detail-tabs/shared-activity-notes-tab-content"
import {
  DetailRightPanelShell,
  type DetailRightPanelSection,
} from "@/components/detail-right-panel-shell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { currentUser } from "@/lib/current-user"
import {
  buildCustomerInternalNotes,
  buildCustomerTicketRows,
  buildCustomerDetailMetrics,
  customerDetailTabs,
  customerTicketPriorityFilterOptions,
  customerTicketTypeFilterOptions,
  customerTicketTypeLabels,
  normalizeCustomerDetailTab,
  normalizeCustomerTicketPriorityFilter,
  normalizeCustomerTicketTypeFilter,
  type CustomerDetailTab,
  type CustomerTicketPriorityFilter,
  type CustomerTicketTypeFilter,
} from "@/lib/customers/detail-view-model"
import {
  customerTicketPriorityDotClassName,
  customerTicketPriorityToneClassName,
  customerTicketStatusToneClassName,
} from "@/lib/customers/presentation"
import { type Customer, type CustomerAttachment } from "@/lib/customers/types"
import { cn } from "@/lib/utils"

type CustomerDetailPageProps = {
  customer: Customer
  initialTab: CustomerDetailTab
  initialQuery: string
  initialType: CustomerTicketTypeFilter
  initialPriority: CustomerTicketPriorityFilter
}

type QueryPatch = {
  tab?: CustomerDetailTab
  q?: string
  type?: CustomerTicketTypeFilter
  priority?: CustomerTicketPriorityFilter
  requestDate?: string
}

type CustomerRightPanelSection = "details" | "company" | "filters"

const detailTabLabel: Record<CustomerDetailTab, string> = {
  ticket: "Tickets",
  activity: "Activity",
  attachment: "Attachments",
  notes: "Notes",
}

const customerRightPanelSections: Array<
  DetailRightPanelSection<CustomerRightPanelSection>
> = [
  { value: "details", label: "Customer Details", icon: IconInfoCircle },
  { value: "company", label: "Company", icon: IconBuilding },
  { value: "filters", label: "Ticket Filters", icon: IconFilter },
]

const responseToneClassName = {
  "Slow response":
    "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  "Steady cadence":
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "Healthy cadence":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
} as const

function buildActivityItems(customer: Customer): ActivityTimelineItem[] {
  return customer.activityEvents.map((event) => ({
    id: event.id,
    title: event.title,
    detail: event.detail,
    timestamp: event.timestamp,
    tone: "neutral",
  }))
}

function parsePersistedCustomerAttachments(
  persistedValue: string | null
): CustomerAttachment[] | null {
  if (!persistedValue) return null

  try {
    const parsed = JSON.parse(persistedValue)
    if (!Array.isArray(parsed)) return null

    const validItems = parsed.filter((item) => {
      if (!item || typeof item !== "object") return false
      if (typeof item.id !== "string" || item.id.length === 0) return false
      if (typeof item.name !== "string" || item.name.length === 0) return false
      if (typeof item.type !== "string") return false
      if (typeof item.sizeMB !== "number") return false
      if (typeof item.url !== "string") return false
      if (typeof item.addedAt !== "string") return false
      if (!item.addedBy || typeof item.addedBy.name !== "string") return false
      if (!item.source || typeof item.source.kind !== "string") return false

      return true
    }) as CustomerAttachment[]

    return validItems
  } catch {
    return null
  }
}

function mergeCustomerAttachments(
  baseItems: CustomerAttachment[],
  persistedItems: CustomerAttachment[]
): CustomerAttachment[] {
  const mergedById = new Map<string, CustomerAttachment>()

  for (const item of persistedItems) {
    mergedById.set(item.id, item)
  }

  for (const item of baseItems) {
    if (!mergedById.has(item.id)) {
      mergedById.set(item.id, item)
    }
  }

  return Array.from(mergedById.values())
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatFilterLabel(
  typeFilter: CustomerTicketTypeFilter,
  priorityFilter: CustomerTicketPriorityFilter,
  requestDateFilter: string
) {
  const labels: string[] = []

  if (typeFilter !== "all") labels.push(customerTicketTypeLabels[typeFilter])
  if (priorityFilter !== "all") {
    labels.push(`${priorityFilter[0].toUpperCase()}${priorityFilter.slice(1)}`)
  }
  if (requestDateFilter !== "all") labels.push(requestDateFilter)

  if (labels.length === 0) return "Filter"
  return `Filter (${labels.length})`
}

function FieldRow({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-b border-border/70 py-3 last:border-b-0",
        className
      )}
    >
      <p className="text-xs tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  )
}

function EditableFieldList({
  label,
  values,
  placeholder,
  renderValue,
  onAddValue,
  valueLayout = "stack",
  className,
}: {
  label: string
  values: string[]
  placeholder: string
  renderValue: (value: string) => React.ReactNode
  onAddValue: (value: string) => void
  valueLayout?: "stack" | "inline-wrap"
  className?: string
}) {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [draftValue, setDraftValue] = useState("")

  const commitDraft = () => {
    const nextValue = draftValue.trim()
    if (!nextValue || values.includes(nextValue)) return

    onAddValue(nextValue)
    setDraftValue("")
  }

  return (
    <div
      className={cn(
        "border-b border-border/70 py-3 last:border-b-0",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 rounded-md text-muted-foreground"
          aria-label={`Add ${label.toLowerCase()}`}
          onClick={() => setIsComposerOpen((current) => !current)}
        >
          <IconPlus className="size-4" />
        </Button>
      </div>

      <div
        className={cn(
          "text-sm text-foreground",
          valueLayout === "inline-wrap"
            ? "flex flex-wrap items-center gap-1.5"
            : "space-y-1"
        )}
      >
        {values.map((value) => (
          <div key={value} className={cn(valueLayout === "inline-wrap" && "shrink-0")}>
            {renderValue(value)}
          </div>
        ))}
      </div>

      {isComposerOpen ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-2">
          <IconPlus className="size-4 text-muted-foreground" />
          <input
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault()
                commitDraft()
              }

              if (event.key === "Escape") {
                event.preventDefault()
                setIsComposerOpen(false)
                setDraftValue("")
              }
            }}
            onBlur={commitDraft}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      ) : null}
    </div>
  )
}

function CustomerTicketFilterPanel({
  draftTypeFilter,
  draftPriorityFilter,
  draftRequestDateFilter,
  requestDateOptions,
  onTypeChange,
  onPriorityChange,
  onRequestDateChange,
  onReset,
  onApply,
  className,
}: {
  draftTypeFilter: CustomerTicketTypeFilter
  draftPriorityFilter: CustomerTicketPriorityFilter
  draftRequestDateFilter: string
  requestDateOptions: string[]
  onTypeChange: (nextValue: CustomerTicketTypeFilter) => void
  onPriorityChange: (nextValue: CustomerTicketPriorityFilter) => void
  onRequestDateChange: (nextValue: string) => void
  onReset: () => void
  onApply: () => void
  className?: string
}) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">
          Filter Tickets
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg"
          onClick={onReset}
        >
          Reset
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
          Ticket Type
        </p>
        <div className="flex flex-wrap gap-2">
          {customerTicketTypeFilterOptions.map((typeOption) => (
            <Button
              key={typeOption}
              variant={draftTypeFilter === typeOption ? "secondary" : "outline"}
              size="sm"
              className="h-8 rounded-full"
              onClick={() => onTypeChange(typeOption)}
            >
              {typeOption === "all"
                ? "All"
                : customerTicketTypeLabels[typeOption]}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
          Ticket Priority
        </p>
        <div className="flex flex-wrap gap-2">
          {customerTicketPriorityFilterOptions.map((priorityOption) => {
            const isActive = draftPriorityFilter === priorityOption

            return (
              <Button
                key={priorityOption}
                variant={isActive ? "secondary" : "outline"}
                size="sm"
                className="h-8 rounded-full"
                onClick={() => onPriorityChange(priorityOption)}
              >
                {priorityOption === "all" ? (
                  "All"
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        customerTicketPriorityDotClassName[priorityOption]
                      )}
                    />
                    {priorityOption[0].toUpperCase()}
                    {priorityOption.slice(1)}
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
          Request Date
        </p>
        <div className="flex flex-wrap gap-2">
          {requestDateOptions.map((requestDateOption) => (
            <Button
              key={requestDateOption}
              variant={
                draftRequestDateFilter === requestDateOption
                  ? "secondary"
                  : "outline"
              }
              size="sm"
              className="h-8 rounded-full"
              onClick={() => onRequestDateChange(requestDateOption)}
            >
              {requestDateOption === "all" ? "All" : requestDateOption}
            </Button>
          ))}
        </div>
      </div>

      <Button className="w-full rounded-xl" onClick={onApply}>
        Apply
      </Button>
    </section>
  )
}

export function CustomerDetailPage({
  customer,
  initialTab,
  initialQuery,
  initialType,
  initialPriority,
}: CustomerDetailPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const attachmentStorageKey = `gray-csm:customer-attachments:${customer.id}`
  const didHydrateAttachmentsRef = useRef(false)

  const [draftTypeFilter, setDraftTypeFilter] =
    useState<CustomerTicketTypeFilter>(initialType)
  const [draftPriorityFilter, setDraftPriorityFilter] =
    useState<CustomerTicketPriorityFilter>(initialPriority)
  const [draftRequestDateFilter, setDraftRequestDateFilter] = useState("all")
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([])
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isDesktopRightPanelOpen, setIsDesktopRightPanelOpen] = useState(true)
  const [activeRightPanelSection, setActiveRightPanelSection] =
    useState<CustomerRightPanelSection>("details")
  const [phoneNumbers, setPhoneNumbers] = useState([customer.phoneNumber])
  const [emailAddresses, setEmailAddresses] = useState([
    customer.primaryContactEmail,
    ...customer.alternateEmails,
  ])
  const [languagesSpoken, setLanguagesSpoken] = useState(
    customer.languagesSpoken
  )
  const [attachments, setAttachments] = useState<CustomerAttachment[]>(
    customer.attachments
  )
  const [notes, setNotes] = useState(() => buildCustomerInternalNotes(customer))
  const [noteDraft, setNoteDraft] = useState("")

  const isRightPanelOpen = !isMobile && isDesktopRightPanelOpen

  useEffect(() => {
    if (typeof window === "undefined") return

    didHydrateAttachmentsRef.current = false
    const persistedItems = parsePersistedCustomerAttachments(
      window.localStorage.getItem(attachmentStorageKey)
    )

    const frameId = window.requestAnimationFrame(() => {
      if (persistedItems) {
        setAttachments(
          mergeCustomerAttachments(customer.attachments, persistedItems)
        )
      } else {
        setAttachments(customer.attachments)
      }

      didHydrateAttachmentsRef.current = true
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [attachmentStorageKey, customer.attachments])

  useEffect(() => {
    if (!didHydrateAttachmentsRef.current) return
    if (typeof window === "undefined") return

    try {
      window.localStorage.setItem(
        attachmentStorageKey,
        JSON.stringify(attachments)
      )
    } catch {
      // Ignore persistence failures (private mode, quota, etc.).
    }
  }, [attachmentStorageKey, attachments])

  const activityItems = useMemo(() => buildActivityItems(customer), [customer])
  const allTicketRows = useMemo(
    () => buildCustomerTicketRows(customer),
    [customer]
  )
  const requestDateOptions = useMemo(
    () => [
      "all",
      ...Array.from(new Set(allTicketRows.map((row) => row.requestDate))),
    ],
    [allTicketRows]
  )
  const activeTab = searchParams.has("tab")
    ? normalizeCustomerDetailTab(searchParams.get("tab"))
    : initialTab
  const query = searchParams.get("q") ?? initialQuery
  const appliedTypeFilter = searchParams.has("type")
    ? normalizeCustomerTicketTypeFilter(searchParams.get("type"))
    : initialType
  const appliedPriorityFilter = searchParams.has("priority")
    ? normalizeCustomerTicketPriorityFilter(searchParams.get("priority"))
    : initialPriority
  const appliedRequestDateFilter = requestDateOptions.includes(
    searchParams.get("requestDate") ?? ""
  )
    ? (searchParams.get("requestDate") ?? "all")
    : "all"
  const summaryMetrics = useMemo(() => buildCustomerDetailMetrics(customer), [customer])

  const filteredTicketRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return allTicketRows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${row.ticketNumber} ${row.subject}`
              .toLowerCase()
              .includes(normalizedQuery)

      const matchesType =
        appliedTypeFilter === "all" ? true : row.type === appliedTypeFilter
      const matchesPriority =
        appliedPriorityFilter === "all"
          ? true
          : row.priority === appliedPriorityFilter
      const matchesRequestDate =
        appliedRequestDateFilter === "all"
          ? true
          : row.requestDate === appliedRequestDateFilter

      return (
        matchesQuery && matchesType && matchesPriority && matchesRequestDate
      )
    })
  }, [
    allTicketRows,
    appliedPriorityFilter,
    appliedRequestDateFilter,
    appliedTypeFilter,
    query,
  ])

  const visibleSelectedTicketIds = useMemo(() => {
    const visibleRowIds = new Set(filteredTicketRows.map((row) => row.id))
    return selectedTicketIds.filter((ticketId) => visibleRowIds.has(ticketId))
  }, [filteredTicketRows, selectedTicketIds])

  const replaceQuery = (patch: QueryPatch) => {
    const nextParams = new URLSearchParams(searchParams.toString())

    const nextTab = patch.tab ?? activeTab
    const nextQuery = patch.q ?? query
    const nextType = patch.type ?? appliedTypeFilter
    const nextPriority = patch.priority ?? appliedPriorityFilter
    const nextRequestDate = patch.requestDate ?? appliedRequestDateFilter

    if (nextTab === "ticket") {
      nextParams.delete("tab")
    } else {
      nextParams.set("tab", nextTab)
    }

    if (nextQuery.trim().length === 0) {
      nextParams.delete("q")
    } else {
      nextParams.set("q", nextQuery)
    }

    if (nextType === "all") {
      nextParams.delete("type")
    } else {
      nextParams.set("type", nextType)
    }

    if (nextPriority === "all") {
      nextParams.delete("priority")
    } else {
      nextParams.set("priority", nextPriority)
    }

    if (nextRequestDate === "all") {
      nextParams.delete("requestDate")
    } else {
      nextParams.set("requestDate", nextRequestDate)
    }

    const nextQueryString = nextParams.toString()
    router.replace(
      nextQueryString.length > 0 ? `${pathname}?${nextQueryString}` : pathname,
      {
        scroll: false,
      }
    )
  }

  const toggleTicketSelection = (ticketId: string, checked: boolean) => {
    setSelectedTicketIds((current) => {
      if (checked) {
        return current.includes(ticketId) ? current : [...current, ticketId]
      }

      return current.filter((currentId) => currentId !== ticketId)
    })
  }

  const applyTicketFilters = () => {
    replaceQuery({
      type: draftTypeFilter,
      priority: draftPriorityFilter,
      requestDate: draftRequestDateFilter,
    })
    setIsMobileFilterOpen(false)
  }

  const handleAddInternalNote = () => {
    const trimmedNote = noteDraft.trim()
    if (!trimmedNote) return

    setNotes((currentNotes) => [
      {
        id: `${customer.id}-internal-note-${Date.now()}`,
        author: {
          name: currentUser.name,
          avatarUrl: currentUser.avatar,
          email: currentUser.email,
        },
        timestamp: "Now",
        body: trimmedNote,
      },
      ...currentNotes,
    ])
    setNoteDraft("")
  }

  const handleCreateAttachments = (newFiles: CustomerAttachment[]) => {
    setAttachments((currentFiles) => [...newFiles, ...currentFiles])
  }

  const handleDeleteAttachment = (fileId: string) => {
    setAttachments((currentFiles) =>
      currentFiles.filter((file) => file.id !== fileId)
    )
  }

  const handleEditAttachment = (
    fileId: string,
    patch: Partial<
      Pick<CustomerAttachment, "name" | "url" | "type" | "isLinkAsset">
    >
  ) => {
    setAttachments((currentFiles) =>
      currentFiles.map((file) =>
        file.id === fileId
          ? {
              ...file,
              ...patch,
            }
          : file
      )
    )
  }

  const openTicketFilters = () => {
    setDraftTypeFilter(appliedTypeFilter)
    setDraftPriorityFilter(appliedPriorityFilter)
    setDraftRequestDateFilter(appliedRequestDateFilter)

    if (isMobile) {
      setIsMobileFilterOpen(true)
      return
    }

    setActiveRightPanelSection("filters")
    setIsDesktopRightPanelOpen(true)
  }

  const allFilteredRowsSelected =
    filteredTicketRows.length > 0 &&
    visibleSelectedTicketIds.length === filteredTicketRows.length

  const brand = getCustomerBrandPresentation(customer.id, customer.companyName)
  const BrandIcon = brand.icon

  const renderFilterPanel = () => (
    <CustomerTicketFilterPanel
      draftTypeFilter={draftTypeFilter}
      draftPriorityFilter={draftPriorityFilter}
      draftRequestDateFilter={draftRequestDateFilter}
      requestDateOptions={requestDateOptions}
      onTypeChange={setDraftTypeFilter}
      onPriorityChange={setDraftPriorityFilter}
      onRequestDateChange={setDraftRequestDateFilter}
      onReset={() => {
        setDraftTypeFilter("all")
        setDraftPriorityFilter("all")
        setDraftRequestDateFilter("all")
      }}
      onApply={applyTicketFilters}
    />
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-center justify-between gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-2 sm:px-3"
          onClick={() => router.push("/customers")}
          aria-label="Back to customers"
        >
          <IconArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to Customers</span>
          <span className="sr-only sm:hidden">Back to Customers</span>
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
                  onClick={() => replaceQuery({ tab: "activity" })}
                >
                  View activity
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => replaceQuery({ tab: "notes" })}
                >
                  Open internal notes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openTicketFilters}>
                  Open ticket filters
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <section className="shrink-0">
        <div className="space-y-3 px-1 pt-1 sm:pt-5 sm:pl-3">
          <div className="flex min-w-0 items-center gap-3">
            <CustomerInitialAvatar
              name={customer.primaryContactName}
              size="lg"
            />
            <div className="min-w-0">
              <h1 className="truncate text-[20px] leading-7 font-semibold tracking-tight text-foreground">
                {customer.primaryContactName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Avatar className="size-4" size="sm">
                    <AvatarFallback
                      className={cn(
                        "text-[9px] font-semibold",
                        brand.className
                      )}
                    >
                      {BrandIcon ? (
                        <BrandIcon className="size-3" />
                      ) : (
                        brand.fallback
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {customer.companyName}
                </span>
                <Badge variant="outline" className="border-border/80">
                  {customer.owner.name}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto text-sm whitespace-nowrap text-muted-foreground max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden">
            <div className="inline-flex items-center gap-2">
              <span>Plan</span>
              <span className="font-medium text-foreground">
                {customer.plan}
              </span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <div className="inline-flex items-center gap-2">
              <span>Region</span>
              <span className="font-medium text-foreground">
                {customer.region}
              </span>
            </div>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <div className="inline-flex items-center gap-2">
              <IconCalendar className="size-4" />
              <span>First contact {customer.firstContactDate}</span>
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
            onValueChange={(nextTab) =>
              replaceQuery({ tab: normalizeCustomerDetailTab(nextTab) })
            }
            className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col"
          >
            <div className="shrink-0 border-b px-4">
              <TabsList
                variant="line"
                className="w-full justify-start gap-2 rounded-none p-0"
              >
                {customerDetailTabs.map((tabValue) => (
                  <TabsTrigger key={tabValue} value={tabValue}>
                    {detailTabLabel[tabValue]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent
              value="ticket"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <div className="scrollbar-hidden h-full overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  <CustomerMetricsGrid metrics={summaryMetrics} />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                      <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={query}
                        onChange={(event) => {
                          const nextQuery = event.target.value
                          replaceQuery({ q: nextQuery })
                        }}
                        placeholder="Search by ticket ID or subject"
                        className="h-9 rounded-xl bg-transparent pl-9"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl"
                        onClick={openTicketFilters}
                      >
                        <IconFilter className="size-4" />
                        {formatFilterLabel(
                          appliedTypeFilter,
                          appliedPriorityFilter,
                          appliedRequestDateFilter
                        )}
                      </Button>
                      <Button size="sm" className="h-9 rounded-xl">
                        Add new ticket
                      </Button>
                      {appliedTypeFilter !== "all" ||
                      appliedPriorityFilter !== "all" ||
                      appliedRequestDateFilter !== "all" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 rounded-xl"
                          onClick={() => {
                            setDraftTypeFilter("all")
                            setDraftPriorityFilter("all")
                            setDraftRequestDateFilter("all")
                            replaceQuery({
                              type: "all",
                              priority: "all",
                              requestDate: "all",
                            })
                          }}
                        >
                          Clear
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
                    <Table containerClassName="max-h-[52vh]">
                      <TableHeader className="sticky top-0 z-10 bg-card">
                        <TableRow>
                          <TableHead className="w-10 px-3">
                            <Checkbox
                              aria-label="Select all tickets"
                              checked={allFilteredRowsSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTicketIds(
                                    filteredTicketRows.map((row) => row.id)
                                  )
                                } else {
                                  setSelectedTicketIds([])
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead className="px-2">Ticket ID</TableHead>
                          <TableHead className="px-2">Subject</TableHead>
                          <TableHead className="px-2">Priority</TableHead>
                          <TableHead className="px-2">Type</TableHead>
                          <TableHead className="px-2">Request Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTicketRows.length > 0 ? (
                          filteredTicketRows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="px-3 py-3.5">
                                <Checkbox
                                  aria-label={`Select ticket ${row.ticketNumber}`}
                                  checked={selectedTicketIds.includes(row.id)}
                                  onCheckedChange={(checked) =>
                                    toggleTicketSelection(
                                      row.id,
                                      checked === true
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="px-2 py-3.5 font-mono text-sm text-muted-foreground">
                                {row.ticketNumber}
                              </TableCell>
                              <TableCell className="max-w-[22rem] px-2 py-3.5">
                                <TooltipProvider>
                                  <div className="flex min-w-0 items-center gap-2">
                                    <Tooltip>
                                      <TooltipTrigger
                                        type="button"
                                        className="min-w-0 truncate text-left font-medium text-foreground outline-none hover:underline focus-visible:underline"
                                        onClick={() =>
                                          router.push(`/tickets/${row.id}`)
                                        }
                                      >
                                        {row.subject}
                                      </TooltipTrigger>
                                      <TooltipContent side="top" align="start">
                                        {row.subject}
                                      </TooltipContent>
                                    </Tooltip>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "shrink-0 border-0",
                                        customerTicketStatusToneClassName[
                                          row.status
                                        ]
                                      )}
                                    >
                                      {row.status}
                                    </Badge>
                                  </div>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell className="px-2 py-3.5">
                                <Badge
                                  className={cn(
                                    "border-0 capitalize",
                                    customerTicketPriorityToneClassName[
                                      row.priority
                                    ]
                                  )}
                                >
                                  {row.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-2 py-3.5">
                                <Badge
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  {customerTicketTypeLabels[row.type]}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-2 py-3.5 text-sm text-muted-foreground">
                                {row.requestDate}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="px-4 py-12 text-center text-sm text-muted-foreground"
                            >
                              No ticket matches your search or filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="activity"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <SharedActivityTabContent items={activityItems} />
            </TabsContent>

            <TabsContent
              value="attachment"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <CustomerAssetsFilesTab
                items={attachments}
                currentUser={{
                  name: currentUser.name,
                  email: currentUser.email,
                  avatarUrl: currentUser.avatar,
                }}
                onCreate={handleCreateAttachments}
                onDelete={handleDeleteAttachment}
                onEdit={handleEditAttachment}
              />
            </TabsContent>

            <TabsContent
              value="notes"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <SharedInternalNotesTabContent
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

        <DetailRightPanelShell
          open={isRightPanelOpen}
          sections={customerRightPanelSections}
          activeSection={activeRightPanelSection}
          onToggleOpen={() => setIsDesktopRightPanelOpen((isOpen) => !isOpen)}
          onSelectSection={(nextSection) => {
            if (nextSection === "filters") {
              setDraftTypeFilter(appliedTypeFilter)
              setDraftPriorityFilter(appliedPriorityFilter)
              setDraftRequestDateFilter(appliedRequestDateFilter)
            }

            setActiveRightPanelSection(nextSection)
            setIsDesktopRightPanelOpen(true)
          }}
          renderSection={(section) => {
            if (section === "filters") {
              return renderFilterPanel()
            }

            if (section === "company") {
              return (
                <div className="space-y-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-10 border bg-background" size="lg">
                      <AvatarFallback
                        className={cn("text-xs font-semibold", brand.className)}
                      >
                        {BrandIcon ? (
                          <BrandIcon className="size-5" />
                        ) : (
                          brand.fallback
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {customer.companyName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.companyProfile.tier}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <FieldRow
                      label="Contacts"
                      value={customer.companyProfile.contactsCount}
                    />
                    <FieldRow label="Plan" value={customer.plan} />
                    <FieldRow
                      label="Account manager"
                      value={customer.companyProfile.accountManager}
                    />
                    <FieldRow
                      label="Renewal"
                      value={customer.companyProfile.renewalDate}
                    />
                    <FieldRow
                      label="ARR"
                      value={formatCurrency(customer.annualValue)}
                    />
                    <FieldRow
                      label="Seats"
                      value={new Intl.NumberFormat("en-US").format(
                        customer.seats
                      )}
                    />
                  </div>

                  <FieldRow
                    label="Product areas"
                    value={
                      <div className="flex flex-wrap gap-1.5">
                        {customer.productAreas.map((area) => (
                          <Badge
                            key={area}
                            variant="outline"
                            className="rounded-full"
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    }
                  />

                  <FieldRow
                    label="Risk signals"
                    value={
                      <div className="space-y-1.5">
                        {customer.riskSignals.map((riskSignal) => (
                          <div key={riskSignal}>{riskSignal}</div>
                        ))}
                      </div>
                    }
                  />
                </div>
              )
            }

            return (
              <div className="space-y-1">
                <FieldRow label="Source" value={customer.source} />
                <EditableFieldList
                  label="Phone"
                  values={phoneNumbers}
                  placeholder="Add phone number"
                  onAddValue={(value) =>
                    setPhoneNumbers((current) => [...current, value])
                  }
                  renderValue={(value) => (
                    <a
                      href={`tel:${value.replace(/[^\d+]/g, "")}`}
                      className="text-foreground hover:underline"
                    >
                      {value}
                    </a>
                  )}
                />
                <EditableFieldList
                  label="Email"
                  values={emailAddresses}
                  placeholder="Add email"
                  onAddValue={(value) =>
                    setEmailAddresses((current) => [...current, value])
                  }
                  renderValue={(value) => (
                    <a
                      href={`mailto:${value}`}
                      className="block text-foreground hover:underline"
                    >
                      {value}
                    </a>
                  )}
                />
                <FieldRow label="Location" value={customer.region} />
                <EditableFieldList
                  label="Language spoken"
                  values={languagesSpoken}
                  placeholder="Add language"
                  onAddValue={(value) =>
                    setLanguagesSpoken((current) => [...current, value])
                  }
                  valueLayout="inline-wrap"
                  renderValue={(value) => (
                    <Badge variant="outline" className="rounded-full">
                      {value}
                    </Badge>
                  )}
                />
                <FieldRow label="Timezone" value={customer.timezone} />
                <FieldRow
                  label="Response time"
                  value={
                    <Badge
                      className={cn(
                        "border-0",
                        responseToneClassName[
                          customer.responseTimeLabel as keyof typeof responseToneClassName
                        ] ?? responseToneClassName["Steady cadence"]
                      )}
                    >
                      {customer.responseTimeLabel}
                    </Badge>
                  }
                />
                <FieldRow
                  label="Description"
                  value={customer.summary}
                  className="border-b-0 pb-0"
                />
              </div>
            )
          }}
        />
      </div>

      <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl p-0"
          showCloseButton={false}
        >
          <SheetHeader className="border-b border-border/70 pb-3">
            <SheetTitle>Filter Tickets</SheetTitle>
            <SheetDescription>
              Refine by ticket type and priority.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4">{renderFilterPanel()}</div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
