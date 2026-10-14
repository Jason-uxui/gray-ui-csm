"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react"
import { TooltipButton } from "@/components/ui/tooltip-button"

const TOAST_DURATION_MS = 4000
type ToastMessage = { id: number; message: string; error: boolean }

export function useSupportToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const notify = useCallback((message: string, error = false) => {
    setToast({ id: Date.now(), message, error })
  }, [])
  const dismiss = useCallback(() => setToast(null), [])
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(dismiss, TOAST_DURATION_MS)
    return () => window.clearTimeout(timeout)
  }, [toast, dismiss])
  return { toast, notify, dismiss }
}

export function SupportToast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null
  onDismiss: () => void
}) {
  if (!toast) return null
  return createPortal(
    <div
      key={toast.id}
      role={toast.error ? "alert" : "status"}
      className="fixed top-4 left-1/2 z-[80] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl border bg-popover px-4 py-3 text-sm font-medium text-popover-foreground shadow-xl"
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {toast.error ? (
          <IconAlertCircle className="size-4" stroke={1.5} />
        ) : (
          <IconCheck className="size-3.5" stroke={1.5} />
        )}
      </span>
      <span>{toast.message}</span>
      <TooltipButton
        variant="ghost"
        size="icon-xs"
        aria-label="Dismiss notification"
        className="rounded-xl focus-visible:ring-2"
        onClick={onDismiss}
      >
        <IconX className="size-3.5" stroke={1.5} />
      </TooltipButton>
    </div>,
    document.body
  )
}
