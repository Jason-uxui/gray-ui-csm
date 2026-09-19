"use client"

import * as React from "react"
import { IconChevronDown, IconDots, IconPencil } from "@tabler/icons-react"

import { KnowledgeArticleActivityTab } from "@/components/knowledge-base/knowledge-article-activity"
import { KnowledgeArticleInsights } from "@/components/knowledge-base/knowledge-article-insights"
import { KnowledgeArticleContentView } from "@/components/knowledge-base/knowledge-article-content-view"
import { KnowledgeArticleComments } from "@/components/knowledge-base/knowledge-article-comments"
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
  KnowledgeArticleComment,
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
  onSaveArticleComments: (
    articleId: string,
    comments: KnowledgeArticleComment[]
  ) => void
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
}

export type ArticleDetailTab = "content" | "insights" | "comments" | "activity"

export const articleDetailTabs: Array<{
  value: ArticleDetailTab
  label: string
}> = [
  {
    value: "content",
    label: knowledgeBasePageCopy.contentTab,
  },
  {
    value: "insights",
    label: knowledgeBasePageCopy.insightsTab,
  },
  {
    value: "comments",
    label: knowledgeBasePageCopy.commentsTab,
  },
  {
    value: "activity",
    label: knowledgeBasePageCopy.activityTab,
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
  published: " bg-status-approved text-status-on-solid",
  draft: " bg-secondary text-muted-foreground",
  "needs-review": " bg-status-changes-requested text-status-on-solid",
}

function getArticleStatusLabel(status: KnowledgeArticleStatus) {
  if (status === "published") return knowledgeBasePageCopy.statusPublished
  if (status === "needs-review") return knowledgeBasePageCopy.statusNeedsReview
  return knowledgeBasePageCopy.statusDraft
}

function getArticleStatusClassName(status: KnowledgeArticleStatus) {
  return articleStatusClassNames[status]
}

const articleChangedFieldLabels: Record<KnowledgeArticleChangedField, string> =
  {
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
  hasUnsavedChanges,
  onDiscard,
  onSave,
}: {
  changesLabel: string
  hasUnsavedChanges: boolean
  onDiscard: () => void
  onSave: () => void
}) {
  const barActionButtonClass =
    "h-8 rounded-lg px-2.5 text-[13px] text-inherit hover:bg-white/10 hover:text-inherit dark:hover:bg-black/8 dark:hover:text-inherit"

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border border-zinc-800/90 bg-zinc-950 px-1.5 py-1.5 text-zinc-100 shadow-xl ring-1 ring-black/20 dark:border-zinc-300/80 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-white/25">
        <p
          className="min-w-0 truncate px-2 text-sm font-medium"
          aria-live="polite"
        >
          {changesLabel}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={barActionButtonClass}
            onClick={onDiscard}
          >
            {hasUnsavedChanges
              ? knowledgeBasePageCopy.articleDiscardLabel
              : knowledgeBasePageCopy.articleCancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-lg border border-white/15 bg-zinc-100 px-3 text-[13px] text-zinc-950 hover:bg-white disabled:border-white/15 disabled:bg-white/10 disabled:text-zinc-300 dark:border-black/10 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-black dark:disabled:border-black/10 dark:disabled:bg-black/8 dark:disabled:text-zinc-600"
            disabled={!hasUnsavedChanges}
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
  onSaveArticleComments,
  onUnsavedChangesChange,
}: KnowledgeBaseArticleDetailProps) {
  const [showLinkCopied, setShowLinkCopied] = React.useState(false)
  const [articleComments, setArticleComments] = React.useState(
    () => article.comments ?? []
  )
  const {
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
    setDraftStatus,
    hasUnsavedChanges,
    changedFields,
    discardEdits,
    handleSave,
    handleCancel,
    handleTabChangeGuard,
    headerTitle,
  } = useKnowledgeArticleEditor({
    article,
    startInEditMode,
    onEditModeStarted,
    onSaveArticle,
    onUnsavedChangesChange,
  })

  React.useEffect(() => {
    setArticleComments(article.comments ?? [])
  }, [article.id, article.comments])

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

  const handleCommentsChange = (comments: KnowledgeArticleComment[]) => {
    setArticleComments(comments)
    onSaveArticleComments(article.id, comments)
  }

  const changesLabel = hasUnsavedChanges
    ? formatArticleChangesLabel(changedFields)
    : knowledgeBasePageCopy.articleNoChangesLabel
  const hasCommentRecords =
    article.comments !== undefined || articleComments.length > 0
  const commentsCount = hasCommentRecords
    ? articleComments.length
    : (article.commentsCount ??
      Number(knowledgeBasePageCopy.commentsTabCountFallback))
  const hasActivityRecords = article.activity !== undefined
  const activityCount = hasActivityRecords
    ? (article.activity?.length ?? 0)
    : (article.activityCount ?? 0)

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
                    size="default"
                    className="rounded-xl"
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
                        size="icon"
                        className="rounded-xl"
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
              className="w-full justify-start"
            >
              {articleDetailTabs.map((tab) => {
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    disabled={isEditing && tab.value !== "content"}
                    className="flex-none gap-2"
                  >
                    {tab.value === "comments" || tab.value === "activity" ? (
                      <>
                        <span>{tab.label}</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {tab.value === "comments"
                            ? commentsCount
                            : activityCount}
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
              {isEditing ? (
                <KnowledgeArticleEditor
                  article={article}
                  value={draftDocument}
                  onChange={setDraftDocument}
                />
              ) : (
                <KnowledgeArticleContentView
                  article={article}
                  document={articleDocument}
                  title={article.title}
                  showBodyHeading={false}
                />
              )}
              {isEditing ? <div className="h-20" aria-hidden /> : null}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="insights"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-6 py-8">
            <KnowledgeArticleInsights article={article} />
          </div>
        </TabsContent>

        <TabsContent
          value="comments"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <KnowledgeArticleComments
            article={{ ...article, comments: articleComments }}
            onCommentsChange={handleCommentsChange}
          />
        </TabsContent>

        <TabsContent
          value="activity"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <KnowledgeArticleActivityTab article={article} />
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
      {isEditing ? (
        <KnowledgeArticleSaveBar
          changesLabel={changesLabel}
          hasUnsavedChanges={hasUnsavedChanges}
          onDiscard={handleCancel}
          onSave={handleSave}
        />
      ) : null}
    </>
  )
}
