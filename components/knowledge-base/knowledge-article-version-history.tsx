"use client"

import * as React from "react"
import { IconChevronDown } from "@tabler/icons-react"

import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import { KnowledgeArticlePersonRow } from "@/components/knowledge-base/knowledge-article-person"
import { groupKnowledgeArticleVersions } from "@/lib/knowledge-base/article-details"
import type { KnowledgeArticleVersion } from "@/lib/knowledge-base/types"
import { cn } from "@/lib/utils"

const versionHistoryActionClassName =
  "outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/35 active:bg-secondary"

type KnowledgeArticleVersionHistoryProps = {
  versions: KnowledgeArticleVersion[]
}

function VersionRow({
  version,
  selected,
  onSelect,
}: {
  version: KnowledgeArticleVersion
  selected: boolean
  onSelect: (versionId: string) => void
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg px-3 py-2.5 text-left",
        versionHistoryActionClassName,
        selected && "bg-secondary"
      )}
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(version.id)}
    >
      <span className="text-sm font-medium">{version.timestampLabel}</span>
      <div className="flex flex-col gap-1">
        {version.contributors.map((person) => (
          <KnowledgeArticlePersonRow
            key={`${version.id}-${person.name}`}
            person={person}
            nameClassName="text-sm text-muted-foreground"
          />
        ))}
      </div>
    </button>
  )
}

export function KnowledgeArticleVersionHistory({
  versions,
}: KnowledgeArticleVersionHistoryProps) {
  const versionKey = versions.map((version) => version.id).join("\n")
  const firstVersionId = versions[0]?.id ?? ""
  const [collapsedGroupLabels, setCollapsedGroupLabels] = React.useState<
    string[]
  >([])
  const [selectedVersionId, setSelectedVersionId] =
    React.useState(firstVersionId)

  React.useEffect(() => {
    setCollapsedGroupLabels([])
    setSelectedVersionId(firstVersionId)
  }, [versionKey, firstVersionId])

  if (versions.length === 0) {
    return (
      <div className="flex flex-col gap-1 px-2 py-4">
        <p className="text-sm font-medium">
          {knowledgeBasePageCopy.versionHistoryEmptyTitle}
        </p>
        <p className="text-sm text-muted-foreground">
          {knowledgeBasePageCopy.versionHistoryEmptyDescription}
        </p>
      </div>
    )
  }

  const currentVersion = versions[0]
  const groups = groupKnowledgeArticleVersions(versions)
    .map((group) => ({
      ...group,
      versions: group.versions.filter((version) => version.id !== currentVersion.id),
    }))
    .filter((group) => group.versions.length > 0)

  const toggleGroup = (label: string) => {
    setCollapsedGroupLabels((currentLabels) =>
      currentLabels.includes(label)
        ? currentLabels.filter((item) => item !== label)
        : [...currentLabels, label]
    )
  }

  return (
    <div className="relative flex flex-col">
      <div
        aria-hidden
        className="absolute top-3 bottom-3 left-2 z-10 w-px -translate-x-1/2 bg-border"
      />
      <div className="relative z-10 flex items-center gap-2 py-1.5">
        <span className="relative z-20 flex size-4 shrink-0 items-center justify-center rounded-full bg-background">
          <span className="size-2 rounded-full bg-foreground" />
        </span>
        <span className="text-sm font-medium">
          {knowledgeBasePageCopy.versionHistoryCurrentLabel}
        </span>
      </div>
      <div className="pl-6">
        <VersionRow
          version={currentVersion}
          selected={selectedVersionId === currentVersion.id}
          onSelect={setSelectedVersionId}
        />
      </div>
      {groups.map((group) => {
        const isOpen = !collapsedGroupLabels.includes(group.label)

        return (
          <section key={group.label} className="flex flex-col">
            <button
              type="button"
              className={cn(
                "relative z-10 flex h-8 w-full items-center gap-2 rounded-lg text-sm text-muted-foreground",
                versionHistoryActionClassName
              )}
              aria-expanded={isOpen}
              aria-label={`${
                isOpen
                  ? knowledgeBasePageCopy.versionHistoryCollapseGroupLabel
                  : knowledgeBasePageCopy.versionHistoryExpandGroupLabel
              } ${group.label}`}
              onClick={() => toggleGroup(group.label)}
            >
              <span className="relative z-20 flex size-4 shrink-0 items-center justify-center rounded-full bg-background">
                <IconChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    !isOpen && "-rotate-90"
                  )}
                />
              </span>
              <span className="min-w-0 truncate">{group.label}</span>
            </button>
            {isOpen ? (
              <ol className="flex flex-col gap-2 pl-6">
                {group.versions.map((version) => (
                  <li key={version.id}>
                    <VersionRow
                      version={version}
                      selected={selectedVersionId === version.id}
                      onSelect={setSelectedVersionId}
                    />
                  </li>
                ))}
              </ol>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
