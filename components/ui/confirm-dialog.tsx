"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  showCloseButton?: boolean
  illustration?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  confirmVariant?: React.ComponentProps<typeof Button>["variant"]
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  illustration,
  showCloseButton = false,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  confirmVariant = "default",
}: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-[70] bg-black/32 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity] data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm motion-reduce:transition-none"
          )}
        />

        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-[71] flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[28px] border border-border/70 bg-background/96 p-0 text-popover-foreground shadow-2xl transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity] outline-none data-ending-style:translate-y-[calc(-50%+1rem)] data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+1rem)] data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xl motion-reduce:transition-none"
          )}
        >
          {showCloseButton ? (
            <DialogPrimitive.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-4 right-4"
                  aria-label="Close confirmation"
                />
              }
            >
              <IconX className="size-4" />
            </DialogPrimitive.Close>
          ) : null}
          {illustration ? (
            <div className="flex h-40 shrink-0 items-center justify-center bg-primary/10">
              {illustration}
            </div>
          ) : null}
          <div className={cn("px-6 pt-6 pb-4", illustration && "text-center")}>
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/70 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              className="rounded-xl"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
