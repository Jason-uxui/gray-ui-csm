import {
  IconArrowDown,
  IconArrowUp,
  IconCircleDashed,
  IconMinus,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { ticketPriorityIndicatorToneClassName } from "@/lib/tickets/presentation"
import type { TicketPriority } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketPriorityIndicatorProps = {
  priority: TicketPriority
  className?: string
}

type PriorityVisualConfig = {
  label: string
  icon: ComponentType<{ className?: string }>
}

const PRIORITY_VISUAL: Record<TicketPriority, PriorityVisualConfig> = {
  urgent: {
    label: "Urgent",
    icon: IconArrowUp,
  },
  high: {
    label: "High",
    icon: IconArrowUp,
  },
  medium: {
    label: "Normal",
    icon: IconMinus,
  },
  low: {
    label: "Low",
    icon: IconArrowDown,
  },
  todo: {
    label: "Todo",
    icon: IconCircleDashed,
  },
}

export function TicketPriorityIndicator({
  priority,
  className,
}: TicketPriorityIndicatorProps) {
  const visual = PRIORITY_VISUAL[priority]
  const Icon = visual.icon

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      title={`${visual.label} priority`}
      aria-label={`${visual.label} priority`}
    >
      <Icon
        className={cn("size-4", ticketPriorityIndicatorToneClassName[priority])}
      />
    </span>
  )
}
