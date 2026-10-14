"use client"

import * as React from "react"
import Image from "next/image"
import { createPortal } from "react-dom"
import {
  IconArrowLeft,
  IconCopy,
  IconDots,
  IconFileText,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { TooltipButton } from "@/components/ui/tooltip-button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { knowledgeArticles } from "@/lib/knowledge-base/mock-data"
import { useKnowledgeArticlesFromStorage } from "@/lib/knowledge-base/use-knowledge-articles-storage"
import type { KnowledgeArticle } from "@/lib/knowledge-base/types"
import { cn } from "@/lib/utils"
import { getKnowledgeArticleCategoryLabel } from "./ticket-knowledge-helpers"

type TicketKnowledgePanelProps = {
  iconTooltips?: boolean
  isSendingReply: boolean
  onCreateArticle: () => void
  onInsertArticle: (article: KnowledgeArticle) => void
}

const KNOWLEDGE_PREVIEW_SHOW_DELAY_MS = 150
const KNOWLEDGE_PREVIEW_HIDE_DELAY_MS = 120
const KNOWLEDGE_PREVIEW_WIDTH = 336
const KNOWLEDGE_PREVIEW_GAP = 24
const KNOWLEDGE_PREVIEW_MIN_VIEWPORT_PADDING = 24

export function TicketKnowledgePanel({
  onInsertArticle,
  onCreateArticle,
  isSendingReply,
  iconTooltips = false,
}: TicketKnowledgePanelProps) {
  const IconControl = iconTooltips ? TooltipButton : Button
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const articleListRef = React.useRef<HTMLDivElement | null>(null)
  const showPreviewTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null)
  const hidePreviewTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null)
  const [selectedArticle, setSelectedArticle] =
    React.useState<KnowledgeArticle | null>(null)
  const [hoveredArticleId, setHoveredArticleId] = React.useState<string | null>(
    null
  )
  const [previewArticle, setPreviewArticle] =
    React.useState<KnowledgeArticle | null>(null)
  const [isPreviewVisible, setIsPreviewVisible] = React.useState(false)
  const [previewPosition, setPreviewPosition] = React.useState<{
    left: number
    top: number
    width: number
    maxHeight: number
  } | null>(null)
  const [articleQuery, setArticleQuery] = React.useState("")
  const articles = useKnowledgeArticlesFromStorage(knowledgeArticles)
  const normalizedQuery = articleQuery.trim().toLowerCase()

  const filteredArticles = articles.filter((article) => {
    if (!normalizedQuery) return true

    return [article.title, article.summary, article.category]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const updatePreviewPosition = () => {
      const panelElement = panelRef.current
      const listElement = articleListRef.current

      if (!panelElement || !listElement) {
        setPreviewPosition(null)
        return
      }

      const canHoverPreview = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches

      if (!canHoverPreview) {
        setPreviewPosition(null)
        return
      }

      const panelRect = panelElement.getBoundingClientRect()
      const dividerLeft = panelRect.left - 16
      const left = Math.round(
        dividerLeft - KNOWLEDGE_PREVIEW_WIDTH - KNOWLEDGE_PREVIEW_GAP
      )
      const preferredTop = panelRect.top + 12
      const top = Math.round(
        Math.min(
          Math.max(preferredTop, KNOWLEDGE_PREVIEW_MIN_VIEWPORT_PADDING),
          window.innerHeight - 360
        )
      )
      const maxHeight = Math.max(
        280,
        window.innerHeight - top - KNOWLEDGE_PREVIEW_MIN_VIEWPORT_PADDING
      )
      const hasEnoughRoom =
        left >= KNOWLEDGE_PREVIEW_MIN_VIEWPORT_PADDING &&
        window.innerWidth >= 1280 &&
        maxHeight >= 320

      setPreviewPosition(
        hasEnoughRoom
          ? {
              left,
              top,
              width: KNOWLEDGE_PREVIEW_WIDTH,
              maxHeight,
            }
          : null
      )
    }

    updatePreviewPosition()

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updatePreviewPosition)
        : null

    if (resizeObserver) {
      if (panelRef.current) resizeObserver.observe(panelRef.current)
      if (articleListRef.current) resizeObserver.observe(articleListRef.current)
    }

    window.addEventListener("resize", updatePreviewPosition)
    window.addEventListener("scroll", updatePreviewPosition, true)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener("resize", updatePreviewPosition)
      window.removeEventListener("scroll", updatePreviewPosition, true)
    }
  }, [filteredArticles.length, selectedArticle])

  React.useEffect(() => {
    return () => {
      if (showPreviewTimeoutRef.current) {
        clearTimeout(showPreviewTimeoutRef.current)
      }
      if (hidePreviewTimeoutRef.current) {
        clearTimeout(hidePreviewTimeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (selectedArticle || !previewPosition) {
      if (showPreviewTimeoutRef.current) {
        clearTimeout(showPreviewTimeoutRef.current)
      }
      if (hidePreviewTimeoutRef.current) {
        clearTimeout(hidePreviewTimeoutRef.current)
      }
      setIsPreviewVisible(false)
      setHoveredArticleId(null)
    }
  }, [previewPosition, selectedArticle])

  React.useEffect(() => {
    if (!previewArticle) return
    const articleStillVisible = filteredArticles.some(
      (article) => article.id === previewArticle.id
    )
    if (!articleStillVisible) {
      setPreviewArticle(null)
      setIsPreviewVisible(false)
      setHoveredArticleId(null)
    }
  }, [filteredArticles, previewArticle])

  const handleArticleHoverStart = (article: KnowledgeArticle) => {
    if (!previewPosition || selectedArticle) return

    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current)
      hidePreviewTimeoutRef.current = null
    }

    setHoveredArticleId(article.id)

    if (isPreviewVisible) {
      setPreviewArticle(article)
      return
    }

    if (showPreviewTimeoutRef.current) {
      clearTimeout(showPreviewTimeoutRef.current)
    }

    showPreviewTimeoutRef.current = setTimeout(() => {
      setPreviewArticle(article)
      setIsPreviewVisible(true)
    }, KNOWLEDGE_PREVIEW_SHOW_DELAY_MS)
  }

  const schedulePreviewHide = () => {
    if (showPreviewTimeoutRef.current) {
      clearTimeout(showPreviewTimeoutRef.current)
      showPreviewTimeoutRef.current = null
    }
    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current)
    }

    hidePreviewTimeoutRef.current = setTimeout(() => {
      setIsPreviewVisible(false)
      setHoveredArticleId(null)
    }, KNOWLEDGE_PREVIEW_HIDE_DELAY_MS)
  }

  const handlePreviewPointerEnter = () => {
    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current)
      hidePreviewTimeoutRef.current = null
    }
  }

  const closeHoverPreview = () => {
    if (showPreviewTimeoutRef.current) {
      clearTimeout(showPreviewTimeoutRef.current)
      showPreviewTimeoutRef.current = null
    }
    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current)
      hidePreviewTimeoutRef.current = null
    }

    setIsPreviewVisible(false)
    setHoveredArticleId(null)
    setPreviewArticle(null)
  }

  const handleSuggestArticle = (article: KnowledgeArticle) => {
    closeHoverPreview()
    onInsertArticle(article)
  }

  if (selectedArticle) {
    return (
      <KnowledgeArticlePreview
        article={selectedArticle}
        onBack={() => setSelectedArticle(null)}
        onInsertArticle={onInsertArticle}
      />
    )
  }

  return (
    <div ref={panelRef} className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={articleQuery}
            onChange={(event) => setArticleQuery(event.target.value)}
            placeholder="Search articles..."
            className="h-11 rounded-xl border-border/70 bg-background pl-9 text-sm"
          />
        </div>
        <IconControl
          type="button"
          variant="default"
          size="icon-lg"
          className={cn(
            "size-11 shrink-0 rounded-xl",
            iconTooltips && "focus-visible:ring-2"
          )}
          onClick={onCreateArticle}
          aria-label="Create new article"
        >
          <IconPlus className="size-4" />
        </IconControl>
      </div>

      <KnowledgeArticleList
        iconTooltips={iconTooltips}
        ref={articleListRef}
        articles={filteredArticles}
        hoveredArticleId={hoveredArticleId}
        onArticleHoverEnd={schedulePreviewHide}
        onArticleHoverStart={handleArticleHoverStart}
        onInsertArticle={handleSuggestArticle}
        onPreviewArticle={setSelectedArticle}
        isSendingReply={isSendingReply}
      />

      <KnowledgeArticleHoverPreview
        article={previewArticle}
        isSendingReply={isSendingReply}
        isVisible={isPreviewVisible}
        onMouseEnter={handlePreviewPointerEnter}
        onMouseLeave={schedulePreviewHide}
        onOpenArticle={(article) => {
          setSelectedArticle(article)
          closeHoverPreview()
        }}
        onSuggestArticle={handleSuggestArticle}
        position={previewPosition}
      />
    </div>
  )
}

const KnowledgeArticleList = React.forwardRef<
  HTMLDivElement,
  {
    iconTooltips?: boolean
    articles: KnowledgeArticle[]
    hoveredArticleId: string | null
    isSendingReply: boolean
    onArticleHoverEnd: () => void
    onArticleHoverStart: (article: KnowledgeArticle) => void
    onInsertArticle: (article: KnowledgeArticle) => void
    onPreviewArticle: (article: KnowledgeArticle) => void
  }
>(function KnowledgeArticleList(
  {
    articles,
    hoveredArticleId,
    onPreviewArticle,
    onInsertArticle,
    onArticleHoverStart,
    onArticleHoverEnd,
    isSendingReply,
    iconTooltips = false,
  },
  ref
) {
  const IconControl = iconTooltips ? TooltipButton : Button
  if (articles.length === 0) {
    return (
      <section>
        <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          No matching articles.
        </div>
      </section>
    )
  }

  return (
    <section ref={ref}>
      <div className="space-y-1">
        {articles.map((article) => (
          <article
            key={article.id}
            className={cn(
              "rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-muted/50",
              hoveredArticleId === article.id && "bg-muted/45"
            )}
            onMouseEnter={() => onArticleHoverStart(article)}
            onMouseLeave={onArticleHoverEnd}
          >
            <div className="flex items-start gap-3">
              <div className="grid min-w-0 flex-1 grid-cols-[auto_1fr] items-start gap-x-3">
                <span className="pt-0.5 text-muted-foreground">
                  <IconFileText className="size-4" />
                </span>
                <div className="min-w-0 pr-1">
                  <button
                    type="button"
                    className="min-w-0 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    onClick={() => onPreviewArticle(article)}
                  >
                    <span className="block truncate text-sm leading-5 font-semibold text-foreground">
                      {article.title}
                    </span>
                    <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs">
                      <span className="truncate text-muted-foreground">
                        {getKnowledgeArticleCategoryLabel(article)}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="shrink-0 text-muted-foreground">
                        {article.updatedAt.replace("Updated ", "")}
                      </span>
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="mt-1 h-6 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => onInsertArticle(article)}
                    disabled={isSendingReply}
                  >
                    <IconPlus className="size-3.5" />
                    <span className="underline underline-offset-2">
                      {isSendingReply
                        ? "Sending article..."
                        : "Suggest article"}
                    </span>
                  </Button>
                </div>
              </div>
              <IconControl
                type="button"
                variant="ghost"
                size="icon-xs"
                className={cn(
                  "mt-0.5 shrink-0 text-muted-foreground",
                  iconTooltips && "rounded-xl focus-visible:ring-2"
                )}
                aria-label={`More actions for ${article.title}`}
              >
                <IconDots className="size-4" />
              </IconControl>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
})

function KnowledgeArticleHoverPreview({
  article,
  isVisible,
  position,
  isSendingReply,
  onSuggestArticle,
  onOpenArticle,
  onMouseEnter,
  onMouseLeave,
}: {
  article: KnowledgeArticle | null
  isVisible: boolean
  position: {
    left: number
    top: number
    width: number
    maxHeight: number
  } | null
  isSendingReply: boolean
  onSuggestArticle: (article: KnowledgeArticle) => void
  onOpenArticle: (article: KnowledgeArticle) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const contentSwapTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null)
  const fadeInFrameRef = React.useRef<number | null>(null)
  const [displayArticle, setDisplayArticle] =
    React.useState<KnowledgeArticle | null>(article)
  const [isContentVisible, setIsContentVisible] = React.useState(true)

  React.useEffect(() => {
    return () => {
      if (contentSwapTimeoutRef.current) {
        clearTimeout(contentSwapTimeoutRef.current)
      }
      if (fadeInFrameRef.current) {
        cancelAnimationFrame(fadeInFrameRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!article) return
    if (displayArticle?.id === article.id) return

    setIsContentVisible(false)

    if (contentSwapTimeoutRef.current) {
      clearTimeout(contentSwapTimeoutRef.current)
    }
    if (fadeInFrameRef.current) {
      cancelAnimationFrame(fadeInFrameRef.current)
    }

    contentSwapTimeoutRef.current = setTimeout(() => {
      setDisplayArticle(article)
      fadeInFrameRef.current = requestAnimationFrame(() => {
        setIsContentVisible(true)
      })
    }, 90)
  }, [article, displayArticle?.id])

  React.useEffect(() => {
    if (isVisible) {
      setIsContentVisible(true)
    }
  }, [isVisible])

  if (
    !article ||
    !position ||
    !displayArticle ||
    typeof document === "undefined"
  ) {
    return null
  }

  const previewImage = displayArticle.media?.find(
    (media) => media.type === "image"
  )

  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed z-50 hidden xl:block",
        isVisible && "pointer-events-auto"
      )}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: `${position.width}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={cn(
          "origin-right overflow-hidden rounded-[26px] border border-border bg-card/95 text-card-foreground shadow-2xl ring-1 ring-border/70 backdrop-blur-md transition-[opacity,transform] duration-180 ease-out dark:ring-border",
          isVisible
            ? "translate-x-0 scale-100 opacity-100"
            : "translate-x-2 scale-[0.985] opacity-0"
        )}
        style={{ maxHeight: `${position.maxHeight}px` }}
      >
        <div className="scrollbar-hidden overflow-y-auto p-4">
          <div
            className={cn(
              "transition-[opacity,transform] duration-180 ease-out",
              isContentVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0"
            )}
          >
            {previewImage?.src ? (
              <div className="overflow-hidden rounded-[20px] border border-border bg-muted/40">
                <Image
                  src={previewImage.src}
                  alt={previewImage.title}
                  width={672}
                  height={384}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            ) : null}

            <div className="space-y-4 pt-4 text-card-foreground">
              <div className="space-y-2">
                <h3 className="text-2xl leading-[1.15] font-semibold tracking-tight text-card-foreground">
                  {displayArticle.title}
                </h3>
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {displayArticle.summary}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 rounded-2xl px-3"
                  onClick={() => onSuggestArticle(displayArticle)}
                  disabled={isSendingReply}
                >
                  <IconPlus className="size-4" />
                  {isSendingReply ? "Sending..." : "Suggest article"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 rounded-2xl px-4"
                  onClick={() => onOpenArticle(displayArticle)}
                  disabled={isSendingReply}
                >
                  View article
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function KnowledgeArticlePreview({
  article,
  onBack,
  onInsertArticle,
}: {
  article: KnowledgeArticle
  onBack: () => void
  onInsertArticle: (article: KnowledgeArticle) => void
}) {
  const imageMedia =
    article.media?.filter((media) => media.type === "image") ?? []

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="ghost"
        className="h-8 rounded-xl px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={onBack}
      >
        <IconArrowLeft className="size-4" />
        Back
      </Button>

      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
          <IconFileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {article.title}
          </h3>
          <div className="mt-1 flex min-w-0 items-center gap-1 text-xs">
            <span className="truncate text-muted-foreground">
              {getKnowledgeArticleCategoryLabel(article)}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="shrink-0 text-muted-foreground">
              {article.updatedAt.replace("Updated ", "")}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <p className="text-sm leading-6 text-foreground/80">{article.summary}</p>

      {imageMedia.length ? (
        <div className="space-y-3">
          {imageMedia.map((media) => (
            <div
              key={media.title}
              className="overflow-hidden rounded bg-background"
            >
              {media.src ? (
                <Image
                  src={media.src}
                  alt={media.title}
                  width={720}
                  height={405}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="aspect-video bg-muted" />
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {article.quickPath ? (
          <div className="rounded-xl border bg-muted/30 p-3 text-sm leading-6">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
              Path
            </div>
            <div className="mt-1 text-foreground/85">{article.quickPath}</div>
          </div>
        ) : null}

        {article.sections.map((section, index) => {
          const isReply = section.title
            .toLowerCase()
            .includes("suggested customer reply")

          return (
            <section
              key={section.title}
              className="flex gap-3 text-sm leading-6"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-foreground">
                  {section.title}
                </h4>
                <p
                  className={cn(
                    "mt-1 text-foreground/75",
                    isReply &&
                      "rounded-xl border bg-muted/30 px-3 py-2 text-foreground/80"
                  )}
                >
                  {section.body}
                </p>
              </div>
            </section>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={() => onInsertArticle(article)}
        >
          <IconPlus className="size-4" />
          <span className="underline underline-offset-2">Suggest article</span>
        </Button>
        <Button type="button" variant="outline" className="h-10 rounded-xl">
          <IconCopy className="size-4" />
          Copy link
        </Button>
      </div>
    </div>
  )
}
