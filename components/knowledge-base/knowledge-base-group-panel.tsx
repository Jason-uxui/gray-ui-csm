"use client"

import * as React from "react"
import {
  IconBook2,
  IconChevronsLeft,
  IconChevronsRight,
  IconCreditCard,
  IconFileText,
  IconPlug,
  IconPlus,
  IconSearch,
  IconShieldLock,
  IconTool,
  IconUsers,
} from "@tabler/icons-react"

import { knowledgeBasePageCopy } from "@/components/knowledge-base/knowledge-base-page.copy"
import { filterGroupArticlesBySearch } from "@/lib/knowledge-base/articles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type {
  KnowledgeArticleGroupIcon,
  KnowledgeArticleResolvedGroup,
} from "@/lib/knowledge-base/types"
import { cn } from "@/lib/utils"

type KnowledgeBaseGroupPanelProps = {
  groups: KnowledgeArticleResolvedGroup[]
  activeGroupId: string | null
  selectedArticleId: string | null
  searchValue: string
  onSearchChange: (value: string) => void
  isPanelOpen: boolean
  onTogglePanel: () => void
  onSelectGroup: (groupId: string) => void
  onSelectArticle: (articleId: string) => void
  onCreateGroup: (group: {
    label: string
    icon: KnowledgeArticleGroupIcon
  }) => void
  onCreateArticle: () => void
}

type GroupIconOption = {
  value: KnowledgeArticleGroupIcon
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const groupIconOptions: GroupIconOption[] = [
  { value: "book", label: "Book", icon: IconBook2 },
  { value: "credit-card", label: "Billing", icon: IconCreditCard },
  { value: "shield", label: "Security", icon: IconShieldLock },
  { value: "tool", label: "Troubleshooting", icon: IconTool },
  { value: "plug", label: "Integrations", icon: IconPlug },
  { value: "users", label: "Users", icon: IconUsers },
]

const groupIconByValue = Object.fromEntries(
  groupIconOptions.map((option) => [option.value, option.icon])
) as Record<KnowledgeArticleGroupIcon, GroupIconOption["icon"]>

const LABEL_SCROLL_DELAY_MS = 1000
const LABEL_SCROLL_GAP_PX = 24
const LABEL_SCROLL_SPEED_PX_PER_S = 20

function getGroupIcon(icon: KnowledgeArticleGroupIcon) {
  return groupIconByValue[icon] ?? IconBook2
}

function KnowledgeGroupIcon({
  icon,
  className,
}: {
  icon: KnowledgeArticleGroupIcon
  className?: string
}) {
  if (icon === "credit-card") return <IconCreditCard className={className} />
  if (icon === "shield") return <IconShieldLock className={className} />
  if (icon === "tool") return <IconTool className={className} />
  if (icon === "plug") return <IconPlug className={className} />
  if (icon === "users") return <IconUsers className={className} />
  return <IconBook2 className={className} />
}

function KnowledgeScrollingLabel({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  const containerRef = React.useRef<HTMLSpanElement | null>(null)
  const textRef = React.useRef<HTMLSpanElement | null>(null)
  const hoverTimeoutRef = React.useRef<number | null>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)
  const [isScrolling, setIsScrolling] = React.useState(false)
  const [scrollDistance, setScrollDistance] = React.useState(0)
  const [animationDuration, setAnimationDuration] = React.useState(0)

  React.useEffect(() => {
    const updateOverflowState = () => {
      const container = containerRef.current
      const text = textRef.current
      if (!container || !text) return

      const nextDistance = Math.max(0, text.scrollWidth - container.clientWidth)
      setIsTruncated(nextDistance > 0)
      setScrollDistance(nextDistance)
      setAnimationDuration(nextDistance / LABEL_SCROLL_SPEED_PX_PER_S)

      if (nextDistance <= 0) {
        setIsScrolling(false)
      }
    }

    updateOverflowState()

    if (typeof ResizeObserver === "undefined") return

    const resizeObserver = new ResizeObserver(updateOverflowState)
    if (containerRef.current) resizeObserver.observe(containerRef.current)
    if (textRef.current) resizeObserver.observe(textRef.current)

    return () => resizeObserver.disconnect()
  }, [children])

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) {
        window.clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const handlePointerEnter = () => {
    if (!isTruncated || typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current)
    }

    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(true)
      hoverTimeoutRef.current = null
    }, LABEL_SCROLL_DELAY_MS)
  }

  const handlePointerLeave = () => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    setIsScrolling(false)
  }

  return (
    <span
      ref={containerRef}
      className={cn("relative min-w-0 overflow-hidden", className)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <span
        ref={textRef}
        className={cn(
          "block whitespace-nowrap",
          isScrolling ? "overflow-visible" : "truncate"
        )}
        style={
          isScrolling && scrollDistance > 0
            ? {
                transform: `translateX(calc(-${scrollDistance}px - ${LABEL_SCROLL_GAP_PX}px))`,
                transition: `transform ${animationDuration}s linear`,
                willChange: "transform",
              }
            : undefined
        }
      >
        {children}
      </span>
    </span>
  )
}

export function KnowledgeBaseGroupPanel({
  groups,
  activeGroupId,
  selectedArticleId,
  searchValue,
  onSearchChange,
  isPanelOpen,
  onTogglePanel,
  onSelectGroup,
  onSelectArticle,
  onCreateGroup,
  onCreateArticle,
}: KnowledgeBaseGroupPanelProps) {
  const [isCreatingGroup, setIsCreatingGroup] = React.useState(false)
  const [groupName, setGroupName] = React.useState("")
  const [groupIcon, setGroupIcon] =
    React.useState<KnowledgeArticleGroupIcon>("book")
  const [showNameError, setShowNameError] = React.useState(false)

  const activeGroup =
    groups.find((group) => group.id === activeGroupId) ?? groups[0] ?? null
  const visibleArticles = React.useMemo(() => {
    if (!activeGroup) return []

    return filterGroupArticlesBySearch({
      articles: activeGroup.articles,
      query: searchValue,
      selectedArticleId,
    })
  }, [activeGroup, searchValue, selectedArticleId])
  const canCreateArticle = Boolean(activeGroupId)
  const selectedGroupIconOption = groupIconOptions.find(
    (option) => option.value === groupIcon
  )

  const resetCreateForm = () => {
    setGroupName("")
    setGroupIcon("book")
    setShowNameError(false)
  }

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = groupName.trim()
    if (!trimmedName) {
      setShowNameError(true)
      return
    }

    onCreateGroup({
      label: trimmedName,
      icon: groupIcon,
    })
    resetCreateForm()
    setIsCreatingGroup(false)
  }

  const handleCancelCreate = () => {
    resetCreateForm()
    setIsCreatingGroup(false)
  }

  return (
    <aside className="min-h-0 border-r text-card-foreground">
      <TooltipProvider>
        <div className="flex h-full min-h-0 overflow-hidden">
          <div className="flex w-13 shrink-0 flex-col items-center gap-2 border-r p-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-9 rounded-xl"
                    onClick={onTogglePanel}
                    aria-label={
                      isPanelOpen
                        ? knowledgeBasePageCopy.collapseGroupsLabel
                        : knowledgeBasePageCopy.expandGroupsLabel
                    }
                  />
                }
              >
                {isPanelOpen ? (
                  <IconChevronsLeft className="size-4" />
                ) : (
                  <IconChevronsRight className="size-4" />
                )}
              </TooltipTrigger>
              <TooltipContent side="right">
                {isPanelOpen
                  ? knowledgeBasePageCopy.collapseGroupsLabel
                  : knowledgeBasePageCopy.expandGroupsLabel}
              </TooltipContent>
            </Tooltip>

            <div className="flex min-h-0 flex-col items-center gap-1 overflow-y-auto">
              {groups.map((group) => {
                const GroupIcon = getGroupIcon(group.icon)
                const isActive = activeGroup?.id === group.id

                return (
                  <Tooltip key={group.id}>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant={isActive ? "secondary" : "ghost"}
                          size="icon-sm"
                          className="size-9 rounded-xl"
                          aria-label={group.label}
                          aria-pressed={isActive}
                          onClick={() => onSelectGroup(group.id)}
                        />
                      }
                    >
                      <GroupIcon className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent side="right">{group.label}</TooltipContent>
                  </Tooltip>
                )
              })}

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant={isCreatingGroup ? "secondary" : "ghost"}
                      size="icon-sm"
                      className="size-9 rounded-xl"
                      aria-label={knowledgeBasePageCopy.createGroupLabel}
                      onClick={() => {
                        setIsCreatingGroup((isCreating) => !isCreating)
                        if (!isPanelOpen) onTogglePanel()
                      }}
                    />
                  }
                >
                  <IconPlus className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  {knowledgeBasePageCopy.createGroupLabel}
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="min-h-0 flex-1" />
          </div>

          {isPanelOpen ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex min-h-14 min-w-0 shrink-0 items-center gap-2 overflow-hidden px-6 py-3.5">
                <KnowledgeScrollingLabel className="flex-1 text-sm font-semibold text-foreground">
                  {activeGroup?.label ?? knowledgeBasePageCopy.groupPanelLabel}
                </KnowledgeScrollingLabel>
                {activeGroup ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activeGroup.articles.length}
                  </span>
                ) : null}
              </div>

              <div className="px-3 pb-2">
                <div className="relative rounded-lg focus-within:ring-2 focus-within:ring-ring/45 focus-within:ring-offset-1 focus-within:ring-offset-background">
                  <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={knowledgeBasePageCopy.searchPlaceholder}
                    className="h-9 rounded-lg border-0 bg-transparent px-3 pl-9 shadow-none hover:bg-transparent focus-visible:border-transparent focus-visible:bg-transparent focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="scrollbar-hidden min-h-0 min-w-0 flex-1 overflow-y-auto px-3 pb-3">
                {isCreatingGroup ? (
                  <form
                    className="mb-2 border-b px-1 py-3"
                    onSubmit={handleCreateSubmit}
                  >
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="knowledge-base-group-name">
                          {knowledgeBasePageCopy.createGroupNameLabel}
                        </Label>
                        <Input
                          id="knowledge-base-group-name"
                          value={groupName}
                          onChange={(event) => {
                            setGroupName(event.target.value)
                            setShowNameError(false)
                          }}
                          placeholder={
                            knowledgeBasePageCopy.createGroupNamePlaceholder
                          }
                          aria-invalid={showNameError}
                        />
                        {showNameError ? (
                          <p className="text-xs text-destructive">
                            {knowledgeBasePageCopy.createGroupEmptyNameLabel}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-1.5">
                        <Label>
                          {knowledgeBasePageCopy.createGroupIconLabel}
                        </Label>
                        <Select
                          value={groupIcon}
                          onValueChange={(nextIcon) =>
                            setGroupIcon(nextIcon as KnowledgeArticleGroupIcon)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <KnowledgeGroupIcon
                              icon={groupIcon}
                              className="size-4"
                            />
                            <SelectValue>
                              {selectedGroupIconOption?.label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {groupIconOptions.map((option) => {
                                const OptionIcon = option.icon

                                return (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    <OptionIcon className="size-4" />
                                    {option.label}
                                  </SelectItem>
                                )
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl"
                          onClick={handleCancelCreate}
                        >
                          {knowledgeBasePageCopy.createGroupCancelLabel}
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="h-8 rounded-xl"
                        >
                          {knowledgeBasePageCopy.createGroupSubmitLabel}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : null}

                {activeGroup && visibleArticles.length > 0 ? (
                  <div className="min-w-0 space-y-1">
                    {visibleArticles.map((article) => {
                      const isActive = selectedArticleId === article.id

                      return (
                        <Button
                          key={article.id}
                          type="button"
                          variant={isActive ? "secondary" : "ghost"}
                          className="h-10 w-full min-w-0 justify-start gap-2.5 overflow-hidden rounded-xl px-3.5 text-left whitespace-normal"
                          aria-pressed={isActive}
                          onClick={() => onSelectArticle(article.id)}
                        >
                          <IconFileText className="size-4 shrink-0 text-muted-foreground" />
                          <KnowledgeScrollingLabel className="flex-1 text-sm leading-none">
                            {article.title}
                          </KnowledgeScrollingLabel>
                        </Button>
                      )
                    })}
                  </div>
                ) : activeGroup ? (
                  <div className="mx-1 rounded-2xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {searchValue.trim()
                        ? knowledgeBasePageCopy.articlesEmptyTitle
                        : knowledgeBasePageCopy.groupEmptyTitle}
                    </p>
                    <p className="mt-1 leading-6">
                      {searchValue.trim()
                        ? knowledgeBasePageCopy.articlesEmptyDescription
                        : knowledgeBasePageCopy.groupEmptyDescription}
                    </p>
                  </div>
                ) : null}

                <Button
                  type="button"
                  variant="ghost"
                  className="mt-1 h-10 w-full min-w-0 justify-start gap-2.5 rounded-xl px-3.5 text-left"
                  disabled={!canCreateArticle}
                  title={
                    canCreateArticle
                      ? knowledgeBasePageCopy.createArticle
                      : knowledgeBasePageCopy.createArticleDisabledLabel
                  }
                  onClick={onCreateArticle}
                >
                  <IconPlus className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">
                    {knowledgeBasePageCopy.createArticle}
                  </span>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </TooltipProvider>
    </aside>
  )
}
