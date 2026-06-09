"use client"

import * as React from "react"

import {
  extractCustomerReplyFromDocument,
  getKnowledgeArticleDocument,
} from "@/lib/knowledge-base/content"
import type {
  KnowledgeArticle,
  KnowledgeArticleSavePatch,
  KnowledgeArticleStatus,
} from "@/lib/knowledge-base/types"

export type KnowledgeArticleChangedField = "content" | "status" | "title"

type UseKnowledgeArticleEditorArgs = {
  article: KnowledgeArticle
  startInEditMode?: boolean
  onSaveArticle: (articleId: string, patch: KnowledgeArticleSavePatch) => void
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
  onEditModeStarted?: () => void
}

export function useKnowledgeArticleEditor({
  article,
  startInEditMode = false,
  onSaveArticle,
  onUnsavedChangesChange,
  onEditModeStarted,
}: UseKnowledgeArticleEditorArgs) {
  const articleDocument = React.useMemo(
    () => getKnowledgeArticleDocument(article),
    [article]
  )
  const [isEditing, setIsEditing] = React.useState(false)
  const [isPreviewingDraft, setIsPreviewingDraft] = React.useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false)
  const [draftDocument, setDraftDocument] = React.useState(articleDocument)
  const [draftTitle, setDraftTitle] = React.useState(article.title)
  const [draftStatus, setDraftStatus] = React.useState(article.status)

  const savedSnapshotKey = React.useMemo(
    () =>
      JSON.stringify({
        document: articleDocument,
        title: article.title,
        status: article.status,
      }),
    [article.title, article.status, articleDocument]
  )
  const draftSnapshotKey = React.useMemo(
    () =>
      JSON.stringify({
        document: draftDocument,
        title: draftTitle,
        status: draftStatus,
      }),
    [draftDocument, draftTitle, draftStatus]
  )
  const hasUnsavedChanges = draftSnapshotKey !== savedSnapshotKey
  const changedFields = React.useMemo(() => {
    const fields: KnowledgeArticleChangedField[] = []

    if (draftTitle !== article.title) fields.push("title")
    if (draftStatus !== article.status) fields.push("status")
    if (JSON.stringify(draftDocument) !== JSON.stringify(articleDocument)) {
      fields.push("content")
    }

    return fields
  }, [
    article.status,
    article.title,
    articleDocument,
    draftDocument,
    draftStatus,
    draftTitle,
  ])

  const resetDraftState = React.useCallback(() => {
    setDraftDocument(articleDocument)
    setDraftTitle(article.title)
    setDraftStatus(article.status)
    setIsPreviewingDraft(false)
  }, [article.status, article.title, articleDocument])

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
      setIsPreviewingDraft(false)
      return
    }

    const customerReply =
      extractCustomerReplyFromDocument(draftDocument) ?? article.customerReply

    onSaveArticle(article.id, {
      document: draftDocument,
      title: draftTitle.trim() || article.title,
      status: draftStatus,
      customerReply,
    })
    setIsEditing(false)
    setIsPreviewingDraft(false)
    setShowSaveSuccess(true)
  }, [
    article.customerReply,
    article.id,
    article.title,
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
    isPreviewingDraft,
    setIsPreviewingDraft,
    showDiscardDialog,
    setShowDiscardDialog,
    showSaveSuccess,
    draftDocument,
    setDraftDocument,
    draftTitle,
    setDraftTitle,
    draftStatus,
    setDraftStatus: (value: KnowledgeArticleStatus) => setDraftStatus(value),
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
