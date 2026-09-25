"use client"

import * as React from "react"
import {
  IconCheck,
  IconLink,
  IconThumbDown,
  IconThumbUp,
  IconX,
} from "@tabler/icons-react"

import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import { KnowledgeArticlePersonRow } from "@/components/knowledge-base/knowledge-article-person"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type {
  KnowledgeArticleDetails,
  KnowledgeArticleDisplayPermission,
} from "@/lib/knowledge-base/types"
import { cn } from "@/lib/utils"

const displayPermissionOptions: Array<{
  value: KnowledgeArticleDisplayPermission
  label: string
}> = [
  {
    value: "public",
    label: knowledgeBasePageCopy.permissionPublicLabel,
  },
  {
    value: "agent-only",
    label: knowledgeBasePageCopy.permissionAgentOnlyLabel,
  },
  {
    value: "private",
    label: knowledgeBasePageCopy.permissionPrivateLabel,
  },
]

const multilineFieldClassName =
  "min-h-24 w-full resize-y rounded-[12px] border border-[color:var(--input-border)] bg-muted px-3 py-2 text-sm shadow-raised-control outline-none placeholder:text-muted-foreground focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/35"

type KnowledgeArticleDetailsPanelProps = {
  articleId: string
  details: KnowledgeArticleDetails
  editable: boolean
  categoryOptions: string[]
  onChange: (details: KnowledgeArticleDetails) => void
}

function getPermissionLabel(permission: KnowledgeArticleDisplayPermission) {
  return (
    displayPermissionOptions.find((option) => option.value === permission)
      ?.label ?? knowledgeBasePageCopy.permissionPrivateLabel
  )
}

function formatPublicLinkDisplay(publicLink: string) {
  return publicLink.replace(/^https?:\/\//, "")
}

function formatExpiryLabel(expiresAt: string) {
  if (!expiresAt) return knowledgeBasePageCopy.expiryEmptyLabel

  const parsed = new Date(`${expiresAt}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return expiresAt

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function DetailField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}

function KnowledgeArticleDetailsReadView({
  details,
}: {
  details: KnowledgeArticleDetails
}) {
  const [linkCopied, setLinkCopied] = React.useState(false)

  React.useEffect(() => {
    if (!linkCopied) return

    const timeoutId = window.setTimeout(() => {
      setLinkCopied(false)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [linkCopied])

  const handleCopyPublicLink = async () => {
    if (!details.publicLink) return

    try {
      await navigator.clipboard.writeText(details.publicLink)
      setLinkCopied(true)
    } catch {
      setLinkCopied(false)
    }
  }

  return (
    <dl className="flex flex-col gap-5">
      <DetailField label={knowledgeBasePageCopy.displayPermissionLabel}>
        <Badge variant="outline" className="h-6 rounded-full px-2">
          {getPermissionLabel(details.displayPermission)}
        </Badge>
      </DetailField>
      <DetailField label={knowledgeBasePageCopy.pageCategoryLabel}>
        {details.pageCategory || knowledgeBasePageCopy.pageCategoryEmptyLabel}
      </DetailField>
      <DetailField label={knowledgeBasePageCopy.tagsLabel}>
        {details.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {details.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="h-6 rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          knowledgeBasePageCopy.tagsEmptyLabel
        )}
      </DetailField>
      <DetailField label={knowledgeBasePageCopy.publicLinkLabel}>
        {details.publicLink ? (
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full min-w-0 shrink justify-start gap-1.5 px-0 font-normal text-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
            title={details.publicLink}
            aria-label={
              linkCopied
                ? knowledgeBasePageCopy.articleLinkCopiedLabel
                : knowledgeBasePageCopy.articleCopyLinkLabel
            }
            onClick={() => void handleCopyPublicLink()}
          >
            <span className="min-w-0 truncate">
              {formatPublicLinkDisplay(details.publicLink)}
            </span>
            {linkCopied ? (
              <IconCheck className="size-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <IconLink className="size-3.5 shrink-0 text-muted-foreground" />
            )}
          </Button>
        ) : (
          knowledgeBasePageCopy.publicLinkEmptyLabel
        )}
      </DetailField>
      <DetailField label={knowledgeBasePageCopy.expiryLabel}>
        {formatExpiryLabel(details.expiresAt)}
      </DetailField>
      <DetailField label={knowledgeBasePageCopy.creatorLabel}>
        <KnowledgeArticlePersonRow person={details.creator} />
      </DetailField>
      <DetailField label={knowledgeBasePageCopy.agentsWithAccessLabel}>
        {details.agentsWithAccess.length > 0 ? (
          <div className="flex flex-col gap-2">
            {details.agentsWithAccess.map((person) => (
              <KnowledgeArticlePersonRow key={person.name} person={person} />
            ))}
          </div>
        ) : (
          knowledgeBasePageCopy.agentsEmptyLabel
        )}
      </DetailField>
      <DetailField label={knowledgeBasePageCopy.userFeedbackLabel}>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2">
            <IconThumbUp className="size-4 text-muted-foreground" />
            <span>
              {details.feedback.helpful}{" "}
              {knowledgeBasePageCopy.feedbackHelpfulLabel}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <IconThumbDown className="size-4 text-muted-foreground" />
            <span>
              {details.feedback.notHelpful}{" "}
              {knowledgeBasePageCopy.feedbackNotHelpfulLabel}
            </span>
          </p>
        </div>
      </DetailField>
    </dl>
  )
}

function KnowledgeArticleDetailsEditView({
  articleId,
  details,
  categoryOptions,
  onChange,
}: {
  articleId: string
  details: KnowledgeArticleDetails
  categoryOptions: string[]
  onChange: (details: KnowledgeArticleDetails) => void
}) {
  const [tagDraft, setTagDraft] = React.useState("")
  const categoryChoices = React.useMemo(() => {
    if (!details.pageCategory || categoryOptions.includes(details.pageCategory)) {
      return categoryOptions
    }

    return [details.pageCategory, ...categoryOptions]
  }, [categoryOptions, details.pageCategory])

  React.useEffect(() => {
    setTagDraft("")
  }, [articleId])

  const updateDetails = (patch: Partial<KnowledgeArticleDetails>) => {
    onChange({ ...details, ...patch })
  }

  const commitTag = (value: string) => {
    const nextTag = value.trim().replace(/,$/, "")
    if (!nextTag) {
      setTagDraft("")
      return
    }

    const alreadyAdded = details.tags.some(
      (tag) => tag.toLowerCase() === nextTag.toLowerCase()
    )
    if (!alreadyAdded) {
      updateDetails({ tags: [...details.tags, nextTag] })
    }
    setTagDraft("")
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`article-category-${articleId}`}>
          {knowledgeBasePageCopy.pageCategoryLabel}
        </Label>
        <select
          id={`article-category-${articleId}`}
          value={details.pageCategory}
          onChange={(event) =>
            updateDetails({ pageCategory: event.target.value })
          }
          className="h-9 w-full rounded-[12px] border border-[color:var(--input-border)] bg-muted px-3 text-sm shadow-raised-control outline-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          {details.pageCategory ? null : (
            <option value="">{knowledgeBasePageCopy.pageCategoryLabel}</option>
          )}
          {categoryChoices.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label id={`article-permission-${articleId}`}>
          {knowledgeBasePageCopy.displayPermissionLabel}
        </Label>
        <div
          role="radiogroup"
          aria-labelledby={`article-permission-${articleId}`}
          className="grid grid-cols-3 gap-1"
        >
          {displayPermissionOptions.map((option) => {
            const selected = details.displayPermission === option.value

            return (
              <Button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                variant={selected ? "secondary" : "outline"}
                size="sm"
                className={cn("rounded-xl px-2", selected && "shadow-none")}
                onClick={() =>
                  updateDetails({ displayPermission: option.value })
                }
              >
                {option.label}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={`article-expiry-${articleId}`}>
            {knowledgeBasePageCopy.expiryLabel}
          </Label>
          {details.expiresAt ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => updateDetails({ expiresAt: "" })}
            >
              {knowledgeBasePageCopy.clearExpiryLabel}
            </Button>
          ) : null}
        </div>
        <Input
          id={`article-expiry-${articleId}`}
          type="date"
          value={details.expiresAt}
          onChange={(event) => updateDetails({ expiresAt: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`article-tags-${articleId}`}>
          {knowledgeBasePageCopy.tagsLabel}
        </Label>
        {details.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {details.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="h-6 gap-1 rounded-full pr-1"
              >
                {tag}
                <button
                  type="button"
                  className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label={`${knowledgeBasePageCopy.tagsRemoveLabel} ${tag}`}
                  onClick={() =>
                    updateDetails({
                      tags: details.tags.filter((currentTag) => currentTag !== tag),
                    })
                  }
                >
                  <IconX className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
        <Input
          id={`article-tags-${articleId}`}
          value={tagDraft}
          placeholder={knowledgeBasePageCopy.tagsPlaceholder}
          onChange={(event) => setTagDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault()
              commitTag(tagDraft)
              return
            }

            if (event.key === "Backspace" && !tagDraft && details.tags.length > 0) {
              updateDetails({ tags: details.tags.slice(0, -1) })
            }
          }}
          onBlur={() => {
            if (tagDraft.trim()) commitTag(tagDraft)
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`article-link-${articleId}`}>
          {knowledgeBasePageCopy.publicLinkLabel}
        </Label>
        <Input
          id={`article-link-${articleId}`}
          value={details.publicLink}
          placeholder={knowledgeBasePageCopy.publicLinkPlaceholder}
          onChange={(event) => updateDetails({ publicLink: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-4 border-t pt-5">
        <p className="text-sm font-medium">{knowledgeBasePageCopy.seoSectionLabel}</p>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`article-meta-title-${articleId}`}>
            {knowledgeBasePageCopy.metaTitleLabel}
          </Label>
          <Input
            id={`article-meta-title-${articleId}`}
            value={details.seo.metaTitle}
            placeholder={knowledgeBasePageCopy.metaTitlePlaceholder}
            onChange={(event) =>
              updateDetails({
                seo: { ...details.seo, metaTitle: event.target.value },
              })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`article-meta-keywords-${articleId}`}>
            {knowledgeBasePageCopy.metaKeywordsLabel}
          </Label>
          <Input
            id={`article-meta-keywords-${articleId}`}
            value={details.seo.metaKeywords}
            placeholder={knowledgeBasePageCopy.metaKeywordsPlaceholder}
            onChange={(event) =>
              updateDetails({
                seo: { ...details.seo, metaKeywords: event.target.value },
              })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`article-meta-description-${articleId}`}>
            {knowledgeBasePageCopy.metaDescriptionLabel}
          </Label>
          <textarea
            id={`article-meta-description-${articleId}`}
            value={details.seo.metaDescription}
            placeholder={knowledgeBasePageCopy.metaDescriptionPlaceholder}
            className={multilineFieldClassName}
            onChange={(event) =>
              updateDetails({
                seo: { ...details.seo, metaDescription: event.target.value },
              })
            }
          />
        </div>
      </div>
    </div>
  )
}

export function KnowledgeArticleDetailsPanel({
  articleId,
  details,
  editable,
  categoryOptions,
  onChange,
}: KnowledgeArticleDetailsPanelProps) {
  if (!editable) {
    return <KnowledgeArticleDetailsReadView details={details} />
  }

  return (
    <KnowledgeArticleDetailsEditView
      articleId={articleId}
      details={details}
      categoryOptions={categoryOptions}
      onChange={onChange}
    />
  )
}
