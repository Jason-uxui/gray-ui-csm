"use client"

import * as React from "react"

import {
  cloneKnowledgeArticleDetails,
  createDefaultKnowledgeArticleDetails,
} from "@/lib/knowledge-base/article-details"
import {
  extractCustomerReplyFromDocument,
  getKnowledgeArticleDocument,
} from "@/lib/knowledge-base/content"
import type {
  KnowledgeArticle,
  KnowledgeArticleDetails,
  KnowledgeArticleSavePatch,
  KnowledgeArticleStatus,
} from "@/lib/knowledge-base/types"

export type KnowledgeArticleChangedField =
  | "content"
  | "details"
  | "status"
  | "title"

type UseKnowledgeArticleEditorArgs = {
  article: KnowledgeArticle
  pageCategory: string
  startInEditMode?: boolean
  onSaveArticle: (articleId: string, patch: KnowledgeArticleSavePatch) => void
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
  onEditModeStarted?: () => void
}

export function useKnowledgeArticleEditor({
  article,
  pageCategory,
  startInEditMode = false,
  onSaveArticle,
  onUnsavedChangesChange,
  onEditModeStarted,
}: UseKnowledgeArticleEditorArgs) {
  const articleDocument = React.useMemo(
    () => getKnowledgeArticleDocument(article),
    [article]
  )
  const savedDetails = React.useMemo(
    () =>
      article.details ??
      createDefaultKnowledgeArticleDetails({
        id: article.id,
        title: article.title,
        summary: article.summary,
        status: article.status,
        author: article.author,
        pageCategory,
        views: article.views,
        helpfulRate: article.helpfulRate,
        matchReasons: article.matchReasons,
      }),
    [
      article.author,
      article.details,
      article.helpfulRate,
      article.id,
      article.matchReasons,
      article.status,
      article.summary,
      article.title,
      article.views,
      pageCategory,
    ]
  )
  const [isEditing, setIsEditing] = React.useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false)
  const [draftDocument, setDraftDocument] = React.useState(articleDocument)
  const [draftTitle, setDraftTitle] = React.useState(article.title)
  const [draftStatus, setDraftStatus] = React.useState(article.status)
  const [draftDetails, setDraftDetails] = React.useState(savedDetails)

  const savedSnapshotKey = React.useMemo(
    () =>
      JSON.stringify({
        document: articleDocument,
        title: article.title,
        status: article.status,
        details: savedDetails,
      }),
    [article.title, article.status, articleDocument, savedDetails]
  )
  const draftSnapshotKey = React.useMemo(
    () =>
      JSON.stringify({
        document: draftDocument,
        title: draftTitle,
        status: draftStatus,
        details: draftDetails,
      }),
    [draftDetails, draftDocument, draftTitle, draftStatus]
  )
  const hasUnsavedChanges = draftSnapshotKey !== savedSnapshotKey
  const changedFields = React.useMemo(() => {
    const fields: KnowledgeArticleChangedField[] = []

    if (draftTitle !== article.title) fields.push("title")
    if (draftStatus !== article.status) fields.push("status")
    if (JSON.stringify(draftDocument) !== JSON.stringify(articleDocument)) {
      fields.push("content")
    }
    if (JSON.stringify(draftDetails) !== JSON.stringify(savedDetails)) {
      fields.push("details")
    }

    return fields
  }, [
    article.status,
    article.title,
    articleDocument,
    draftDetails,
    draftDocument,
    draftStatus,
    draftTitle,
    savedDetails,
  ])

  const resetDraftState = React.useCallback(() => {
    setDraftDocument(articleDocument)
    setDraftTitle(article.title)
    setDraftStatus(article.status)
    setDraftDetails(cloneKnowledgeArticleDetails(savedDetails))
  }, [article.status, article.title, articleDocument, savedDetails])

  const discardEdits = React.useCallback(() => {
    resetDraftState()
    setIsEditing(false)
    setShowDiscardDialog(false)
  }, [resetDraftState])

  const consumedAutoEditRef = React.useRef(false)

  React.useEffect(() => {
    consumedAutoEditRef.current = false
    setIsEditing(false)
    setShowDiscardDialog(false)
    setShowSaveSuccess(false)
    resetDraftState()
  }, [article.id, resetDraftState])

  React.useEffect(() => {
    if (!startInEditMode || consumedAutoEditRef.current) return

    consumedAutoEditRef.current = true
    setIsEditing(true)
    onEditModeStarted?.()
  }, [article.id, onEditModeStarted, startInEditMode])

  React.useEffect(() => {
    onUnsavedChangesChange?.(isEditing && hasUnsavedChanges)
  }, [hasUnsavedChanges, isEditing, onUnsavedChangesChange])

  React.useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges, isEditing])

  React.useEffect(() => {
    if (!showSaveSuccess) return

    const timeoutId = window.setTimeout(() => {
      setShowSaveSuccess(false)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [showSaveSuccess])

  const handleSave = React.useCallback(() => {
    if (!hasUnsavedChanges) {
      setIsEditing(false)
      return
    }

    const customerReply =
      extractCustomerReplyFromDocument(draftDocument) ?? article.customerReply

    onSaveArticle(article.id, {
      document: draftDocument,
      title: draftTitle.trim() || article.title,
      status: draftStatus,
      customerReply,
      details: cloneKnowledgeArticleDetails({
        ...draftDetails,
        tags: draftDetails.tags.map((tag) => tag.trim()).filter(Boolean),
        seo: {
          metaTitle: draftDetails.seo.metaTitle.trim(),
          metaKeywords: draftDetails.seo.metaKeywords.trim(),
          metaDescription: draftDetails.seo.metaDescription.trim(),
        },
      }),
    })
    setIsEditing(false)
    setShowSaveSuccess(true)
  }, [
    article.customerReply,
    article.id,
    article.title,
    draftDetails,
    draftDocument,
    draftStatus,
    draftTitle,
    hasUnsavedChanges,
    onSaveArticle,
  ])

  const handleCancel = React.useCallback(() => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true)
      return
    }

    discardEdits()
  }, [discardEdits, hasUnsavedChanges])

  const handleTabChangeGuard = React.useCallback(
    (nextTab: string, onTabChange: (tab: string) => void) => {
      if (isEditing && nextTab !== "content") return
      onTabChange(nextTab)
    },
    [isEditing]
  )

  return {
    articleDocument,
    isEditing,
    setIsEditing,
    showDiscardDialog,
    setShowDiscardDialog,
    showSaveSuccess,
    draftDocument,
    setDraftDocument,
    draftTitle,
    setDraftTitle,
    draftStatus,
    setDraftStatus: (value: KnowledgeArticleStatus) => setDraftStatus(value),
    draftDetails,
    setDraftDetails: (value: KnowledgeArticleDetails) => setDraftDetails(value),
    savedDetails,
    hasUnsavedChanges,
    changedFields,
    discardEdits,
    handleSave,
    handleCancel,
    handleTabChangeGuard,
    displayedDocument: isEditing ? draftDocument : articleDocument,
    displayedTitle: isEditing ? draftTitle : article.title,
    headerTitle: isEditing ? draftTitle : article.title,
  }
}

export type KnowledgeArticleEditorState = ReturnType<
  typeof useKnowledgeArticleEditor
>
