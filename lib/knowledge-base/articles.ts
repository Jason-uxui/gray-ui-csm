import { currentUser } from "@/lib/current-user"
import {
  createDefaultKnowledgeArticleDetails,
  createKnowledgeArticleVersion,
} from "@/lib/knowledge-base/article-details"
import { createEmptyKnowledgeArticleDocument } from "@/lib/knowledge-base/content"
import type {
  KnowledgeArticle,
  KnowledgeArticleCreateInput,
  KnowledgeArticleExplorerGroup,
  KnowledgeArticleGroupIcon,
} from "@/lib/knowledge-base/types"

export function createKnowledgeGroupId(
  label: string,
  groups: KnowledgeArticleExplorerGroup[]
) {
  const slug =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "group"
  let nextId = slug
  let suffix = 2
  const groupIds = new Set(groups.map((group) => group.id))

  while (groupIds.has(nextId)) {
    nextId = `${slug}-${suffix}`
    suffix += 1
  }

  return nextId
}

function createKnowledgeArticleId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `kb-${crypto.randomUUID()}`
  }

  return `kb-draft-${Date.now()}`
}

export function createDraftKnowledgeArticle(
  input: KnowledgeArticleCreateInput
): KnowledgeArticle {
  const title = input.title?.trim() || "Untitled article"
  const document = createEmptyKnowledgeArticleDocument()
  const id = createKnowledgeArticleId()
  const status = input.status ?? "draft"
  const author = {
    name: currentUser.name,
    avatarUrl: currentUser.avatar,
  }

  return {
    id,
    title,
    summary: "",
    category: "other",
    status,
    updatedAt: "Updated just now",
    author,
    matchScore: "low",
    views: 0,
    helpfulRate: 0,
    linkedTickets: 0,
    matchReasons: [],
    sections: [],
    content: {
      format: "tiptap-json",
      document,
    },
    customerReply: "",
    details: createDefaultKnowledgeArticleDetails({
      id,
      title,
      summary: "",
      status,
      author,
      pageCategory: input.pageCategory ?? "",
      views: 0,
      helpfulRate: 0,
      matchReasons: [],
    }),
    versions: [
      createKnowledgeArticleVersion([author], `${id}-created`),
    ],
  }
}

export function articleMatchesSearch(
  article: KnowledgeArticle,
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const searchableValues = [
    article.title,
    article.summary,
    article.quickPath,
    article.category.replaceAll("-", " "),
    article.details?.pageCategory,
    article.details?.publicLink,
    article.details?.seo.metaTitle,
    article.details?.seo.metaKeywords,
    article.details?.seo.metaDescription,
    ...article.matchReasons,
    ...(article.details?.tags ?? []),
  ]

  return searchableValues
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(normalizedQuery))
}

export function filterGroupArticlesBySearch({
  articles,
  query,
  selectedArticleId,
}: {
  articles: KnowledgeArticle[]
  query: string
  selectedArticleId: string | null
}) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return articles

  return articles.filter(
    (article) =>
      article.id === selectedArticleId || articleMatchesSearch(article, query)
  )
}

export function createKnowledgeExplorerGroup(input: {
  label: string
  icon: KnowledgeArticleGroupIcon
  groups: KnowledgeArticleExplorerGroup[]
}): KnowledgeArticleExplorerGroup {
  return {
    id: createKnowledgeGroupId(input.label, input.groups),
    label: input.label,
    icon: input.icon,
    defaultOpen: true,
    articleIds: [],
  }
}
