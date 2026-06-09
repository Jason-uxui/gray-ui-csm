"use client"

import * as React from "react"
import {
  IconActivity,
  IconChartBar,
  IconChevronDown,
  IconDots,
  IconEye,
  IconFileText,
  IconMessage,
  IconPencil,
} from "@tabler/icons-react"

import { KnowledgeArticleContentView } from "@/components/knowledge-base/knowledge-article-content-view"
import { KnowledgeArticleEditor } from "@/components/knowledge-base/knowledge-article-editor"
import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useKnowledgeArticleEditor,
  type KnowledgeArticleChangedField,
} from "@/components/knowledge-base/use-knowledge-article-editor"
import type {
  KnowledgeArticle,
  KnowledgeArticleSavePatch,
  KnowledgeArticleStatus,
} from "@/lib/knowledge-base/types"
import { cn } from "@/lib/utils"

type KnowledgeBaseArticleDetailProps = {
  article: KnowledgeArticle
  activeTab: ArticleDetailTab
  startInEditMode?: boolean
  onEditModeStarted?: () => void
  onTabChange: (tab: ArticleDetailTab) => void
  onSaveArticle: (articleId: string, patch: KnowledgeArticleSavePatch) => void
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
}

export type ArticleDetailTab = "content" | "insights" | "comments" | "activity"

export const articleDetailTabs: Array<{
  value: ArticleDetailTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
    {
      value: "content",
      label: knowledgeBasePageCopy.contentTab,
      icon: IconFileText,
    },
    {
      value: "insights",
      label: knowledgeBasePageCopy.insightsTab,
      icon: IconChartBar,
    },
    {
      value: "comments",
      label: knowledgeBasePageCopy.commentsTab,
      icon: IconMessage,
    },
    {
      value: "activity",
      label: knowledgeBasePageCopy.activityTab,
      icon: IconActivity,
    },
  ]

const articleStatusOptions: Array<{
  value: KnowledgeArticleStatus
  label: string
}> = [
    { value: "published", label: knowledgeBasePageCopy.statusPublished },
    { value: "draft", label: knowledgeBasePageCopy.statusDraft },
    { value: "needs-review", label: knowledgeBasePageCopy.statusNeedsReview },
  ]

const articleStatusClassNames: Record<KnowledgeArticleStatus, string> = {
  published:
    " bg-teal-600 text-white",
  draft: " bg-secondary text-muted-foreground",
  "needs-review":
    " bg-amber-600 text-white",
}

function getArticleStatusLabel(status: KnowledgeArticleStatus) {
  if (status === "published") return knowledgeBasePageCopy.statusPublished
  if (status === "needs-review") return knowledgeBasePageCopy.statusNeedsReview
  return knowledgeBasePageCopy.statusDraft
}

function getArticleStatusClassName(status: KnowledgeArticleStatus) {
  return articleStatusClassNames[status]
}

const articleChangedFieldLabels: Record<KnowledgeArticleChangedField, string> = {
  content: knowledgeBasePageCopy.articleChangeContentLabel,
  status: knowledgeBasePageCopy.articleChangeStatusLabel,
  title: knowledgeBasePageCopy.articleChangeTitleLabel,
}

function formatArticleChangesLabel(fields: KnowledgeArticleChangedField[]) {
  if (fields.length === 1) {
    return `${articleChangedFieldLabels[fields[0]]} ${knowledgeBasePageCopy.articleSingleChangeSuffix}`
  }

  return `${fields.length} ${knowledgeBasePageCopy.articleMultipleChangesSuffix}`
}

function getCategoryLabel(category: string) {
  return category.replaceAll("-", " ")
}

function ArticleStatusPill({
  editable,
  status,
  onStatusChange,
}: {
  editable: boolean
  status: KnowledgeArticleStatus
  onStatusChange?: (status: KnowledgeArticleStatus) => void
}) {
  const statusLabel = getArticleStatusLabel(status)
  const statusClassName = cn(
    "h-6 rounded-full px-2 text-xs",
    getArticleStatusClassName(status)
  )

  if (!editable) {
    return (
      <Badge variant="outline" className={statusClassName}>
        {statusLabel}
      </Badge>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("h-7 rounded-full px-2.5 text-xs", statusClassName)}
          />
        }
      >
        {statusLabel}
        <IconChevronDown className="size-3.5 opacity-75" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {knowledgeBasePageCopy.articleStatusLabel}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={status}
            onValueChange={(value) =>
              onStatusChange?.(value as KnowledgeArticleStatus)
            }
          >
            {articleStatusOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function KnowledgeArticleSaveBar({
  changesLabel,
  isPreviewingDraft,
  onDiscard,
  onPreviewToggle,
  onSave,
}: {
  changesLabel: string
  isPreviewingDraft: boolean
  onDiscard: () => void
  onPreviewToggle: () => void
  onSave: () => void
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border border-border bg-background/85 px-3 py-2 shadow-xl shadow-foreground/10 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <p className="min-w-0 truncate text-sm text-muted-foreground">
          {changesLabel}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={onPreviewToggle}
          >
            <IconEye className="size-4" />
            {isPreviewingDraft
              ? knowledgeBasePageCopy.articleBackToEditorLabel
              : knowledgeBasePageCopy.articlePreviewDraftLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={onDiscard}
          >
            {knowledgeBasePageCopy.articleDiscardLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-xl"
            onClick={onSave}
          >
            {knowledgeBasePageCopy.articleSaveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function KnowledgeBaseArticleDetail({
  article,
  activeTab,
  startInEditMode = false,
  onEditModeStarted,
  onTabChange,
  onSaveArticle,
  onUnsavedChangesChange,
}: KnowledgeBaseArticleDetailProps) {
  const [showLinkCopied, setShowLinkCopied] = React.useState(false)
  const {
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
    setDraftStatus,
    hasUnsavedChanges,
    changedFields,
    discardEdits,
    handleSave,
    handleCancel,
    handleTabChangeGuard,
    displayedDocument,
    displayedTitle,
    headerTitle,
  } = useKnowledgeArticleEditor({
    article,
    startInEditMode,
    onEditModeStarted,
    onSaveArticle,
    onUnsavedChangesChange,
  })

  React.useEffect(() => {
    if (!showLinkCopied) return

    const timeoutId = window.setTimeout(() => {
      setShowLinkCopied(false)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [showLinkCopied])

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return

    const nextUrl = `${window.location.origin}/knowledge-base?article=${article.id}`

    try {
      await navigator.clipboard.writeText(nextUrl)
      setShowLinkCopied(true)
    } catch {
      setShowLinkCopied(false)
    }
  }

  const changesLabel = formatArticleChangesLabel(changedFields)

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(nextTab) =>
          handleTabChangeGuard(nextTab, (value) =>
            onTabChange(value as ArticleDetailTab)
          )
        }
        className="flex h-full min-h-0 flex-1 flex-col gap-0 overflow-hidden"
      >
        <div className="z-10 shrink-0 border-b bg-background">
          <div className="px-8 py-6">
            <div className="flex w-full items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {isEditing ? (
                  <Input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    placeholder={knowledgeBasePageCopy.articleTitlePlaceholder}
                    className="h-auto rounded-none border-transparent bg-transparent p-0 text-2xl leading-tight font-semibold tracking-tight text-foreground shadow-none focus-visible:border-transparent focus-visible:ring-0 sm:text-3xl md:text-3xl"
                  />
                ) : (
                  <p className="min-w-0 text-2xl leading-tight font-semibold tracking-tight text-foreground sm:text-3xl">
                    {headerTitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <ArticleStatusPill
                    editable={isEditing}
                    status={isEditing ? draftStatus : article.status}
                    onStatusChange={setDraftStatus}
                  />
                  <span className="text-sm text-muted-foreground">
                    {knowledgeBasePageCopy.articleLastEditedPrefix}{" "}
                    {article.updatedAt.replace(/^Updated\s+/i, "")} by{" "}
                    {article.author.name}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {showSaveSuccess ? (
                  <span className="hidden text-xs text-emerald-600 sm:inline dark:text-emerald-300">
                    {knowledgeBasePageCopy.articleSaveSuccessLabel}
                  </span>
                ) : null}
                {showLinkCopied ? (
                  <span className="hidden text-xs text-emerald-600 sm:inline dark:text-emerald-300">
                    {knowledgeBasePageCopy.articleLinkCopiedLabel}
                  </span>
                ) : null}

                {!isEditing ? (
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-xl px-3"
                    onClick={() => setIsEditing(true)}
                  >
                    <IconPencil className="size-4" />
                    {knowledgeBasePageCopy.articleEditLabel}
                  </Button>
                ) : null}

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="size-10 rounded-xl"
                      />
                    }
                  >
                    <IconDots className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => void handleCopyLink()}>
                        {knowledgeBasePageCopy.articleCopyLinkLabel}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="px-6">
            <TabsList
              variant="line"
              className="w-full justify-start gap-1 rounded-none p-0"
            >
              {articleDetailTabs.map((tab) => {
                const TabIcon = tab.icon

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    disabled={isEditing && tab.value !== "content"}
                    className="flex-none gap-2 px-4"
                  >
                    <TabIcon className="size-4" />
                    {tab.value === "comments" ? (
                      <>
                        <span>{tab.label}</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {article.commentsCount ?? 3}
                        </span>
                      </>
                    ) : (
                      tab.label
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </div>

        <TabsContent
          value="content"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
              {isEditing && !isPreviewingDraft ? (
                <KnowledgeArticleEditor
                  article={article}
                  value={draftDocument}
                  onChange={setDraftDocument}
                />
              ) : (
                <KnowledgeArticleContentView
                  article={article}
                  document={displayedDocument}
                  title={displayedTitle.trim() || article.title}
                  showBodyHeading={false}
                />
              )}
              {isEditing && hasUnsavedChanges ? (
                <div className="h-20" aria-hidden />
              ) : null}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="insights"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-6 py-8">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border bg-card/50 p-5">
                  <div className="text-sm text-muted-foreground">
                    {knowledgeBasePageCopy.insightsViewsLabel}
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight">
                    {article.views}
                  </div>
                </div>
                <div className="rounded-3xl border bg-card/50 p-5">
                  <div className="text-sm text-muted-foreground">
                    {knowledgeBasePageCopy.insightsHelpfulRateLabel}
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight">
                    {article.helpfulRate}%
                  </div>
                </div>
                <div className="rounded-3xl border bg-card/50 p-5">
                  <div className="text-sm text-muted-foreground">
                    {knowledgeBasePageCopy.insightsLinkedTicketsLabel}
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight">
                    {article.linkedTickets}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-card/50 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {knowledgeBasePageCopy.insightsMatchSignalsLabel}
                  </h2>
                  <Badge
                    variant="outline"
                    className="h-7 rounded-full px-3 capitalize"
                  >
                    {knowledgeBasePageCopy.insightsCategoryLabel}:{" "}
                    {getCategoryLabel(article.category)}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.matchReasons.map((reason) => (
                    <Badge
                      key={reason}
                      variant="outline"
                      className="h-7 rounded-full px-3"
                    >
                      {reason}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {knowledgeBasePageCopy.insightsEmptyDescription}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="comments"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-6 py-8">
            <div className="mx-auto max-w-4xl rounded-3xl border border-dashed bg-card/50 p-6">
              <h2 className="text-xl font-semibold tracking-tight">
                {knowledgeBasePageCopy.commentsEmptyTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {knowledgeBasePageCopy.commentsEmptyDescription}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="activity"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-6 py-8">
            <div className="mx-auto max-w-4xl rounded-3xl border border-dashed bg-card/50 p-6">
              <h2 className="text-xl font-semibold tracking-tight">
                {knowledgeBasePageCopy.activityEmptyTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {knowledgeBasePageCopy.activityEmptyDescription}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        title={knowledgeBasePageCopy.articleDiscardTitle}
        description={knowledgeBasePageCopy.articleDiscardDescription}
        confirmLabel={knowledgeBasePageCopy.articleDiscardConfirmLabel}
        cancelLabel={knowledgeBasePageCopy.articleCancelLabel}
        confirmVariant="destructive"
        onConfirm={discardEdits}
      />
      {isEditing && hasUnsavedChanges ? (
        <KnowledgeArticleSaveBar
          changesLabel={changesLabel}
          isPreviewingDraft={isPreviewingDraft}
          onDiscard={handleCancel}
          onPreviewToggle={() =>
            setIsPreviewingDraft((isPreviewing) => !isPreviewing)
          }
          onSave={handleSave}
        />
      ) : null}
    </>
  )
}
