import { currentUser } from "@/lib/current-user"
import type {
  KnowledgeArticle,
  KnowledgeArticleDetails,
  KnowledgeArticleDisplayPermission,
  KnowledgeArticlePerson,
  KnowledgeArticleStatus,
  KnowledgeArticleVersion,
} from "@/lib/knowledge-base/types"

const demoAgents: KnowledgeArticlePerson[] = [
  { name: "Arlene McCoy" },
  { name: "Cameron Williamson" },
  { name: "Leslie Alexander" },
  { name: "Brooklyn Simmons" },
  { name: "Santi Cazorla" },
]

const articleDetailPresets: Record<string, Partial<KnowledgeArticleDetails>> = {
  "kb-billing-seat-update": {
    displayPermission: "public",
    tags: ["billing", "seats", "subscription"],
    expiresAt: "2026-12-15",
    agentsWithAccess: [
      { name: "Santi Cazorla" },
      { name: "Arlene McCoy" },
      { name: "Cameron Williamson" },
    ],
  },
  "kb-login-reset": {
    displayPermission: "agent-only",
    tags: ["login", "password", "security"],
    expiresAt: "",
    agentsWithAccess: [
      { name: "Leslie Alexander" },
      { name: "Brooklyn Simmons" },
    ],
  },
  "kb-return-refund-policy": {
    displayPermission: "public",
    tags: ["returns", "refunds", "orders"],
    expiresAt: "2027-01-31",
    agentsWithAccess: [
      { name: "Arlene McCoy" },
      { name: "Leslie Alexander" },
    ],
  },
}

const versionTimestampTemplates = [
  { periodLabel: "This week", timestampLabel: "Today, 9:40 AM" },
  { periodLabel: "This week", timestampLabel: "Today, 8:15 AM" },
  { periodLabel: "This week", timestampLabel: "Yesterday, 4:12 PM" },
  { periodLabel: "This week", timestampLabel: "Yesterday, 11:03 AM" },
  { periodLabel: "This week", timestampLabel: "Sep 23, 2026, 6:48 PM" },
  { periodLabel: "August 2026", timestampLabel: "Aug 28, 2026, 3:22 PM" },
  { periodLabel: "August 2026", timestampLabel: "Aug 22, 2026, 10:45 AM" },
  { periodLabel: "August 2026", timestampLabel: "Aug 18, 2026, 11:05 AM" },
  { periodLabel: "August 2026", timestampLabel: "Aug 12, 2026, 9:18 AM" },
  { periodLabel: "August 2026", timestampLabel: "Aug 2, 2026, 2:30 PM" },
  { periodLabel: "July 2026", timestampLabel: "Jul 29, 2026, 4:05 PM" },
  { periodLabel: "July 2026", timestampLabel: "Jul 21, 2026, 1:40 PM" },
  { periodLabel: "July 2026", timestampLabel: "Jul 14, 2026, 9:12 AM" },
  { periodLabel: "July 2026", timestampLabel: "Jul 3, 2026, 5:55 PM" },
  { periodLabel: "June 2026", timestampLabel: "Jun 24, 2026, 11:20 AM" },
  { periodLabel: "June 2026", timestampLabel: "Jun 16, 2026, 2:08 PM" },
  { periodLabel: "June 2026", timestampLabel: "Jun 8, 2026, 10:33 AM" },
] as const

const demoVersionEditor: KnowledgeArticlePerson = {
  name: "JasonD",
  avatarUrl: currentUser.avatar,
}

function hashString(value: string) {
  let hash = 0

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return hash
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  return slug || "article"
}

function permissionForStatus(
  status: KnowledgeArticleStatus
): KnowledgeArticleDisplayPermission {
  if (status === "published") return "public"
  if (status === "needs-review") return "agent-only"
  return "private"
}

function feedbackFromArticle(views: number, helpfulRate: number) {
  const helpful = Math.round((views * helpfulRate) / 100)
  const notHelpful = Math.max(0, Math.round((views * (100 - helpfulRate)) / 100))

  return { helpful, notHelpful }
}

function pickAgents(seed: string, authorName: string) {
  const start = hashString(seed) % demoAgents.length
  const picked = [0, 1, 2].map(
    (offset) => demoAgents[(start + offset) % demoAgents.length]
  )
  const unique = new Map<string, KnowledgeArticlePerson>()

  unique.set(authorName, { name: authorName })
  for (const agent of picked) {
    unique.set(agent.name, agent)
  }

  return Array.from(unique.values()).slice(0, 3)
}

export function cloneKnowledgeArticleDetails(
  details: KnowledgeArticleDetails
): KnowledgeArticleDetails {
  return {
    ...details,
    tags: [...details.tags],
    creator: { ...details.creator },
    agentsWithAccess: details.agentsWithAccess.map((person) => ({ ...person })),
    feedback: { ...details.feedback },
    seo: { ...details.seo },
  }
}

export function createDefaultKnowledgeArticleDetails(input: {
  id: string
  title: string
  summary: string
  status: KnowledgeArticleStatus
  author: KnowledgeArticlePerson
  pageCategory: string
  views: number
  helpfulRate: number
  matchReasons: string[]
}): KnowledgeArticleDetails {
  const preset = articleDetailPresets[input.id]
  const tags =
    preset?.tags ??
    (input.matchReasons.length > 0
      ? input.matchReasons.slice(0, 3)
      : ["guide"])
  const feedback = feedbackFromArticle(input.views, input.helpfulRate)

  return {
    displayPermission:
      preset?.displayPermission ?? permissionForStatus(input.status),
    pageCategory: preset?.pageCategory ?? input.pageCategory,
    tags,
    publicLink:
      preset?.publicLink ??
      `https://help.opensource-demo.dev/articles/${slugify(input.title)}`,
    expiresAt: preset?.expiresAt ?? "",
    creator: preset?.creator ?? { ...input.author },
    agentsWithAccess:
      preset?.agentsWithAccess ?? pickAgents(input.id, input.author.name),
    feedback: preset?.feedback ?? feedback,
    seo: {
      metaTitle: preset?.seo?.metaTitle ?? input.title,
      metaKeywords: preset?.seo?.metaKeywords ?? tags.join(", "),
      metaDescription: preset?.seo?.metaDescription ?? input.summary,
    },
  }
}

export function resolveKnowledgeArticleDetails(
  article: KnowledgeArticle,
  pageCategory: string
): KnowledgeArticleDetails {
  if (article.details) return article.details

  return createDefaultKnowledgeArticleDetails({
    id: article.id,
    title: article.title,
    summary: article.summary,
    status: article.status,
    author: article.author,
    pageCategory,
    views: article.views,
    helpfulRate: article.helpfulRate,
    matchReasons: article.matchReasons,
  })
}

export function createKnowledgeArticleVersion(
  contributors: KnowledgeArticlePerson[],
  id?: string
): KnowledgeArticleVersion {
  const versionId =
    id ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `kb-version-${crypto.randomUUID()}`
      : `kb-version-${Date.now()}`)

  return {
    id: versionId,
    timestampLabel: "Just now",
    periodLabel: "This week",
    contributors: contributors.map((person) => ({ ...person })),
  }
}

export function resolveKnowledgeArticleVersions(
  article: KnowledgeArticle
): KnowledgeArticleVersion[] {
  if (article.versions && article.versions.length > 0) return article.versions

  return versionTimestampTemplates.map((template, index) => {
    return {
      id: `${article.id}-version-${index + 1}`,
      timestampLabel: template.timestampLabel,
      periodLabel: template.periodLabel,
      contributors: [{ ...demoVersionEditor }],
    }
  })
}

export function groupKnowledgeArticleVersions(
  versions: KnowledgeArticleVersion[]
) {
  const groups: Array<{
    label: string
    versions: KnowledgeArticleVersion[]
  }> = []

  for (const version of versions) {
    const currentGroup = groups[groups.length - 1]

    if (!currentGroup || currentGroup.label !== version.periodLabel) {
      groups.push({ label: version.periodLabel, versions: [version] })
      continue
    }

    currentGroup.versions.push(version)
  }

  return groups
}
