"use client"

import { Dialog } from "@base-ui/react/dialog"
import { IconX } from "@tabler/icons-react"
import { TooltipButton } from "@/components/ui/tooltip-button"
import { SUPPORT_ASSETS } from "@/lib/tickets/remote-assist/mock-data"

export function RecordingPreviewDialog({
  open,
  onOpenChange,
  src,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[70] bg-foreground/70" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[71] w-[calc(100vw-2rem)] max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-2 shadow-xl outline-none">
          <Dialog.Title className="sr-only">Recording preview</Dialog.Title>
          <Dialog.Description className="sr-only">
            Supplied sample video of the shared screen.
          </Dialog.Description>
          <TooltipButton
            variant="secondary"
            size="icon-sm"
            aria-label="Close recording preview"
            className="absolute top-4 right-4 z-10 rounded-full shadow-none! focus-visible:ring-2"
            onClick={() => onOpenChange(false)}
          >
            <IconX className="size-4" />
          </TooltipButton>
          {open && (
            <video
              src={src}
              controls
              autoPlay
              muted
              playsInline
              poster={SUPPORT_ASSETS.desktop}
              className="max-h-[calc(100dvh-3rem)] w-full rounded-xl object-contain"
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
