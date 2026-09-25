import type { TicketCategoryKey } from "@/lib/tickets/types"
import type { JSONContent } from "@tiptap/react"

export type KnowledgeArticleStatus = "published" | "draft" | "needs-review"

export type KnowledgeArticleDisplayPermission =
  | "public"
  | "agent-only"
  | "private"

export type KnowledgeArticlePerson = {
  name: string
  avatarUrl?: string
  email?: string
}

export type KnowledgeArticleDetails = {
  displayPermission: KnowledgeArticleDisplayPermission
  pageCategory: string
  tags: string[]
  publicLink: string
  expiresAt: string
  creator: KnowledgeArticlePerson
  agentsWithAccess: KnowledgeArticlePerson[]
  feedback: {
    helpful: number
    notHelpful: number
  }
  seo: {
    metaTitle: string
    metaKeywords: string
    metaDescription: string
  }
}

export type KnowledgeArticleVersion = {
  id: string
  timestampLabel: string
  periodLabel: string
  contributors: KnowledgeArticlePerson[]
}

export type KnowledgeArticleContent = {
  format: "tiptap-json"
  document: JSONContent
}

export type KnowledgeArticleSavePatch = {
  document: JSONContent
  title: string
  status: KnowledgeArticleStatus
  customerReply: string
  details: KnowledgeArticleDetails
}

export type KnowledgeArticleCreateInput = {
  groupId: string
  title?: string
  status?: KnowledgeArticleStatus
  pageCategory?: string
}

export type KnowledgeArticleComment = {
  id: string
  articleId: string
  author: {
    name: string
    avatarUrl?: string
    email?: string
  }
  timestamp: string
  body: string
  badge?: string
  status?: "open" | "resolved"
}

export type KnowledgeArticleActivityTone =
  | "neutral"
  | "warning"
  | "success"
  | "positive"

export type KnowledgeArticleActivity = {
  id: string
  articleId: string
  title: string
  timestamp: string
  detail?: string
  tone?: KnowledgeArticleActivityTone
}

export type KnowledgeBaseStorageSnapshot = {
  version: 1
  seedRevision?: number
  articles: KnowledgeArticle[]
  groups: KnowledgeArticleExplorerGroup[]
}

export type KnowledgeArticle = {
  id: string
  title: string
  summary: string
  category: TicketCategoryKey
  status: KnowledgeArticleStatus
  updatedAt: string
  author: {
    name: string
    avatarUrl?: string
  }
  matchScore: "high" | "medium" | "low"
  views: number
  helpfulRate: number
  linkedTickets: number
  matchReasons: string[]
  quickPath?: string
  media?: Array<
    | {
        type: "image"
        title: string
        caption: string
        src?: string
      }
    | {
        type: "video"
        title: string
        duration: string
      }
  >
  sections: Array<{
    title: string
    body: string
  }>
  content?: KnowledgeArticleContent
  customerReply: string
  comments?: KnowledgeArticleComment[]
  commentsCount?: number
  activity?: KnowledgeArticleActivity[]
  activityCount?: number
  isPinned?: boolean
  archivedAt?: string
  details?: KnowledgeArticleDetails
  versions?: KnowledgeArticleVersion[]
}

export type KnowledgeArticleExplorerGroup = {
  id: string
  label: string
  icon: KnowledgeArticleGroupIcon
  defaultOpen?: boolean
  articleIds: string[]
}

export type KnowledgeArticleResolvedGroup = {
  id: string
  label: string
  icon: KnowledgeArticleGroupIcon
  defaultOpen: boolean
  articles: KnowledgeArticle[]
}

export type KnowledgeArticleGroupIcon =
  | "book"
  | "credit-card"
  | "shield"
  | "tool"
  | "plug"
  | "users"
