"use client"

import * as React from "react"

import {
  KnowledgeBaseArticleDetail,
} from "@/components/knowledge-base/knowledge-base-article-detail"
import { KnowledgeBaseGroupPanel } from "@/components/knowledge-base/knowledge-base-group-panel"
import { KnowledgeBaseContentPlaceholder } from "@/components/knowledge-base/knowledge-base-page-sections"
import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import { useKnowledgeBasePageState } from "@/components/knowledge-base/use-knowledge-base-page-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { CsmTemplateMetric } from "@/lib/csm-routes"
import { cn } from "@/lib/utils"

type KnowledgeBasePageProps = {
  title: string
  description: string
  metrics: CsmTemplateMetric[]
}

export function KnowledgeBasePage(props: KnowledgeBasePageProps) {
  void props

  const {
    articleGroups,
    selectedArticleId,
    selectedArticle,
    activeArticleTab,
    activeGroupId,
    isGroupPanelOpen,
    setIsGroupPanelOpen,
    searchValue,
    setSearchValue,
    setHasUnsavedArticleChanges,
    hasLocalChanges,
    pendingNavigationAction,
    isResetDialogOpen,
    setIsResetDialogOpen,
    editOnMountArticleId,
    clearEditOnMountArticleId,
    replaceQuery,
    handleSelectGroup,
    handleSelectArticle,
    handleCreateArticle,
    handleCreateGroup,
    handleSaveArticle,
    handleRequestResetKnowledgeBase,
    handleConfirmResetKnowledgeBase,
    handleConfirmPendingNavigation,
    handleDismissPendingNavigation,
  } = useKnowledgeBasePageState()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="flex min-h-0 flex-1 flex-col -m-4 sm:-m-6 lg:-m-8">
        <div
          className={cn(
            "grid min-h-0 flex-1 overflow-hidden border-t border-border",
            isGroupPanelOpen
              ? "lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]"
              : "lg:grid-cols-[3.5rem_minmax(0,1fr)]"
          )}
        >
          <KnowledgeBaseGroupPanel
            groups={articleGroups}
            activeGroupId={activeGroupId}
            selectedArticleId={selectedArticleId}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            isPanelOpen={isGroupPanelOpen}
            onTogglePanel={() => setIsGroupPanelOpen((isOpen) => !isOpen)}
            onSelectGroup={handleSelectGroup}
            onSelectArticle={handleSelectArticle}
            onCreateGroup={handleCreateGroup}
            onCreateArticle={handleCreateArticle}
            hasLocalChanges={hasLocalChanges}
            onResetContent={handleRequestResetKnowledgeBase}
          />

          <section className="flex min-h-0 flex-col overflow-hidden">
            {selectedArticle ? (
              <KnowledgeBaseArticleDetail
                article={selectedArticle}
                activeTab={activeArticleTab}
                startInEditMode={editOnMountArticleId === selectedArticle.id}
                onEditModeStarted={clearEditOnMountArticleId}
                onTabChange={(nextTab) => replaceQuery({ articleTab: nextTab })}
                onSaveArticle={handleSaveArticle}
                onUnsavedChangesChange={setHasUnsavedArticleChanges}
              />
            ) : (
              <div className="px-6 py-8">
                <KnowledgeBaseContentPlaceholder
                  eyebrow={knowledgeBasePageCopy.placeholderEyebrow}
                  title={knowledgeBasePageCopy.articlesEmptyTitle}
                  description={knowledgeBasePageCopy.articlesEmptyDescription}
                />
              </div>
            )}
          </section>
        </div>
      </section>

      <ConfirmDialog
        open={pendingNavigationAction !== null}
        onOpenChange={(open) => {
          if (!open) handleDismissPendingNavigation()
        }}
        title={knowledgeBasePageCopy.articleDiscardTitle}
        description={knowledgeBasePageCopy.articleDiscardDescription}
        confirmLabel={knowledgeBasePageCopy.articleDiscardConfirmLabel}
        cancelLabel={knowledgeBasePageCopy.articleCancelLabel}
        confirmVariant="destructive"
        onConfirm={handleConfirmPendingNavigation}
      />

      <ConfirmDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        title={knowledgeBasePageCopy.resetDemoContentTitle}
        description={knowledgeBasePageCopy.resetDemoContentDescription}
        confirmLabel={knowledgeBasePageCopy.resetDemoContentConfirmLabel}
        cancelLabel={knowledgeBasePageCopy.articleCancelLabel}
        confirmVariant="destructive"
        onConfirm={handleConfirmResetKnowledgeBase}
      />
    </div>
  )
}
