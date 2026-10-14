"use client"

import { useState } from "react"
import Image from "next/image"
import { Popover } from "@base-ui/react/popover"
import {
  IconMicrophoneOff,
  IconVideo,
  IconChevronDown,
  IconChevronUp,
  IconPower,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { TooltipButton } from "@/components/ui/tooltip-button"
import {
  SUPPORT_CONTROL_CLASS_NAME,
  SUPPORT_GHOST_CONTROL_CLASS_NAME,
} from "./support-control-styles"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DiscussionAvatar } from "@/components/detail-tabs/shared-discussion-tab-content"
import type {
  RemoteSession,
  SessionAction,
} from "@/lib/tickets/remote-assist/types"
import {
  durationSeconds,
  formatDuration,
} from "@/lib/tickets/remote-assist/state"
import { sessionStatusLabel } from "@/lib/tickets/remote-assist/presentation"
import {
  SUPPORT_ASSETS,
  SUPPORT_STUDIO_LABEL,
} from "@/lib/tickets/remote-assist/mock-data"
import { SupportIcon } from "./support-icons"
import { cn } from "@/lib/utils"
import { useSampleCustomer } from "./use-sample-customer"

const WAVE_SEGMENTS = 13
const KEYPAD_DIGITS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "0",
  "#",
]
export function PhoneSupportPanel({
  session,
  now,
  onAction,
  onEnd,
}: {
  session: RemoteSession
  now: number
  onAction: (action: SessionAction) => void
  onEnd: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const live = session.status === "live"
  useSampleCustomer(session, onAction)
  return (
    <>
      <section
        className="dark fixed right-4 bottom-4 z-40 w-[calc(100vw-2rem)] max-w-[25.875rem] text-foreground"
        aria-label="Phone support"
      >
        <div className="relative z-10 flex w-fit max-w-full flex-wrap items-center gap-3 rounded-t-2xl bg-background p-3">
          <SupportIcon name="phone" />
          <span className="text-sm font-medium">On call</span>
          <Badge
            variant="outline"
            className="gap-1 rounded-full px-2.5 py-0.5 text-xs leading-4 font-semibold"
          >
            <span
              className={cn(
                "size-2 rounded-full",
                live ? "bg-status-success" : "bg-status-warning"
              )}
            />
            {live && session.onHold
              ? "On hold"
              : sessionStatusLabel[session.status]}
            {session.startedAt !== undefined && (
              <span className="ml-1 flex items-center gap-1 font-medium tabular-nums">
                <SupportIcon name="timer" size={12} />
                {formatDuration(durationSeconds(session, now))}
              </span>
            )}
          </Badge>
          <TooltipButton
            variant="ghost"
            size="icon-sm"
            className={cn(
              SUPPORT_GHOST_CONTROL_CLASS_NAME,
              !collapsed && "xl:hidden"
            )}
            aria-label={collapsed ? "Expand call panel" : "Minimize call panel"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <IconChevronUp className="size-4" />
            ) : (
              <IconChevronDown className="size-4" />
            )}
          </TooltipButton>
          {collapsed && (
            <TooltipButton
              size="icon-sm"
              className="rounded-xl bg-remote-call-end text-remote-call-end-foreground shadow-none! hover:bg-remote-call-end/80 focus-visible:ring-2"
              aria-label="End call"
              onClick={() => setConfirm(true)}
            >
              <SupportIcon name="phone-end" />
            </TooltipButton>
          )}
        </div>
        {!collapsed && (
          <div className="rounded-tr-2xl rounded-b-2xl bg-background p-4">
            {(session.status === "disconnected" ||
              session.status === "reconnecting") && (
              <div
                role="status"
                className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2"
              >
                <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {session.status === "disconnected"
                    ? "The call connection was lost."
                    : "Reconnecting the call…"}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={session.status === "reconnecting"}
                  onClick={() =>
                    onAction({ type: "reconnect", at: Date.now() })
                  }
                >
                  Reconnect call
                </Button>
              </div>
            )}
            <div
              className="flex h-13 items-center justify-center overflow-hidden"
              aria-hidden
            >
              {Array.from({ length: WAVE_SEGMENTS }, (_, i) => (
                <Image
                  key={i}
                  src={`/remote-assist/wave-${live && !session.onHold && i < 8 ? "active" : "muted"}.svg`}
                  width={28}
                  height={28}
                  alt=""
                  className={cn(
                    "shrink-0",
                    live && !session.onHold && "motion-safe:animate-pulse"
                  )}
                />
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Image
                  src={SUPPORT_ASSETS.studio}
                  width={24}
                  height={24}
                  alt=""
                />
                <span className="text-sm font-medium">
                  {SUPPORT_STUDIO_LABEL} (You)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DiscussionAvatar
                  person={{
                    name: session.customer.name,
                    avatarUrl: "/remote-assist/participant-avatar.svg",
                  }}
                  className="size-6!"
                />
                <span className="text-sm font-medium">
                  {session.customer.name}
                </span>
              </div>
            </div>
            {session.recordingPermission === "denied" && (
              <p role="status" className="mt-3 text-xs text-muted-foreground">
                Call recording was declined. No recording will be created.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <TooltipButton
                variant="secondary"
                size="icon"
                className={SUPPORT_CONTROL_CLASS_NAME}
                aria-label={session.muted ? "Unmute call" : "Mute call"}
                aria-pressed={session.muted}
                onClick={() =>
                  onAction({
                    type: "media",
                    field: "muted",
                    at: Date.now(),
                  })
                }
              >
                {session.muted ? (
                  <IconMicrophoneOff className="size-4" />
                ) : (
                  <SupportIcon name="phone-mic" />
                )}
              </TooltipButton>
              <TooltipButton
                variant="secondary"
                size="icon"
                className={SUPPORT_CONTROL_CLASS_NAME}
                aria-label={
                  session.cameraOn
                    ? "Turn call camera off"
                    : "Turn call camera on"
                }
                aria-pressed={session.cameraOn}
                onClick={() =>
                  onAction({
                    type: "media",
                    field: "cameraOn",
                    at: Date.now(),
                  })
                }
              >
                {session.cameraOn ? (
                  <IconVideo className="size-4" />
                ) : (
                  <SupportIcon name="phone-camera" />
                )}
              </TooltipButton>
              <Popover.Root>
                <Popover.Trigger
                  render={
                    <TooltipButton
                      variant="secondary"
                      size="icon"
                      className={SUPPORT_CONTROL_CLASS_NAME}
                      aria-label="Open keypad"
                      disabled={!live}
                    />
                  }
                >
                  <SupportIcon name="keypad" />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner
                    side="top"
                    sideOffset={8}
                    className="z-[75]"
                  >
                    <Popover.Popup className="dark w-52 rounded-xl border bg-popover p-3 text-popover-foreground shadow-xl">
                      <Popover.Title className="mb-2 text-sm font-medium">
                        Keypad
                      </Popover.Title>
                      <output
                        className="mb-2 block min-h-6 truncate rounded border p-1 text-center"
                        aria-label="Dialed digits"
                      >
                        {session.dialedDigits || "Enter digits"}
                      </output>
                      <div className="grid grid-cols-3 gap-2">
                        {KEYPAD_DIGITS.map((digit) => (
                          <Button
                            key={digit}
                            variant="secondary"
                            className="border-border shadow-none!"
                            onClick={() =>
                              onAction({ type: "digit", digit, at: Date.now() })
                            }
                          >
                            {digit}
                          </Button>
                        ))}
                      </div>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
              <TooltipButton
                variant={session.onHold ? "outline" : "secondary"}
                size="icon"
                className={SUPPORT_CONTROL_CLASS_NAME}
                disabled={!live}
                aria-label={session.onHold ? "Resume call" : "Hold call"}
                aria-pressed={session.onHold}
                onClick={() =>
                  onAction({
                    type: "media",
                    field: "onHold",
                    at: Date.now(),
                  })
                }
              >
                <SupportIcon name="hold" />
              </TooltipButton>
              <TooltipButton
                size="icon"
                className="ml-auto rounded-xl bg-remote-call-end text-remote-call-end-foreground shadow-none! hover:bg-remote-call-end/80 focus-visible:ring-2"
                aria-label="End call"
                onClick={() => setConfirm(true)}
              >
                <SupportIcon name="phone-end" />
              </TooltipButton>
            </div>
          </div>
        )}
      </section>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="End this call?"
        icon={<IconPower className="size-6" stroke={1.5} />}
        description="The call result will be saved to this ticket. The ticket status stays unchanged."
        confirmLabel="End call"
        onConfirm={() => {
          setConfirm(false)
          onEnd()
        }}
      />
    </>
  )
}
