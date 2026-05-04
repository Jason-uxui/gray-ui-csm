"use client"

import type { ComponentType, ReactNode } from "react"
import { IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type DetailRightPanelSection<TSection extends string> = {
  value: TSection
  label: string
  icon: ComponentType<{ className?: string }>
}

type DetailRightPanelShellProps<TSection extends string> = {
  open: boolean
  sections: Array<DetailRightPanelSection<TSection>>
  activeSection: TSection
  onToggleOpen: () => void
  onSelectSection: (nextSection: TSection) => void
  renderSection: (section: TSection) => ReactNode
  className?: string
}

export function DetailRightPanelShell<TSection extends string>({
  open,
  sections,
  activeSection,
  onToggleOpen,
  onSelectSection,
  renderSection,
  className,
}: DetailRightPanelShellProps<TSection>) {
  const activeRightPanel = sections.find(
    (section) => section.value === activeSection
  )

  return (
    <aside className={cn("hidden min-h-0 xl:block", className)}>
      <div className="flex h-full min-h-0 overflow-hidden">
        <div className="flex w-14 shrink-0 flex-col items-center gap-2 p-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl"
            onClick={onToggleOpen}
            aria-label={open ? "Collapse right panel" : "Expand right panel"}
          >
            {open ? (
              <IconChevronsRight className="size-4" />
            ) : (
              <IconChevronsLeft className="size-4" />
            )}
          </Button>

          {sections.map((section) => {
            const SectionIcon = section.icon
            const isActive = activeSection === section.value

            return (
              <Button
                key={section.value}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="icon-sm"
                className="size-9 rounded-xl"
                aria-label={section.label}
                aria-pressed={isActive}
                onClick={() => onSelectSection(section.value)}
              >
                <SectionIcon className="size-4" />
              </Button>
            )
          })}
        </div>

        {open ? (
          <div className="min-h-0 flex-1 border-l p-2">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {activeRightPanel?.label}
                </h2>
              </div>

              <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-4">
                {renderSection(activeSection)}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
