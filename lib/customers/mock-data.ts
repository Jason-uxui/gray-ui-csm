import { currentUser } from "@/lib/current-user"
import type {
  CustomerActivityEvent,
  CustomerAttachment,
  Customer,
  CustomerRecentTicket,
  CustomerLifecycle,
  CustomerOwner,
  CustomerSidebarGroup,
  CustomerViewKey,
} from "@/lib/customers/types"

type RawCustomer = Omit<
  Customer,
  | "alternateEmails"
  | "phoneNumber"
  | "source"
  | "responseTimeLabel"
  | "languagesSpoken"
  | "timezone"
  | "firstContactDate"
  | "recentTickets"
  | "attachments"
  | "activityEvents"
  | "companyProfile"
> & {
  recentTickets: Omit<CustomerRecentTicket, "assigneeLabel" | "requestDate">[]
}

const owners: Record<string, CustomerOwner> = {
  jason: {
    name: currentUser.name,
    email: currentUser.email,
    avatarUrl: currentUser.avatar,
  },
  maya: {
    name: "Maya Patel",
    email: "maya@opensource-demo.dev",
  },
  sofia: {
    name: "Sofia Nguyen",
    email: "sofia@opensource-demo.dev",
  },
  devon: {
    name: "Devon Reed",
    email: "devon@opensource-demo.dev",
  },
}

const alternateEmailsByCompany: Partial<Record<string, string[]>> = {
  "Lattice Cloud": ["amelia.ops@latticecloud.io"],
  "Northstar Health": ["daniel.team@northstarhealth.com"],
  AeroLoft: ["nina.ops@aeroloft.co"],
  "Polar Banking": ["marcus.pm@polarbanking.fi"],
  BrightHarbor: ["olivia.ops@brightharbor.com"],
  "Fieldhouse Retail": ["jared.support@fieldhouse-retail.com"],
  "Cinder AI": ["ruby.success@cinder.ai"],
  "Summit Grid": ["leah.ops@summitgrid.energy"],
  "Verdant Pay": ["isaac.finance@verdantpay.com"],
  "Maple Security": ["evelyn.audit@maplesecurity.ca"],
  "Orbit Fulfillment": ["hugo.ops@orbitfulfillment.mx"],
  "Blueforge Labs": ["mina.exec@blueforge.ai"],
  "Helios Energy": ["patrick.ops@heliosenergy.eu"],
}

const regionMetadata: Record<
  string,
  { languagesSpoken: string[]; timezone: string; source: string }
> = {
  Singapore: {
    languagesSpoken: ["English", "Mandarin"],
    timezone: "UTC+08:00",
    source: "Executive expansion motion",
  },
  "United States": {
    languagesSpoken: ["English", "Spanish"],
    timezone: "UTC-05:00",
    source: "Customer success portfolio",
  },
  "United Kingdom": {
    languagesSpoken: ["English", "Italian"],
    timezone: "UTC+00:00",
    source: "Implementation handoff",
  },
  Nordics: {
    languagesSpoken: ["English", "Swedish"],
    timezone: "UTC+01:00",
    source: "Executive expansion motion",
  },
  Australia: {
    languagesSpoken: ["English"],
    timezone: "UTC+10:00",
    source: "Customer success portfolio",
  },
  "Hong Kong": {
    languagesSpoken: ["English", "Cantonese"],
    timezone: "UTC+08:00",
    source: "Regional success motion",
  },
  Canada: {
    languagesSpoken: ["English", "French"],
    timezone: "UTC-05:00",
    source: "Customer success portfolio",
  },
  Germany: {
    languagesSpoken: ["German", "English"],
    timezone: "UTC+01:00",
    source: "Executive recovery motion",
  },
  Mexico: {
    languagesSpoken: ["Spanish", "English"],
    timezone: "UTC-06:00",
    source: "Regional expansion motion",
  },
}

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

function getTextSeed(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function formatEventTimestamp(date: string, seed: number) {
  const [monthRaw, dayRaw, yearRaw] = date.split("/")
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  const year = Number(yearRaw)

  if (
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(year) ||
    month <= 0 ||
    month > 12
  ) {
    return date
  }

  const hour24 = 8 + (seed % 10)
  const minute = (seed * 7) % 60
  const hour12 = hour24 % 12 || 12
  const meridiem = hour24 >= 12 ? "PM" : "AM"

  return `${hour12}:${String(minute).padStart(2, "0")} ${meridiem} · ${monthLabels[month - 1]} ${day}, ${year}`
}

function buildPhoneNumber(customerId: string) {
  const seed = customerId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const partA = String(200 + (seed % 700)).padStart(3, "0")
  const partB = String(100 + (seed % 900)).padStart(3, "0")
  const partC = String(1000 + (seed % 9000)).padStart(4, "0")
  return `(${partA}) ${partB}-${partC}`
}

function buildFirstContactDate(
  customer: Pick<Customer, "id" | "region" | "seats">
) {
  const seed = customer.id.length + customer.region.length + customer.seats
  const month = ((seed % 12) + 1).toString().padStart(2, "0")
  const day = ((seed % 27) + 1).toString().padStart(2, "0")
  return `${month}/${day}/2023`
}

function buildResponseTimeLabel(customer: Pick<Customer, "health">) {
  if (customer.health === "at_risk") return "Slow response"
  if (customer.health === "watch") return "Steady cadence"
  return "Healthy cadence"
}

function buildTicketMetadata(
  ticket: RawCustomer["recentTickets"][number],
  ownerName: string
) {
  const seed = ticket.id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const month = ((seed % 12) + 1).toString().padStart(2, "0")
  const day = ((seed % 27) + 1).toString().padStart(2, "0")

  return {
    ...ticket,
    assigneeLabel:
      ticket.priority === "high"
        ? ownerName
        : ticket.status === "resolved"
          ? "Support ops"
          : "Customer success",
    requestDate: `${month}/${day}/2024`,
  }
}

function buildCompanyProfile(customer: RawCustomer) {
  const contactsCount = Math.max(
    3,
    Math.round(
      customer.seats /
        (customer.plan === "Enterprise" || customer.segment === "Enterprise"
          ? 18
          : 12)
    )
  )
  const renewalSeed = getTextSeed(customer.id) + customer.seats
  const renewalMonth = (renewalSeed % 12) + 1
  const renewalDay = (renewalSeed % 26) + 1

  return {
    companyDisplayName: customer.companyName,
    contactsCount,
    tier: customer.plan === "Enterprise" ? "Enterprise" : customer.segment,
    accountManager: customer.owner.name,
    renewalDate: `${monthLabels[renewalMonth - 1]} ${renewalDay}, 2026`,
    revenue: customer.annualValue,
  }
}

function buildActivityEvents(
  customer: RawCustomer,
  tickets: CustomerRecentTicket[],
  firstContactDate: string
): CustomerActivityEvent[] {
  const events: CustomerActivityEvent[] = [
    {
      id: `${customer.id}-contact-added`,
      title: `${customer.primaryContactName} added to contacts`,
      detail: `Primary contact was linked under ${customer.companyName} and assigned to ${customer.owner.name}.`,
      timestamp: formatEventTimestamp(
        firstContactDate,
        getTextSeed(customer.primaryContactName)
      ),
      tone: "positive",
    },
  ]

  for (const ticket of tickets.slice(0, 3)) {
    const actionLabel =
      ticket.status === "resolved"
        ? "resolved"
        : ticket.status === "pending"
          ? "updated"
          : "opened"

    events.push({
      id: `${customer.id}-${ticket.id}-activity`,
      title: `Ticket #${ticket.id} ${actionLabel}`,
      detail:
        ticket.status === "resolved"
          ? `${ticket.subject} was resolved by ${ticket.assigneeLabel}.`
          : ticket.status === "pending"
            ? `${ticket.subject} is pending owner follow-up from ${ticket.assigneeLabel}.`
            : `${ticket.subject} was opened and routed to ${ticket.assigneeLabel}.`,
      timestamp: formatEventTimestamp(
        ticket.requestDate,
        getTextSeed(ticket.id)
      ),
      tone:
        ticket.status === "resolved"
          ? "positive"
          : ticket.priority === "high"
            ? "warning"
            : "neutral",
    })
  }

  events.push({
    id: `${customer.id}-created`,
    title: `${customer.primaryContactName} created by ${customer.owner.name}`,
    detail: `${customer.companyName} entered the portfolio under the ${customer.plan} plan.`,
    timestamp: formatEventTimestamp(
      firstContactDate,
      getTextSeed(customer.owner.name)
    ),
    tone: "neutral",
  })

  return events
}

function inferAttachmentTypeFromSubject(subject: string): CustomerAttachment["type"] {
  const normalizedSubject = subject.toLowerCase()
  if (
    normalizedSubject.includes("invoice") ||
    normalizedSubject.includes("contract") ||
    normalizedSubject.includes("report") ||
    normalizedSubject.includes("pdf")
  ) {
    return "pdf"
  }
  if (
    normalizedSubject.includes("sheet") ||
    normalizedSubject.includes("export") ||
    normalizedSubject.includes("csv")
  ) {
    return "sheet"
  }
  if (
    normalizedSubject.includes("slide") ||
    normalizedSubject.includes("deck") ||
    normalizedSubject.includes("presentation")
  ) {
    return "slide"
  }
  if (
    normalizedSubject.includes("image") ||
    normalizedSubject.includes("screenshot") ||
    normalizedSubject.includes("preview")
  ) {
    return "image"
  }
  return "doc"
}

function buildAttachmentNameFromTicket(ticket: CustomerRecentTicket): string {
  const safeName = ticket.subject.replace(/[^\w\s-]/g, "").trim()
  if (!safeName) return `ticket-${ticket.id}.pdf`
  return `${safeName}.pdf`
}

function buildCustomerAttachments(
  customer: RawCustomer,
  tickets: CustomerRecentTicket[]
): CustomerAttachment[] {
  return tickets.slice(0, 4).map((ticket, ticketIndex) => {
    const seed = getTextSeed(`${customer.id}-${ticket.id}`)
    const inferredType = inferAttachmentTypeFromSubject(ticket.subject)
    const sizeMB = Number((0.8 + (seed % 42) / 10).toFixed(1))
    const addedAt = new Date(
      Date.UTC(2024, ticketIndex + 1, (seed % 27) + 1, 8 + (seed % 9), seed % 60)
    ).toISOString()

    return {
      id: `${customer.id}-attachment-${ticket.id}`,
      name: buildAttachmentNameFromTicket(ticket),
      type: inferredType,
      sizeMB,
      url: `https://files.graycsm.example/customers/${customer.id}/${ticket.id}`,
      addedBy: customer.owner,
      addedAt,
      source: {
        kind: "ticket",
        ticketId: ticket.id,
      },
      isLinkAsset: false,
    }
  })
}

function enrichCustomer(customer: RawCustomer): Customer {
  const region = regionMetadata[customer.region] ?? {
    languagesSpoken: ["English"],
    timezone: "UTC+00:00",
    source: "Customer success portfolio",
  }
  const firstContactDate = buildFirstContactDate(customer)
  const recentTickets = customer.recentTickets.map((ticket) =>
    buildTicketMetadata(ticket, customer.owner.name)
  )

  return {
    ...customer,
    alternateEmails: alternateEmailsByCompany[customer.companyName] ?? [
      `${customer.primaryContactName.split(" ")[0].toLowerCase()}.ops@${customer.primaryContactEmail.split("@")[1]}`,
    ],
    phoneNumber: buildPhoneNumber(customer.id),
    source: region.source,
    responseTimeLabel: buildResponseTimeLabel(customer),
    languagesSpoken: region.languagesSpoken,
    timezone: region.timezone,
    firstContactDate,
    recentTickets,
    attachments: buildCustomerAttachments(customer, recentTickets),
    companyProfile: buildCompanyProfile(customer),
    activityEvents: buildActivityEvents(customer, recentTickets, firstContactDate),
  }
}

const rawCustomerDirectory: RawCustomer[] = [
  {
    id: "lattice-cloud",
    companyName: "Lattice Cloud",
    primaryContactName: "Amelia Chen",
    primaryContactEmail: "amelia@latticecloud.io",
    website: "https://latticecloud.example",
    region: "Singapore",
    segment: "Strategic",
    plan: "Enterprise",
    lifecycle: "renewal",
    health: "watch",
    owner: owners.jason,
    openTickets: 4,
    csat: 4.7,
    annualValue: 184000,
    seats: 214,
    lastTouchLabel: "2 hours ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 120,
    nextRenewalLabel: "Renews in 18 days",
    summary:
      "Expansion-ready customer with healthy adoption, but finance and SSO questions are slowing the renewal conversation.",
    notes:
      "Executive sponsor wants a clean renewal packet by Friday. Product usage is strong across support and revenue ops, but security review items need tight follow-up.",
    productAreas: ["Automation", "Inbox", "Analytics"],
    riskSignals: [
      "Security questionnaire still open with procurement.",
      "Two pending tickets are blocking admin rollout in APAC.",
    ],
    recentTickets: [
      {
        id: "T-1429",
        subject: "SSO domain mapping not applying for new subsidiaries",
        status: "pending",
        priority: "high",
      },
      {
        id: "T-1404",
        subject: "Invoice export missing finance breakdown column",
        status: "open",
        priority: "medium",
      },
    ],
  },
  {
    id: "northstar-health",
    companyName: "Northstar Health",
    primaryContactName: "Daniel Harper",
    primaryContactEmail: "daniel@northstarhealth.com",
    website: "https://northstarhealth.example",
    region: "United States",
    segment: "Growth",
    plan: "Scale",
    lifecycle: "active",
    health: "healthy",
    owner: owners.sofia,
    openTickets: 1,
    csat: 4.9,
    annualValue: 92000,
    seats: 87,
    lastTouchLabel: "Yesterday",
    lastTouchDate: "Apr 20",
    lastTouchSortValue: 1_440,
    nextRenewalLabel: "Renews in 73 days",
    summary:
      "Strong weekly product usage and fast adoption across care operations after the latest knowledge base rollout.",
    notes:
      "They asked for best-practice guidance on scaling macros to additional teams. Good expansion potential after Q2 review.",
    productAreas: ["Knowledge Base", "Macros"],
    riskSignals: ["One low-priority UI bug remains open for dark mode tables."],
    recentTickets: [
      {
        id: "T-1318",
        subject: "Dark mode contrast on exported dashboard PDF",
        status: "open",
        priority: "low",
      },
    ],
  },
  {
    id: "aeroloft",
    companyName: "AeroLoft",
    primaryContactName: "Nina Foster",
    primaryContactEmail: "nina@aeroloft.co",
    website: "https://aeroloft.example",
    region: "United Kingdom",
    segment: "Mid-market",
    plan: "Growth",
    lifecycle: "onboarding",
    health: "watch",
    owner: owners.maya,
    openTickets: 3,
    csat: 4.3,
    annualValue: 58000,
    seats: 41,
    lastTouchLabel: "4 hours ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 240,
    nextRenewalLabel: "Renews in 142 days",
    summary:
      "Implementation is moving, but admin training is behind schedule and needs more guided onboarding.",
    notes:
      "Success plan includes one more enablement workshop for support leads before they expand licenses.",
    productAreas: ["Inbox", "Tickets"],
    riskSignals: [
      "Only 2 of 5 intended team leads completed onboarding.",
      "Escalation routing rules are still in draft.",
    ],
    recentTickets: [
      {
        id: "T-1436",
        subject: "Webhook trigger order differs from onboarding docs",
        status: "pending",
        priority: "medium",
      },
      {
        id: "T-1431",
        subject: "Unable to bulk map legacy SLA policies",
        status: "open",
        priority: "high",
      },
    ],
  },
  {
    id: "polar-banking",
    companyName: "Polar Banking",
    primaryContactName: "Marcus Lind",
    primaryContactEmail: "marcus@polarbanking.fi",
    website: "https://polarbanking.example",
    region: "Nordics",
    segment: "Strategic",
    plan: "Enterprise",
    lifecycle: "paused",
    health: "at_risk",
    owner: owners.devon,
    openTickets: 7,
    csat: 3.8,
    annualValue: 236000,
    seats: 306,
    lastTouchLabel: "1 hour ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 60,
    nextRenewalLabel: "Renews in 24 days",
    summary:
      "Stakeholders are hesitant to renew until audit exports and multilingual queue governance are stabilized.",
    notes:
      "This account needs tighter executive visibility. Renewal is still recoverable, but every customer-facing update needs clear owners and dates.",
    productAreas: ["Automation", "Tickets", "Internal Notes"],
    riskSignals: [
      "Renewal committee escalated missing audit export fields.",
      "Seven open tickets are concentrated around admin workflows.",
      "CSAT dipped after last release communication.",
    ],
    recentTickets: [
      {
        id: "T-1451",
        subject: "Audit export omits actor role for reassigned tickets",
        status: "open",
        priority: "high",
      },
      {
        id: "T-1447",
        subject: "Localized queue labels reset after sync",
        status: "pending",
        priority: "high",
      },
      {
        id: "T-1440",
        subject: "Automation run history unavailable for compliance team",
        status: "open",
        priority: "medium",
      },
    ],
  },
  {
    id: "brightharbor",
    companyName: "BrightHarbor",
    primaryContactName: "Olivia Park",
    primaryContactEmail: "olivia@brightharbor.com",
    website: "https://brightharbor.example",
    region: "Australia",
    segment: "Growth",
    plan: "Scale",
    lifecycle: "active",
    health: "healthy",
    owner: owners.jason,
    openTickets: 0,
    csat: 4.8,
    annualValue: 118000,
    seats: 96,
    lastTouchLabel: "3 days ago",
    lastTouchDate: "Apr 18",
    lastTouchSortValue: 4_320,
    nextRenewalLabel: "Renews in 88 days",
    summary:
      "Account is stable with strong adoption across macros and account-level health workflows.",
    notes:
      "Customer is a good candidate for lighthouse stories once the new dashboard widgets are finalized.",
    productAreas: ["Accounts", "Macros", "Automation"],
    riskSignals: ["No active risks. Monitor only for normal renewal prep."],
    recentTickets: [],
  },
  {
    id: "fieldhouse-retail",
    companyName: "Fieldhouse Retail",
    primaryContactName: "Jared Wong",
    primaryContactEmail: "jared@fieldhouse-retail.com",
    website: "https://fieldhouse-retail.example",
    region: "Hong Kong",
    segment: "Mid-market",
    plan: "Growth",
    lifecycle: "active",
    health: "watch",
    owner: owners.sofia,
    openTickets: 2,
    csat: 4.1,
    annualValue: 47000,
    seats: 33,
    lastTouchLabel: "Today",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 30,
    nextRenewalLabel: "Renews in 59 days",
    summary:
      "Usage is steady, but frontline team still struggles with queue hygiene and ownership consistency.",
    notes:
      "They need stronger workflow defaults. A lightweight admin playbook could improve adoption before renewal prep starts.",
    productAreas: ["Inbox", "Tickets", "Automation"],
    riskSignals: [
      "Ownership is inconsistent in two regional queues.",
      "Managers want tighter weekly health reporting.",
    ],
    recentTickets: [
      {
        id: "T-1442",
        subject: "Auto-assign rules skip merged email threads",
        status: "pending",
        priority: "medium",
      },
      {
        id: "T-1397",
        subject: "Bulk edit cannot update queue owner for archived macros",
        status: "resolved",
        priority: "low",
      },
    ],
  },
  {
    id: "cinder-ai",
    companyName: "Cinder AI",
    primaryContactName: "Ruby Brooks",
    primaryContactEmail: "ruby@cinder.ai",
    website: "https://cinder.example",
    region: "Canada",
    segment: "SMB",
    plan: "Starter",
    lifecycle: "onboarding",
    health: "healthy",
    owner: owners.maya,
    openTickets: 1,
    csat: 4.6,
    annualValue: 18000,
    seats: 12,
    lastTouchLabel: "5 days ago",
    lastTouchDate: "Apr 16",
    lastTouchSortValue: 7_200,
    nextRenewalLabel: "Renews in 176 days",
    summary:
      "Small but motivated team. Early onboarding milestones are on track and the admin champion is engaged.",
    notes:
      "They want a simple rollout. Keep the experience opinionated and low-maintenance for the first month.",
    productAreas: ["Inbox", "Knowledge Base"],
    riskSignals: [
      "Watch for self-serve setup questions during the first 30 days.",
    ],
    recentTickets: [
      {
        id: "T-1411",
        subject: "How to set up knowledge base redirects after import",
        status: "resolved",
        priority: "low",
      },
    ],
  },
  {
    id: "summit-grid",
    companyName: "Summit Grid",
    primaryContactName: "Leah Morgan",
    primaryContactEmail: "leah@summitgrid.energy",
    website: "https://summitgrid.example",
    region: "Germany",
    segment: "Strategic",
    plan: "Enterprise",
    lifecycle: "active",
    health: "at_risk",
    owner: owners.devon,
    openTickets: 5,
    csat: 3.9,
    annualValue: 164000,
    seats: 188,
    lastTouchLabel: "6 hours ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 360,
    nextRenewalLabel: "Renews in 31 days",
    summary:
      "High-value account with decent usage, but trust is fragile after repeated SLA misses in executive escalations.",
    notes:
      "This one needs proactive comms. Weekly customer updates should tie every ticket to a business outcome and next owner.",
    productAreas: ["Tickets", "Automation", "Settings"],
    riskSignals: [
      "Escalation queue breached SLA twice this month.",
      "Decision maker asked for a formal recovery plan.",
    ],
    recentTickets: [
      {
        id: "T-1453",
        subject: "SLA breach report missing weekend business hours override",
        status: "open",
        priority: "high",
      },
      {
        id: "T-1438",
        subject: "Automation conflict warnings are not visible to managers",
        status: "pending",
        priority: "medium",
      },
    ],
  },
  {
    id: "verdant-pay",
    companyName: "Verdant Pay",
    primaryContactName: "Isaac Romero",
    primaryContactEmail: "isaac@verdantpay.com",
    website: "https://verdantpay.example",
    region: "Mexico",
    segment: "Growth",
    plan: "Scale",
    lifecycle: "renewal",
    health: "healthy",
    owner: owners.jason,
    openTickets: 2,
    csat: 4.8,
    annualValue: 104000,
    seats: 74,
    lastTouchLabel: "Today",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 15,
    nextRenewalLabel: "Renews in 12 days",
    summary:
      "Renewal motion is in a strong place and the account is asking about regional expansion after the next contract term.",
    notes:
      "Good opportunity to package automation templates and rollout support as part of the renewal conversation.",
    productAreas: ["Automation", "Accounts"],
    riskSignals: [
      "Keep invoice ticket moving so finance sign-off stays clean.",
    ],
    recentTickets: [
      {
        id: "T-1449",
        subject: "Regional invoice template not available in Spanish export",
        status: "open",
        priority: "medium",
      },
    ],
  },
  {
    id: "maple-security",
    companyName: "Maple Security",
    primaryContactName: "Evelyn Clarke",
    primaryContactEmail: "evelyn@maplesecurity.ca",
    website: "https://maplesecurity.example",
    region: "Canada",
    segment: "Enterprise",
    plan: "Enterprise",
    lifecycle: "active",
    health: "watch",
    owner: owners.devon,
    openTickets: 3,
    csat: 4.2,
    annualValue: 142000,
    seats: 128,
    lastTouchLabel: "8 hours ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 480,
    nextRenewalLabel: "Renews in 44 days",
    summary:
      "Solid product fit, but compliance-heavy workflows still need predictable reporting.",
    notes:
      "Security lead requested weekly delivery updates for audit-related fixes until renewal closes.",
    productAreas: ["Tickets", "Settings", "Automation"],
    riskSignals: [
      "Audit timeline overlaps with renewal committee meetings.",
      "Admin team raised concerns about report export completeness.",
    ],
    recentTickets: [
      {
        id: "T-1459",
        subject: "CSV export omits automation actor metadata",
        status: "open",
        priority: "high",
      },
    ],
  },
  {
    id: "orbit-fulfillment",
    companyName: "Orbit Fulfillment",
    primaryContactName: "Hugo Salazar",
    primaryContactEmail: "hugo@orbitfulfillment.mx",
    website: "https://orbitfulfillment.example",
    region: "Mexico",
    segment: "Mid-market",
    plan: "Growth",
    lifecycle: "active",
    health: "healthy",
    owner: owners.sofia,
    openTickets: 1,
    csat: 4.7,
    annualValue: 52000,
    seats: 36,
    lastTouchLabel: "Yesterday",
    lastTouchDate: "Apr 20",
    lastTouchSortValue: 1_440,
    nextRenewalLabel: "Renews in 95 days",
    summary:
      "Warehouse team adopted workflow automations quickly after onboarding completion.",
    notes:
      "Customer asked for playbook templates to replicate the same setup across two new regions.",
    productAreas: ["Automation", "Inbox"],
    riskSignals: [
      "No active blockers. Keep rollout momentum for regional expansion.",
    ],
    recentTickets: [
      {
        id: "T-1454",
        subject: "Need sample webhook payload for partner integration",
        status: "resolved",
        priority: "low",
      },
    ],
  },
  {
    id: "blueforge-labs",
    companyName: "Blueforge Labs",
    primaryContactName: "Mina Alavi",
    primaryContactEmail: "mina@blueforge.ai",
    website: "https://blueforge.example",
    region: "United States",
    segment: "Growth",
    plan: "Scale",
    lifecycle: "renewal",
    health: "at_risk",
    owner: owners.maya,
    openTickets: 6,
    csat: 3.7,
    annualValue: 98000,
    seats: 72,
    lastTouchLabel: "2 hours ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 120,
    nextRenewalLabel: "Renews in 21 days",
    summary:
      "Power users are active, but leadership confidence dropped after multiple delayed fixes.",
    notes:
      "Renewal depends on a credible remediation plan with clear dates for top 3 escalations.",
    productAreas: ["Tickets", "Accounts", "Internal Notes"],
    riskSignals: [
      "Three high-priority escalations still unresolved.",
      "Executive sponsor requested commitment dates in writing.",
    ],
    recentTickets: [
      {
        id: "T-1460",
        subject: "SLA timer resets after reassignment in shared queues",
        status: "open",
        priority: "high",
      },
      {
        id: "T-1455",
        subject: "Role-based permissions not honored in report builder",
        status: "pending",
        priority: "high",
      },
    ],
  },
  {
    id: "helios-energy",
    companyName: "Helios Energy",
    primaryContactName: "Patrick Ivers",
    primaryContactEmail: "patrick@heliosenergy.eu",
    website: "https://heliosenergy.example",
    region: "Germany",
    segment: "Strategic",
    plan: "Enterprise",
    lifecycle: "active",
    health: "healthy",
    owner: owners.jason,
    openTickets: 2,
    csat: 4.8,
    annualValue: 201000,
    seats: 244,
    lastTouchLabel: "3 hours ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 180,
    nextRenewalLabel: "Renews in 67 days",
    summary:
      "Excellent adoption across support and analytics teams, with strong executive sponsorship.",
    notes:
      "Expansion opportunity is tied to implementing multilingual support dashboards next quarter.",
    productAreas: ["Analytics", "Accounts", "Automation"],
    riskSignals: [
      "No immediate risk. Continue expansion discovery with regional leads.",
    ],
    recentTickets: [
      {
        id: "T-1456",
        subject: "Need API example for regional dashboard embedding",
        status: "pending",
        priority: "medium",
      },
    ],
  },
  {
    id: "riverbank-insure",
    companyName: "Riverbank Insure",
    primaryContactName: "Talia Moore",
    primaryContactEmail: "talia@riverbankinsure.com",
    website: "https://riverbankinsure.example",
    region: "United Kingdom",
    segment: "Enterprise",
    plan: "Scale",
    lifecycle: "paused",
    health: "watch",
    owner: owners.devon,
    openTickets: 4,
    csat: 4.0,
    annualValue: 133000,
    seats: 110,
    lastTouchLabel: "1 day ago",
    lastTouchDate: "Apr 20",
    lastTouchSortValue: 1_530,
    nextRenewalLabel: "Renews in 58 days",
    summary:
      "Usage is stable, but legal review slowed deployment of new workflow permissions.",
    notes:
      "Need tighter cross-team follow-up between IT security and account stakeholders.",
    productAreas: ["Settings", "Tickets", "Automation"],
    riskSignals: [
      "Permission policy changes delayed by internal compliance review.",
      "Queue-level owner visibility still inconsistent for managers.",
    ],
    recentTickets: [
      {
        id: "T-1452",
        subject: "Agent role mapping cannot be bulk-updated by region",
        status: "open",
        priority: "medium",
      },
    ],
  },
  {
    id: "nova-ops",
    companyName: "Nova Ops",
    primaryContactName: "Felix Hart",
    primaryContactEmail: "felix@novaops.io",
    website: "https://novaops.example",
    region: "Australia",
    segment: "SMB",
    plan: "Starter",
    lifecycle: "onboarding",
    health: "healthy",
    owner: owners.maya,
    openTickets: 0,
    csat: 4.9,
    annualValue: 14000,
    seats: 10,
    lastTouchLabel: "2 days ago",
    lastTouchDate: "Apr 19",
    lastTouchSortValue: 2_880,
    nextRenewalLabel: "Renews in 181 days",
    summary:
      "Small team moving fast with a clean onboarding and strong self-serve behavior.",
    notes:
      "Great candidate for lightweight case study once first quarter outcomes are measured.",
    productAreas: ["Inbox", "Knowledge Base"],
    riskSignals: ["No active risks at the moment."],
    recentTickets: [],
  },
  {
    id: "pinecrest-media",
    companyName: "Pinecrest Media",
    primaryContactName: "Nora Diaz",
    primaryContactEmail: "nora@pinecrestmedia.com",
    website: "https://pinecrestmedia.example",
    region: "Spain",
    segment: "Growth",
    plan: "Growth",
    lifecycle: "active",
    health: "watch",
    owner: owners.sofia,
    openTickets: 2,
    csat: 4.1,
    annualValue: 61000,
    seats: 52,
    lastTouchLabel: "5 hours ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 300,
    nextRenewalLabel: "Renews in 76 days",
    summary:
      "Consistent usage, but newsroom stakeholders need better visibility in priority routing.",
    notes:
      "They requested an operations review focused on queue ownership and escalation paths.",
    productAreas: ["Inbox", "Tickets", "Macros"],
    riskSignals: [
      "Two regional teams are not aligned on escalation ownership.",
    ],
    recentTickets: [
      {
        id: "T-1457",
        subject: "Priority tags not synced to regional queue dashboards",
        status: "pending",
        priority: "medium",
      },
    ],
  },
  {
    id: "prism-health",
    companyName: "Prism Health",
    primaryContactName: "Aiden Bell",
    primaryContactEmail: "aiden@prismhealth.org",
    website: "https://prismhealth.example",
    region: "Singapore",
    segment: "Strategic",
    plan: "Enterprise",
    lifecycle: "renewal",
    health: "at_risk",
    owner: owners.jason,
    openTickets: 5,
    csat: 3.9,
    annualValue: 172000,
    seats: 196,
    lastTouchLabel: "1 hour ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 75,
    nextRenewalLabel: "Renews in 15 days",
    summary:
      "High-value healthcare account under pressure due to unresolved reporting regressions.",
    notes:
      "Need daily stakeholder update cadence until the renewal committee signs off.",
    productAreas: ["Analytics", "Settings", "Tickets"],
    riskSignals: [
      "Executive dashboard regressions are blocking renewal confidence.",
      "Support leadership requested immediate ETA commitments.",
    ],
    recentTickets: [
      {
        id: "T-1458",
        subject: "Weekly quality report missing merged queue data",
        status: "open",
        priority: "high",
      },
    ],
  },
  {
    id: "apex-mobility",
    companyName: "Apex Mobility",
    primaryContactName: "Jonah Park",
    primaryContactEmail: "jonah@apexmobility.kr",
    website: "https://apexmobility.example",
    region: "South Korea",
    segment: "Mid-market",
    plan: "Scale",
    lifecycle: "active",
    health: "healthy",
    owner: owners.devon,
    openTickets: 1,
    csat: 4.6,
    annualValue: 88000,
    seats: 64,
    lastTouchLabel: "6 hours ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 360,
    nextRenewalLabel: "Renews in 104 days",
    summary:
      "Strong delivery rhythm and healthy usage in support and operations teams.",
    notes:
      "Potential expansion into service engineering workflows in the next planning cycle.",
    productAreas: ["Automation", "Accounts"],
    riskSignals: ["Low risk. Keep momentum with proactive quarterly planning."],
    recentTickets: [
      {
        id: "T-1450",
        subject: "Need webhook retries documented for fleet integrations",
        status: "resolved",
        priority: "low",
      },
    ],
  },
  {
    id: "cloudmint-finance",
    companyName: "CloudMint Finance",
    primaryContactName: "Sienna Walsh",
    primaryContactEmail: "sienna@cloudmintfinance.com",
    website: "https://cloudmintfinance.example",
    region: "Ireland",
    segment: "Growth",
    plan: "Growth",
    lifecycle: "active",
    health: "watch",
    owner: owners.maya,
    openTickets: 3,
    csat: 4.0,
    annualValue: 76000,
    seats: 58,
    lastTouchLabel: "9 hours ago",
    lastTouchDate: "Apr 21",
    lastTouchSortValue: 540,
    nextRenewalLabel: "Renews in 49 days",
    summary:
      "Finance ops team is engaged, but inconsistent queue automation is creating follow-up noise.",
    notes:
      "Prioritize ticket routing cleanup before next monthly business review.",
    productAreas: ["Automation", "Tickets", "Knowledge Base"],
    riskSignals: [
      "Routing inconsistencies create repeated manual triage for managers.",
      "Two unresolved workflow issues are visible to executive stakeholders.",
    ],
    recentTickets: [
      {
        id: "T-1461",
        subject: "Duplicate macro runs when queue tags update in bulk",
        status: "open",
        priority: "medium",
      },
    ],
  },
]

export const customerDirectory: Customer[] =
  rawCustomerDirectory.map(enrichCustomer)

const CUSTOMER_SEGMENTS = [
  "Strategic",
  "Enterprise",
  "Growth",
  "Mid-market",
  "SMB",
] as const

const CUSTOMER_LIFECYCLES: CustomerLifecycle[] = [
  "onboarding",
  "active",
  "renewal",
  "paused",
  "archived",
]

export const customerSidebarGroups: CustomerSidebarGroup[] =
  buildCustomerSidebarGroups(customerDirectory)

export function buildCustomerSidebarGroups(
  sourceCustomers: Customer[]
): CustomerSidebarGroup[] {
  const segmentCounts: Record<(typeof CUSTOMER_SEGMENTS)[number], number> = {
    Strategic: 0,
    Enterprise: 0,
    Growth: 0,
    "Mid-market": 0,
    SMB: 0,
  }

  const lifecycleCounts: Record<CustomerLifecycle, number> = {
    onboarding: 0,
    active: 0,
    renewal: 0,
    paused: 0,
    archived: 0,
  }

  let mine = 0
  let atRisk = 0
  let renewal = 0
  let highTouch = 0

  for (const customer of sourceCustomers) {
    if (customer.owner.email === currentUser.email) mine += 1
    if (customer.health === "at_risk") atRisk += 1
    if (customer.lifecycle === "renewal") renewal += 1
    if (customer.openTickets >= 3) highTouch += 1

    if (customer.segment in segmentCounts) {
      segmentCounts[customer.segment as (typeof CUSTOMER_SEGMENTS)[number]] += 1
    }

    lifecycleCounts[customer.lifecycle] += 1
  }

  return [
    {
      key: "views",
      label: "Views",
      items: [
        { key: "all", label: "All Customers", count: sourceCustomers.length },
        { key: "mine", label: "My Accounts", count: mine },
        { key: "at-risk", label: "At Risk", count: atRisk },
        { key: "renewal", label: "Renewal", count: renewal },
        { key: "high-touch", label: "High Touch", count: highTouch },
      ],
    },
    {
      key: "segment",
      label: "Segment",
      items: CUSTOMER_SEGMENTS.map((segment) => ({
        key: segment.toLowerCase().replace(" ", "-"),
        label: segment,
        count: segmentCounts[segment],
      })),
    },
    {
      key: "lifecycle",
      label: "Lifecycle",
      items: CUSTOMER_LIFECYCLES.map((lifecycle) => ({
        key: lifecycle,
        label: lifecycle.charAt(0).toUpperCase() + lifecycle.slice(1),
        count: lifecycleCounts[lifecycle],
      })),
    },
  ]
}

export function filterCustomersByView(
  allCustomers: Customer[],
  view: CustomerViewKey
) {
  switch (view) {
    case "mine":
      return allCustomers.filter(
        (customer) => customer.owner.email === currentUser.email
      )
    case "at-risk":
      return allCustomers.filter((customer) => customer.health === "at_risk")
    case "renewal":
      return allCustomers.filter((customer) => customer.lifecycle === "renewal")
    case "high-touch":
      return allCustomers.filter((customer) => customer.openTickets >= 3)
    case "all":
    default:
      return allCustomers
  }
}
