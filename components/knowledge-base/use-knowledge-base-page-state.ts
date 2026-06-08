"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import type { ArticleDetailTab } from "@/components/knowledge-base/knowledge-base-article-detail"
import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import {
  createDraftKnowledgeArticle,
  createKnowledgeExplorerGroup,
} from "@/lib/knowledge-base/articles"
import {
  getKnowledgeArticleById,
  getKnowledgeArticleExplorerGroups,
} from "@/lib/knowledge-base/mock-data"
import {
  getDefaultKnowledgeBaseSnapshot,
  loadKnowledgeBaseSnapshot,
  saveKnowledgeBaseSnapshot,
} from "@/lib/knowledge-base/storage"
import type {
  KnowledgeArticleExplorerGroup,
  KnowledgeArticleGroupIcon,
  KnowledgeArticleSavePatch,
} from "@/lib/knowledge-base/types"

type PendingNavigationAction =
  | { type: "select-article"; articleId: string }
  | { type: "create-article" }

function normalizeSelectedArticleId(value: string | null, articleIds: string[]) {
  if (value && articleIds.includes(value)) return value
  return articleIds[0] ?? null
}

function normalizeArticleDetailTab(value: string | null): ArticleDetailTab {
  if (
    value === "content" ||
    value === "insights" ||
    value === "comments" ||
    value === "activity"
  ) {
    return value
  }

  return "content"
}

export function useKnowledgeBasePageState() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultSnapshot = React.useMemo(() => getDefaultKnowledgeBaseSnapshot(), [])

  const [articles, setArticles] = React.useState(() => defaultSnapshot.articles)
  const [groupDefinitions, setGroupDefinitions] = React.useState<
    KnowledgeArticleExplorerGroup[]
  >(() => defaultSnapshot.groups)
  const [hasHydrated, setHasHydrated] = React.useState(false)
  const [activeGroupId, setActiveGroupId] = React.useState<string | null>(
    () => defaultSnapshot.groups[0]?.id ?? null
  )
  const [isGroupPanelOpen, setIsGroupPanelOpen] = React.useState(true)
  const [searchValue, setSearchValue] = React.useState("")
  const [hasUnsavedArticleChanges, setHasUnsavedArticleChanges] =
    React.useState(false)
  const [pendingNavigationAction, setPendingNavigationAction] =
    React.useState<PendingNavigationAction | null>(null)
  const [editOnMountArticleId, setEditOnMountArticleId] = React.useState<
    string | null
  >(null)
  const [pendingSelectedArticleId, setPendingSelectedArticleId] = React.useState<
    string | null
  >(null)
  const previousSelectedArticleIdRef = React.useRef<string | null>(null)

  const articleGroups = React.useMemo(
    () => getKnowledgeArticleExplorerGroups(articles, groupDefinitions),
    [articles, groupDefinitions]
  )
  const articleIds = articleGroups.flatMap((group) =>
    group.articles.map((article) => article.id)
  )
  const querySelectedArticleId = normalizeSelectedArticleId(
    searchParams.get("article"),
    articleIds
  )
  const selectedArticleId = React.useMemo(() => {
    if (
      pendingSelectedArticleId &&
      articles.some((article) => article.id === pendingSelectedArticleId)
    ) {
      return pendingSelectedArticleId
    }

    return querySelectedArticleId
  }, [articles, pendingSelectedArticleId, querySelectedArticleId])
  const selectedArticle = getKnowledgeArticleById(selectedArticleId, articles)
  const activeArticleTab = normalizeArticleDetailTab(
    searchParams.get("articleTab")
  )

  React.useEffect(() => {
    const snapshot = loadKnowledgeBaseSnapshot(defaultSnapshot)
    setArticles(snapshot.articles)
    setGroupDefinitions(snapshot.groups)
    setHasHydrated(true)
  }, [defaultSnapshot])

  React.useEffect(() => {
    if (!hasHydrated) return

    saveKnowledgeBaseSnapshot({
      version: 1,
      articles,
      groups: groupDefinitions,
    })
  }, [articles, groupDefinitions, hasHydrated])

  React.useEffect(() => {
    const articleFromQuery = searchParams.get("article")
    if (
      pendingSelectedArticleId &&
      articleFromQuery === pendingSelectedArticleId
    ) {
      setPendingSelectedArticleId(null)
    }
  }, [pendingSelectedArticleId, searchParams])

  React.useEffect(() => {
    if (previousSelectedArticleIdRef.current === selectedArticleId) return

    previousSelectedArticleIdRef.current = selectedArticleId

    if (!selectedArticleId) return

    const selectedArticleGroup = articleGroups.find((group) =>
      group.articles.some((article) => article.id === selectedArticleId)
    )

    if (!selectedArticleGroup) return

    setActiveGroupId(selectedArticleGroup.id)
  }, [articleGroups, selectedArticleId])

  const replaceQuery = React.useCallback(
    (patch: { article?: string | null; articleTab?: ArticleDetailTab }) => {
      const nextSearchParams = new URLSearchParams(searchParams.toString())

      if (patch.article !== undefined) {
        if (patch.article) {
          nextSearchParams.set("article", patch.article)
        } else {
          nextSearchParams.delete("article")
        }
      }

      if (patch.articleTab !== undefined) {
        if (patch.articleTab === "content") {
          nextSearchParams.delete("articleTab")
        } else {
          nextSearchParams.set("articleTab", patch.articleTab)
        }
      }

      const nextQuery = nextSearchParams.toString()
      router.replace(nextQuery ? `/knowledge-base?${nextQuery}` : "/knowledge-base", {
        scroll: false,
      })
    },
    [router, searchParams]
  )

  const navigateToArticle = React.useCallback(
    (articleId: string) => {
      setPendingSelectedArticleId(articleId)
      replaceQuery({ article: articleId, articleTab: "content" })
    },
    [replaceQuery]
  )

  const handleSelectGroup = React.useCallback((groupId: string) => {
    setActiveGroupId(groupId)
  }, [])

  const handleSelectArticle = React.useCallback(
    (articleId: string) => {
      if (articleId === selectedArticleId) return

      if (hasUnsavedArticleChanges) {
        setPendingNavigationAction({ type: "select-article", articleId })
        return
      }

      navigateToArticle(articleId)
    },
    [hasUnsavedArticleChanges, navigateToArticle, selectedArticleId]
  )

  const createArticleInActiveGroup = React.useCallback(() => {
    if (!activeGroupId) return

    const draftArticle = createDraftKnowledgeArticle({
      groupId: activeGroupId,
      title: knowledgeBasePageCopy.untitledArticleTitle,
    })

    setArticles((currentArticles) => [...currentArticles, draftArticle])
    setGroupDefinitions((currentGroups) =>
      currentGroups.map((group) =>
        group.id === activeGroupId
          ? {
              ...group,
              articleIds: [...group.articleIds, draftArticle.id],
            }
          : group
      )
    )
    setEditOnMountArticleId(draftArticle.id)
    setHasUnsavedArticleChanges(false)
    navigateToArticle(draftArticle.id)
  }, [activeGroupId, navigateToArticle])

  const handleCreateArticle = React.useCallback(() => {
    if (!activeGroupId) return

    if (hasUnsavedArticleChanges) {
      setPendingNavigationAction({ type: "create-article" })
      return
    }

    createArticleInActiveGroup()
  }, [activeGroupId, createArticleInActiveGroup, hasUnsavedArticleChanges])

  const handleConfirmPendingNavigation = React.useCallback(() => {
    if (!pendingNavigationAction) return

    if (pendingNavigationAction.type === "select-article") {
      navigateToArticle(pendingNavigationAction.articleId)
    } else {
      createArticleInActiveGroup()
    }

    setPendingNavigationAction(null)
    setHasUnsavedArticleChanges(false)
  }, [createArticleInActiveGroup, navigateToArticle, pendingNavigationAction])

  const handleDismissPendingNavigation = React.useCallback(() => {
    setPendingNavigationAction(null)
  }, [])

  const handleCreateGroup = React.useCallback(
    ({
      label,
      icon,
    }: {
      label: string
      icon: KnowledgeArticleGroupIcon
    }) => {
      const nextGroup = createKnowledgeExplorerGroup({
        label,
        icon,
        groups: groupDefinitions,
      })

      setGroupDefinitions((currentGroups) => [...currentGroups, nextGroup])
      setActiveGroupId(nextGroup.id)
      setIsGroupPanelOpen(true)
    },
    [groupDefinitions]
  )

  const handleSaveArticle = React.useCallback(
    (articleId: string, patch: KnowledgeArticleSavePatch) => {
      setArticles((currentArticles) =>
        currentArticles.map((article) =>
          article.id === articleId
            ? {
                ...article,
                title: patch.title,
                status: patch.status,
                customerReply: patch.customerReply,
                content: {
                  format: "tiptap-json",
                  document: patch.document,
                },
                updatedAt: "Updated just now",
              }
            : article
        )
      )
      setHasUnsavedArticleChanges(false)
    },
    []
  )

  const clearEditOnMountArticleId = React.useCallback(() => {
    setEditOnMountArticleId(null)
  }, [])

  return {
    articleGroups,
    selectedArticleId,
    selectedArticle,
    activeArticleTab,
    activeGroupId,
    isGroupPanelOpen,
    setIsGroupPanelOpen,
    searchValue,
    setSearchValue,
    hasUnsavedArticleChanges,
    setHasUnsavedArticleChanges,
    pendingNavigationAction,
    editOnMountArticleId,
    clearEditOnMountArticleId,
    replaceQuery,
    handleSelectGroup,
    handleSelectArticle,
    handleCreateArticle,
    handleCreateGroup,
    handleSaveArticle,
    handleConfirmPendingNavigation,
    handleDismissPendingNavigation,
  }
}
