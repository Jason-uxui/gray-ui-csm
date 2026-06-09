"use client"

import * as React from "react"
import type { JSONContent } from "@tiptap/react"

import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import {
  isSuggestedReplyHeading,
  normalizeSafeArticleHref,
} from "@/lib/knowledge-base/content"
import type { KnowledgeArticle } from "@/lib/knowledge-base/types"
import { cn } from "@/lib/utils"

const articleHeadingLevels = [2, 3, 4, 5, 6] as const

type ArticleHeadingLevel = (typeof articleHeadingLevels)[number]

function normalizeHeadingLevel(level: unknown): ArticleHeadingLevel {
  if (articleHeadingLevels.includes(level as ArticleHeadingLevel)) {
    return level as ArticleHeadingLevel
  }

  return 2
}

function getHeadingTag(level: ArticleHeadingLevel) {
  return `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6"
}

function getHeadingClassName(level: ArticleHeadingLevel) {
  return cn(
    "leading-tight font-semibold tracking-tight text-foreground",
    level === 2 && "text-2xl",
    level === 3 && "text-xl",
    level === 4 && "text-lg",
    level === 5 && "text-base",
    level === 6 && "text-sm"
  )
}

function renderInlineNode(node: JSONContent, key: React.Key): React.ReactNode {
  const keyString = String(key)
  let content: React.ReactNode =
    node.text ??
    node.content?.map((child, index) =>
      renderInlineNode(child, `${keyString}-${index}`)
    )

  node.marks?.forEach((mark) => {
    if (mark.type === "bold") {
      content = <strong>{content}</strong>
    }
    if (mark.type === "italic") {
      content = <em>{content}</em>
    }
    if (mark.type === "underline") {
      content = <span className="underline underline-offset-4">{content}</span>
    }
    if (mark.type === "link") {
      const href = normalizeSafeArticleHref(mark.attrs?.href)
      content = href ? (
        <a
          href={href}
          className="font-medium text-primary underline underline-offset-4"
          rel="noreferrer"
        >
          {content}
        </a>
      ) : (
        <span className="font-medium text-foreground">{content}</span>
      )
    }
    if (mark.type === "code") {
      content = (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          {content}
        </code>
      )
    }
  })

  return <React.Fragment key={key}>{content}</React.Fragment>
}

function renderInlineContent(node: JSONContent, keyPrefix: string) {
  return node.content?.map((child, index) =>
    renderInlineNode(child, `${keyPrefix}-${index}`)
  )
}

function ArticleMedia({ article }: { article: KnowledgeArticle }) {
  const media = article.media?.[0]
  if (!media) return null

  if (media.type === "image" && media.src) {
    return (
      <div className="flex flex-col gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.src}
          alt={media.title}
          className="w-full object-cover"
        />
        {media.caption ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {media.caption}
          </p>
        ) : null}
      </div>
    )
  }

  if (media.type === "video") {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        {media.title} · {media.duration}
      </p>
    )
  }

  return null
}

export function KnowledgeArticleContentView({
  article,
  document,
  title,
  showMedia = true,
  showBodyHeading = true,
}: {
  article: KnowledgeArticle
  document: JSONContent
  title: string
  showMedia?: boolean
  showBodyHeading?: boolean
}) {
  const blocks = document.content ?? []
  const mediaInsertIndex = Math.min(3, Math.max(blocks.length - 1, 0))

  return (
    <div className="flex flex-col gap-6 text-base leading-8 text-foreground/80">
      {showBodyHeading ? (
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      ) : null}

      {blocks.map((block, index) => {
        const key = `${article.id}-${block.type ?? "block"}-${index}`
        const isReply = isSuggestedReplyHeading(block)

        if (block.type === "heading") {
          const level = normalizeHeadingLevel(block.attrs?.level)
          const HeadingTag = getHeadingTag(level)

          return (
            <HeadingTag key={key} className={getHeadingClassName(level)}>
              {isReply
                ? knowledgeBasePageCopy.bodyCustomerReplyTitle
                : renderInlineContent(block, key)}
            </HeadingTag>
          )
        }

        if (block.type === "horizontalRule") {
          return <hr key={key} className="border-border" />
        }

        if (block.type === "blockquote") {
          return (
            <div
              key={key}
              className="rounded-xl bg-card px-5 py-4"
            >
              <div className="border-l-2 border-border pl-5 text-base leading-8 text-muted-foreground">
                <div className="min-w-0 font-medium tracking-tight text-foreground/80">
                  {block.content?.map((child, childIndex) =>
                    renderInlineContent(child, `${key}-${childIndex}`)
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (block.type === "bulletList" || block.type === "orderedList") {
          const ListTag = block.type === "orderedList" ? "ol" : "ul"

          return (
            <ListTag
              key={key}
              className={cn(
                "flex list-inside flex-col gap-2 text-base leading-7 text-foreground/78",
                block.type === "orderedList" ? "list-decimal" : "list-disc"
              )}
            >
              {block.content?.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>
                  {item.content?.map((child, childIndex) =>
                    renderInlineContent(
                      child,
                      `${key}-${itemIndex}-${childIndex}`
                    )
                  )}
                </li>
              ))}
            </ListTag>
          )
        }

        const blockContent = renderInlineContent(block, key)

        return (
          <React.Fragment key={key}>
            <p
              className={cn(
                "text-base leading-8 text-foreground/78",
                isReply &&
                  "rounded-2xl border bg-muted/40 px-5 py-4 text-base leading-8 text-foreground/85"
              )}
            >
              {blockContent}
            </p>
            {showMedia &&
            article.media?.length &&
            index === mediaInsertIndex ? (
              <ArticleMedia article={article} />
            ) : null}
          </React.Fragment>
        )
      })}
    </div>
  )
}
