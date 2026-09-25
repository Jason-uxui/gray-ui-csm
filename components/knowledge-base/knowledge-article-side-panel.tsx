"use client"

import * as React from "react"
import {
  IconChevronRight,
  IconFilter,
  IconHistory,
  IconInfoCircle,
  IconPlus,
} from "@tabler/icons-react"

import { KnowledgeArticleDetailsPanel } from "@/components/knowledge-base/knowledge-article-details-panel"
import { KnowledgeArticleVersionHistory } from "@/components/knowledge-base/knowledge-article-version-history"
import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type {
  KnowledgeArticleDetails,
  KnowledgeArticleVersion,
} from "@/lib/knowledge-base/types"
import { cn } from "@/lib/utils"

type ArticleSidePanelMode = "details" | "history"

type KnowledgeArticleSidePanelProps = {
  articleId: string
  details: KnowledgeArticleDetails
  versions: KnowledgeArticleVersion[]
  editable: boolean
  categoryOptions: string[]
  onDetailsChange: (details: KnowledgeArticleDetails) => void
}

const desktopPanelQuery = "(min-width: 80rem)"

function ArticleSidePanelBody({
  mode,
  articleId,
  details,
  versions,
  editable,
  categoryOptions,
  onDetailsChange,
  docked = false,
  reserveCloseSpace = false,
}: KnowledgeArticleSidePanelProps & {
  mode: ArticleSidePanelMode
  docked?: boolean
  reserveCloseSpace?: boolean
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div
        className={cn(
          "flex shrink-0 items-center px-4",
          docked ? "mt-6 h-9 pl-8" : "py-4",
          reserveCloseSpace && "pr-14"
        )}
      >
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium">
          {mode === "history"
            ? knowledgeBasePageCopy.articleVersionHistoryLabel
            : knowledgeBasePageCopy.articleDetailsTabLabel}
        </h2>
        {mode === "history" ? (
          <TooltipProvider>
            <div className="flex shrink-0 items-center">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={knowledgeBasePageCopy.versionHistoryFilterLabel}
                    />
                  }
                >
                  <IconFilter />
                </TooltipTrigger>
                <TooltipContent>
                  {knowledgeBasePageCopy.versionHistoryFilterLabel}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={knowledgeBasePageCopy.versionHistoryAddLabel}
                    />
                  }
                >
                  <IconPlus />
                </TooltipTrigger>
                <TooltipContent>
                  {knowledgeBasePageCopy.versionHistoryAddLabel}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : null}
      </div>
      <div
        className={cn(
          "scrollbar-hidden min-h-0 flex-1 overflow-y-auto",
          mode === "history" ? "py-2 pr-2 pl-4" : "px-4 py-4"
        )}
      >
        {mode === "history" ? (
          <KnowledgeArticleVersionHistory versions={versions} />
        ) : (
          <KnowledgeArticleDetailsPanel
            articleId={articleId}
            details={details}
            editable={editable}
            categoryOptions={categoryOptions}
            onChange={onDetailsChange}
          />
        )}
      </div>
    </div>
  )
}

export function KnowledgeArticleSidePanel(props: KnowledgeArticleSidePanelProps) {
  const [mode, setMode] = React.useState<ArticleSidePanelMode>("details")
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isCompactLayout, setIsCompactLayout] = React.useState(false)
  const [isColumnOpen, setIsColumnOpen] = React.useState(true)

  React.useEffect(() => {
    setMode("details")
    setMobileOpen(false)
  }, [props.articleId])

  React.useEffect(() => {
    const media = window.matchMedia(desktopPanelQuery)
    const syncLayout = () => {
      const compact = !media.matches
      setIsCompactLayout(compact)
      if (!compact) setMobileOpen(false)
    }

    syncLayout()
    media.addEventListener("change", syncLayout)
    return () => media.removeEventListener("change", syncLayout)
  }, [])

  const openMode = (nextMode: ArticleSidePanelMode) => {
    setMode(nextMode)
    if (window.matchMedia(desktopPanelQuery).matches) {
      setIsColumnOpen(true)
      return
    }
    setIsCompactLayout(true)
    setMobileOpen(true)
  }

  const showDockedPanel = !isCompactLayout && isColumnOpen

  const panelTitle =
    mode === "history"
      ? knowledgeBasePageCopy.articleVersionHistoryLabel
      : knowledgeBasePageCopy.articleDetailsTabLabel

  return (
    <div className="relative z-20 flex h-full min-h-0 shrink-0">
      {showDockedPanel ? (
        <aside className="hidden h-full min-h-0 w-80 shrink-0 flex-col border-l xl:flex">
          <ArticleSidePanelBody mode={mode} docked {...props} />
        </aside>
      ) : null}
      {showDockedPanel ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute top-6 left-0 z-20 hidden -translate-x-1/2 rounded-xl bg-background hover:bg-background aria-expanded:bg-background dark:bg-background dark:hover:bg-background dark:aria-expanded:bg-background xl:inline-flex"
                  aria-expanded={isColumnOpen}
                  aria-label={knowledgeBasePageCopy.collapseArticleDetailsLabel}
                  onClick={() => setIsColumnOpen(false)}
                />
              }
            >
              <IconChevronRight className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="left">
              {knowledgeBasePageCopy.collapseArticleDetailsLabel}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
      <div
        className="flex w-12 shrink-0 flex-col items-center gap-1 border-l bg-background py-3"
        role="toolbar"
        aria-label={knowledgeBasePageCopy.articleDetailsRailLabel}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-pressed={mode === "details"}
          aria-label={knowledgeBasePageCopy.articleDetailsTabLabel}
          className={cn(mode === "details" && "bg-muted")}
          onClick={() => openMode("details")}
        >
          <IconInfoCircle />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-pressed={mode === "history"}
          aria-label={knowledgeBasePageCopy.articleVersionHistoryLabel}
          className={cn(mode === "history" && "bg-muted")}
          onClick={() => openMode("history")}
        >
          <IconHistory />
        </Button>
      </div>
      {isCompactLayout ? (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="sr-only">
              <SheetTitle>{panelTitle}</SheetTitle>
            </SheetHeader>
            <ArticleSidePanelBody mode={mode} reserveCloseSpace {...props} />
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  )
}
