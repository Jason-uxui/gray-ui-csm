"use client"

import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

// Opt-in composition: existing Button consumers keep their current behavior.
export function TooltipButton({
  tooltip,
  tooltipSide = "top",
  children,
  ...props
}: ComponentProps<typeof Button> & {
  tooltip?: string
  tooltipSide?: "top" | "bottom" | "left" | "right"
}) {
  const label = tooltip ?? props["aria-label"]
  if (!label) return <Button {...props}>{children}</Button>
  return (
    <Tooltip>
      {props.disabled ? (
        <TooltipTrigger
          key="disabled"
          render={<span className="inline-flex cursor-not-allowed" />}
        >
          <Button {...props} aria-label={props["aria-label"] ?? label}>
            {children}
          </Button>
        </TooltipTrigger>
      ) : (
        <TooltipTrigger
          key="enabled"
          render={
            <Button {...props} aria-label={props["aria-label"] ?? label} />
          }
        >
          {children}
        </TooltipTrigger>
      )}
      <TooltipContent side={tooltipSide} positionerClassName="z-[90]">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
