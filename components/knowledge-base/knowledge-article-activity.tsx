"use client"

import type { ActivityTimelineItem } from "@/components/activity/activity-timeline"
import { SharedActivityTabContent } from "@/components/detail-tabs/shared-activity-notes-tab-content"
import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import type {
  KnowledgeArticle,
  KnowledgeArticleActivity,
} from "@/lib/knowledge-base/types"

function mapArticleActivityToTimelineItem(
  item: KnowledgeArticleActivity
): ActivityTimelineItem {
  return {
    id: item.id,
    title: item.title,
    detail: item.detail,
    timestamp: item.timestamp,
    tone: "neutral",
  }
}

export function KnowledgeArticleActivityTab({
  article,
}: {
  article: KnowledgeArticle
}) {
  const items = (article.activity ?? []).map(mapArticleActivityToTimelineItem)

  return (
    <SharedActivityTabContent
      items={items}
      emptyMessage={knowledgeBasePageCopy.activityEmptyDescription}
      contentClassName="mx-auto w-full max-w-3xl"
    />
  )
}
