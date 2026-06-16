"use client"

import * as React from "react"
import {
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
} from "@tabler/icons-react"

import {
  DiscussionComposerShell,
  DiscussionMessageEntry,
  DiscussionThreadContent,
} from "@/components/detail-tabs/shared-discussion-tab-content"
import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/current-user"
import type {
  KnowledgeArticle,
  KnowledgeArticleComment,
} from "@/lib/knowledge-base/types"

function createLocalComment(
  article: KnowledgeArticle,
  body: string
): KnowledgeArticleComment {
  return {
    id: `${article.id}-comment-${Date.now()}`,
    articleId: article.id,
    author: {
      name: currentUser.name,
      avatarUrl: currentUser.avatar,
      email: currentUser.email,
    },
    timestamp: "Just now",
    body,
    badge: "Comment",
    status: "open",
  }
}

function KnowledgeArticleCommentsEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed bg-card/50 p-6">
      <h2 className="text-xl font-semibold tracking-tight">
        {knowledgeBasePageCopy.commentsEmptyTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {knowledgeBasePageCopy.commentsEmptyDescription}
      </p>
    </div>
  )
}

export function KnowledgeArticleComments({
  article,
  onCommentsChange,
}: {
  article: KnowledgeArticle
  onCommentsChange?: (comments: KnowledgeArticleComment[]) => void
}) {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const bottomAnchorRef = React.useRef<HTMLDivElement | null>(null)
  const [comments, setComments] = React.useState<KnowledgeArticleComment[]>(
    () => article.comments ?? []
  )
  const [draftComment, setDraftComment] = React.useState("")

  React.useEffect(() => {
    setComments(article.comments ?? [])
    setDraftComment("")
  }, [article.id, article.comments])

  React.useEffect(() => {
    const bottomAnchor = bottomAnchorRef.current
    if (!bottomAnchor) return

    const frameId = window.requestAnimationFrame(() => {
      bottomAnchor.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [comments.length])

  const handleSubmitComment = () => {
    const nextBody = draftComment.trim()
    if (!nextBody) return

    const nextComments = [...comments, createLocalComment(article, nextBody)]
    setComments(nextComments)
    onCommentsChange?.(nextComments)
    setDraftComment("")
  }

  const composerUser = {
    name: currentUser.name,
    avatarUrl: currentUser.avatar,
    email: currentUser.email,
  }

  return (
    <DiscussionThreadContent
      scrollContainerRef={scrollContainerRef}
      bottomAnchorRef={bottomAnchorRef}
      threadClassName="mx-auto w-full max-w-3xl"
      composer={
        <DiscussionComposerShell
          currentUser={composerUser}
          contentClassName="mx-auto w-full max-w-3xl"
        >
          <textarea
            value={draftComment}
            onChange={(event) => setDraftComment(event.target.value)}
            placeholder={knowledgeBasePageCopy.commentsComposerPlaceholder}
            className="min-h-40 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <div className="border-t px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground"
                >
                  <span className="text-base font-medium">T</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground"
                >
                  <IconMoodSmile className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground"
                >
                  <IconPaperclip className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground"
                >
                  <IconPhoto className="size-4" />
                </Button>
              </div>

              <Button
                type="button"
                className="h-9 rounded-xl px-4"
                onClick={handleSubmitComment}
                disabled={!draftComment.trim()}
              >
                {knowledgeBasePageCopy.commentsComposerSubmitLabel}
              </Button>
            </div>
          </div>
        </DiscussionComposerShell>
      }
    >
      {comments.length > 0 ? (
        comments.map((comment) => (
          <DiscussionMessageEntry
            key={comment.id}
            author={comment.author}
            timestamp={comment.timestamp}
            body={comment.body}
            badges={
              <>
                {comment.badge ? (
                  <Badge
                    variant="outline"
                    className="h-5 rounded-full px-2 text-[11px]"
                  >
                    {comment.badge}
                  </Badge>
                ) : null}
                {comment.status === "resolved" ? (
                  <Badge
                    variant="secondary"
                    className="h-5 rounded-full px-2 text-[11px]"
                  >
                    Resolved
                  </Badge>
                ) : null}
              </>
            }
          />
        ))
      ) : (
        <KnowledgeArticleCommentsEmptyState />
      )}
    </DiscussionThreadContent>
  )
}
