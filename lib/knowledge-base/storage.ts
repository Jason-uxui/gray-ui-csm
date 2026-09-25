import {
  knowledgeArticleExplorerGroups,
  knowledgeArticles,
} from "@/lib/knowledge-base/mock-data"
import type {
  KnowledgeArticle,
  KnowledgeArticleExplorerGroup,
  KnowledgeBaseStorageSnapshot,
} from "@/lib/knowledge-base/types"

const STORAGE_KEY = "gray-ui-csm:knowledge-base"
const LEGACY_ARTICLES_KEY = "gray-ui-csm:knowledge-base-articles"
const KNOWLEDGE_BASE_SEED_REVISION = 2

export const KNOWLEDGE_BASE_STORAGE_UPDATED_EVENT =
  "gray-ui-csm:knowledge-base-updated"

export function getDefaultKnowledgeBaseSnapshot(): KnowledgeBaseStorageSnapshot {
  return {
    version: 1,
    seedRevision: KNOWLEDGE_BASE_SEED_REVISION,
    articles: knowledgeArticles,
    groups: knowledgeArticleExplorerGroups,
  }
}

function isKnowledgeArticle(value: unknown): value is KnowledgeArticle {
  if (!value || typeof value !== "object") return false
  const record = value as KnowledgeArticle
  return typeof record.id === "string" && typeof record.title === "string"
}

function isKnowledgeArticleArray(value: unknown): value is KnowledgeArticle[] {
  return Array.isArray(value) && value.every(isKnowledgeArticle)
}

function isKnowledgeBaseStorageSnapshot(
  value: unknown
): value is KnowledgeBaseStorageSnapshot {
  if (!value || typeof value !== "object") return false

  const snapshot = value as KnowledgeBaseStorageSnapshot
  return (
    snapshot.version === 1 &&
    isKnowledgeArticleArray(snapshot.articles) &&
    Array.isArray(snapshot.groups) &&
    snapshot.groups.every(
      (group) =>
        typeof group.id === "string" &&
        typeof group.label === "string" &&
        Array.isArray(group.articleIds)
    )
  )
}

function mergeArticleDefaults(
  articles: KnowledgeArticle[],
  fallbackArticles: KnowledgeArticle[]
) {
  return articles.map((article) => {
    const fallbackArticle = fallbackArticles.find(
      (candidate) => candidate.id === article.id
    )

    if (!fallbackArticle) return article

    return {
      ...article,
      comments: article.comments ?? fallbackArticle.comments,
      commentsCount:
        article.comments?.length ??
        fallbackArticle.comments?.length ??
        article.commentsCount,
      activity: article.activity ?? fallbackArticle.activity,
      activityCount:
        article.activity?.length ??
        fallbackArticle.activity?.length ??
        article.activityCount,
      details: article.details ?? fallbackArticle.details,
      versions: article.versions ?? fallbackArticle.versions,
    }
  })
}

function mergeArticleUserState(
  article: KnowledgeArticle,
  existingArticle?: KnowledgeArticle
): KnowledgeArticle {
  if (!existingArticle) return article

  const comments = existingArticle.comments ?? article.comments
  const activity = existingArticle.activity ?? article.activity

  return {
    ...article,
    isPinned: existingArticle.isPinned ?? article.isPinned,
    archivedAt: existingArticle.archivedAt ?? article.archivedAt,
    comments,
    commentsCount:
      comments?.length ?? article.commentsCount ?? existingArticle.commentsCount,
    activity,
    activityCount:
      activity?.length ?? article.activityCount ?? existingArticle.activityCount,
    details: existingArticle.details ?? article.details,
    versions: existingArticle.versions ?? article.versions,
  }
}

function mergeGroupUserState(
  group: KnowledgeArticleExplorerGroup,
  existingGroup: KnowledgeArticleExplorerGroup | undefined,
  seedArticleIds: Set<string>
): KnowledgeArticleExplorerGroup {
  if (!existingGroup) return group

  const customArticleIds = existingGroup.articleIds.filter(
    (articleId) => !seedArticleIds.has(articleId)
  )

  return {
    ...group,
    defaultOpen: existingGroup.defaultOpen ?? group.defaultOpen,
    articleIds: Array.from(new Set([...group.articleIds, ...customArticleIds])),
  }
}

function mergeKnowledgeBaseSnapshot(
  snapshot: KnowledgeBaseStorageSnapshot,
  fallback: KnowledgeBaseStorageSnapshot
): KnowledgeBaseStorageSnapshot {
  const shouldRefreshSeedContent =
    snapshot.seedRevision !== KNOWLEDGE_BASE_SEED_REVISION
  const fallbackArticleIds = new Set(
    fallback.articles.map((article) => article.id)
  )
  const existingArticleById = new Map(
    snapshot.articles.map((article) => [article.id, article])
  )
  const existingGroupById = new Map(
    snapshot.groups.map((group) => [group.id, group])
  )

  const seedArticles = fallback.articles.map((fallbackArticle) => {
    const existingArticle = existingArticleById.get(fallbackArticle.id)

    if (shouldRefreshSeedContent) {
      return mergeArticleUserState(fallbackArticle, existingArticle)
    }

    return mergeArticleDefaults(
      [existingArticle ?? fallbackArticle],
      fallback.articles
    )[0]
  })
  const customArticles = snapshot.articles.filter(
    (article) => !fallbackArticleIds.has(article.id)
  )
  const seedGroups = fallback.groups.map((fallbackGroup) =>
    mergeGroupUserState(
      fallbackGroup,
      existingGroupById.get(fallbackGroup.id),
      fallbackArticleIds
    )
  )
  const customGroups = snapshot.groups.filter(
    (group) =>
      !fallback.groups.some((fallbackGroup) => fallbackGroup.id === group.id)
  )

  return {
    version: 1,
    seedRevision: KNOWLEDGE_BASE_SEED_REVISION,
    articles: [...seedArticles, ...customArticles],
    groups: [...seedGroups, ...customGroups],
  }
}

function migrateLegacyArticleStorage(
  articles: KnowledgeArticle[],
  fallbackGroups: KnowledgeBaseStorageSnapshot["groups"]
): KnowledgeBaseStorageSnapshot {
  return {
    version: 1,
    articles,
    groups: fallbackGroups,
  }
}

export function loadKnowledgeBaseSnapshot(
  fallback: KnowledgeBaseStorageSnapshot = getDefaultKnowledgeBaseSnapshot()
): KnowledgeBaseStorageSnapshot {
  if (typeof window === "undefined") return fallback

  try {
    const rawSnapshot = window.localStorage.getItem(STORAGE_KEY)
    if (rawSnapshot) {
      const parsed = JSON.parse(rawSnapshot) as unknown
      if (isKnowledgeBaseStorageSnapshot(parsed)) {
        return mergeKnowledgeBaseSnapshot(parsed, fallback)
      }
    }

    const rawLegacyArticles = window.localStorage.getItem(LEGACY_ARTICLES_KEY)
    if (rawLegacyArticles) {
      const parsedLegacy = JSON.parse(rawLegacyArticles) as unknown
      if (isKnowledgeArticleArray(parsedLegacy)) {
        const migrated = migrateLegacyArticleStorage(
          mergeArticleDefaults(parsedLegacy, fallback.articles),
          fallback.groups
        )
        const merged = mergeKnowledgeBaseSnapshot(migrated, fallback)
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
          window.localStorage.removeItem(LEGACY_ARTICLES_KEY)
          notifyKnowledgeBaseStorageUpdated()
        } catch {
          // Ignore quota and serialization errors for local prototype persistence.
        }
        return merged
      }
    }
  } catch {
    return fallback
  }

  return fallback
}

function notifyKnowledgeBaseStorageUpdated() {
  if (typeof window === "undefined") return

  window.dispatchEvent(new Event(KNOWLEDGE_BASE_STORAGE_UPDATED_EVENT))
}

export function saveKnowledgeBaseSnapshot(snapshot: KnowledgeBaseStorageSnapshot) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    notifyKnowledgeBaseStorageUpdated()
  } catch {
    // Ignore quota and serialization errors for local prototype persistence.
  }
}

export function loadKnowledgeArticlesFromStorage(
  fallback: KnowledgeArticle[] = knowledgeArticles
): KnowledgeArticle[] {
  return loadKnowledgeBaseSnapshot({
    version: 1,
    articles: fallback,
    groups: knowledgeArticleExplorerGroups,
  }).articles
}

export function saveKnowledgeArticlesToStorage(articles: KnowledgeArticle[]) {
  const currentSnapshot = loadKnowledgeBaseSnapshot()
  saveKnowledgeBaseSnapshot({
    ...currentSnapshot,
    articles,
  })
}
