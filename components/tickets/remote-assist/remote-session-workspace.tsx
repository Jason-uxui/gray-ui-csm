"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  IconArrowLeft,
  IconMessage2,
  IconVideo,
  IconMicrophoneOff,
  IconAlertTriangle,
  IconPointerFilled,
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
import {
  SUPPORT_ASSETS,
  SUPPORT_STUDIO_LABEL,
} from "@/lib/tickets/remote-assist/mock-data"
import {
  durationSeconds,
  formatDuration,
  remainingSeconds,
  isActiveSession,
} from "@/lib/tickets/remote-assist/state"
import { sessionStatusLabel } from "@/lib/tickets/remote-assist/presentation"
import type {
  RemoteSession,
  SessionAction,
} from "@/lib/tickets/remote-assist/types"
import { getTicketNumberLabel } from "../ticket-detail-helpers"
import type { TicketDetailsContentProps } from "../ticket-details-content"
import type { TicketPerson } from "@/lib/tickets/types"
import { SessionSidePanel } from "./session-side-panel"
import { DiscussionAvatar } from "@/components/detail-tabs/shared-discussion-tab-content"
import { SupportIcon } from "./support-icons"
import { SessionScenarios } from "./session-scenarios"
import { cn } from "@/lib/utils"
import { useSampleCustomer } from "./use-sample-customer"
import { SupportToast, useSupportToast } from "./support-toast"

type Props = TicketDetailsContentProps & {
  session: RemoteSession
  now: number
  onAction: (action: SessionAction) => void
  onBack: () => void
  onEnd: () => void
  onResend: () => void
  onTransfer: (person: TicketPerson) => void
  onFollowersChange: (people: TicketPerson[]) => void
  onCreateArticle: () => void
}
export function RemoteSessionWorkspace(props: Props) {
  const { session, now, onAction } = props
  const [panelOpen, setPanelOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const { toast, notify, dismiss } = useSupportToast()
  const [fullscreen, setFullscreen] = useState(false)
  const [pointer, setPointer] = useState({ x: 50, y: 50 })
  const live = session.status === "live"
  const terminal = !isActiveSession(session)
  const controlLabel =
    session.control === "granted"
      ? "Release control"
      : session.control === "requested"
        ? "Awaiting permission"
        : "Request control"
  useSampleCustomer(session, onAction)
  useEffect(() => {
    const changed = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", changed)
    return () => document.removeEventListener("fullscreenchange", changed)
  }, [])
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      notify(
        "Full screen is not available in this browser. You can still use the session here."
      )
    }
  }
  async function screenshot() {
    try {
      const res = await fetch(SUPPORT_ASSETS.desktop)
      if (!res.ok) throw new Error()
      const url = URL.createObjectURL(await res.blob())
      const a = document.createElement("a")
      a.href = url
      a.download = `${session.id}-screenshot.png`
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      onAction({ type: "screenshot", at: Date.now() })
      notify("Screen screenshot downloaded")
    } catch {
      notify("The screenshot could not be saved. Try again.", true)
    }
  }
  return (
    <div
      className="fixed inset-y-0 right-0 left-0 z-40 flex flex-col bg-background text-foreground md:left-14"
      data-remote-workspace
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b p-4 sm:gap-3">
        <TooltipButton
          variant="ghost"
          size="sm"
          aria-label="Back to Tickets"
          className={SUPPORT_GHOST_CONTROL_CLASS_NAME}
          onClick={props.onBack}
        >
          <IconArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to Tickets</span>
          <span className="sr-only sm:hidden">Back to Tickets</span>
        </TooltipButton>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {session.startedAt !== undefined && (
            <span className="flex items-center gap-2 text-sm leading-5">
              <SupportIcon name="timer" />
              <span className="sr-only text-muted-foreground sm:not-sr-only">
                Duration
              </span>
              <span className="font-semibold tabular-nums">
                {formatDuration(durationSeconds(session, now))}
              </span>
            </span>
          )}
          <SessionScenarios session={session} onAction={onAction} />
          <Button
            onClick={() => setConfirmEnd(true)}
            disabled={terminal}
            className="rounded-xl"
          >
            <SupportIcon name="stop" className="dark:invert-0" />
            <span>End session</span>
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <SupportIcon name="monitor" size={20} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {live
                  ? `${session.customer.name.split(" ")[0]}’s screen`
                  : "Remote Assist"}
              </p>
              <p
                className="truncate text-xs text-muted-foreground"
                title={props.ticket.subject}
              >
                {getTicketNumberLabel(props.ticket)} ·{" "}
                {live
                  ? `Remote Assist · ${session.control === "granted" ? "Control granted" : "View only"}`
                  : `${props.ticket.subject} · ${session.customer.name}`}
              </p>
            </div>
            <TooltipButton
              variant="outline"
              className={SUPPORT_CONTROL_CLASS_NAME}
              aria-label={controlLabel}
              aria-pressed={session.control === "granted"}
              disabled={!live || session.control === "requested"}
              onClick={() =>
                onAction({
                  type: "control",
                  value: session.control === "granted" ? "none" : "requested",
                  at: Date.now(),
                })
              }
            >
              <SupportIcon name="pointer" />
              <span className="hidden lg:inline">{controlLabel}</span>
              <span className="sr-only lg:hidden">{controlLabel}</span>
            </TooltipButton>
            <TooltipButton
              variant="outline"
              size="icon"
              className={SUPPORT_CONTROL_CLASS_NAME}
              aria-label="Screenshot"
              disabled={!live}
              onClick={() => void screenshot()}
            >
              <SupportIcon name="screenshot" />
            </TooltipButton>
            <TooltipButton
              variant="outline"
              size="icon"
              className={SUPPORT_CONTROL_CLASS_NAME}
              aria-pressed={fullscreen}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              onClick={() => void toggleFullscreen()}
            >
              <SupportIcon name="maximize" />
            </TooltipButton>
            <TooltipButton
              variant="outline"
              size="icon"
              className={cn(SUPPORT_CONTROL_CLASS_NAME, "xl:hidden")}
              aria-label="Open session panel"
              onClick={() => setMobileOpen(true)}
            >
              <IconMessage2 className="size-4" />
            </TooltipButton>
          </div>
          <div className="relative mt-4 overflow-hidden rounded-2xl border bg-sidebar-accent">
            {live ? (
              <div
                role={session.control === "granted" ? "button" : "img"}
                aria-label={
                  session.control === "granted"
                    ? "Shared screen with control. Use arrow keys to move the pointer and Enter to click."
                    : `Shared screen from ${session.customer.name}`
                }
                tabIndex={session.control === "granted" ? 0 : undefined}
                className={cn(
                  "relative outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  session.control === "granted" && "cursor-none"
                )}
                onPointerMove={(e) => {
                  if (session.control !== "granted") return
                  const rect = e.currentTarget.getBoundingClientRect()
                  setPointer({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  })
                }}
                onClick={() => {
                  if (session.control === "granted")
                    notify("Click sent to the sample screen")
                }}
                onKeyDown={(e) => {
                  if (session.control !== "granted") return
                  const delta = {
                    ArrowLeft: [-5, 0],
                    ArrowRight: [5, 0],
                    ArrowUp: [0, -5],
                    ArrowDown: [0, 5],
                  }[e.key]
                  if (delta) {
                    e.preventDefault()
                    setPointer((p) => ({
                      x: Math.min(98, Math.max(0, p.x + delta[0])),
                      y: Math.min(98, Math.max(0, p.y + delta[1])),
                    }))
                  } else if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    notify("Click sent to the sample screen")
                  }
                }}
              >
                <Image
                  src={SUPPORT_ASSETS.desktop}
                  width={936}
                  height={613}
                  alt=""
                  priority
                  unoptimized
                  className="h-auto w-full object-contain"
                />
                {session.control === "granted" && (
                  <div
                    className="pointer-events-none absolute"
                    style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
                  >
                    <IconPointerFilled
                      className="size-4 text-remote-control-cursor drop-shadow-sm"
                      aria-hidden
                    />
                    <Badge className="mt-1">Me</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-[936/613] min-h-64 flex-col items-center justify-center gap-5 p-6 text-center">
                {terminal ? (
                  <IconAlertTriangle className="size-8 text-muted-foreground" />
                ) : (
                  <span className="relative block size-10">
                    <Image
                      src="/remote-assist/loader.svg"
                      width={40}
                      height={40}
                      alt=""
                    />
                    <Image
                      src="/remote-assist/loader-active.svg"
                      width={40}
                      height={40}
                      alt=""
                      className="absolute inset-0 animate-spin motion-reduce:animate-none"
                    />
                  </span>
                )}
                <p className="text-base font-medium">
                  {session.status === "waiting"
                    ? `Waiting for ${session.customer.name.split(" ")[0]}…`
                    : sessionStatusLabel[session.status]}
                </p>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {session.status === "waiting"
                    ? `The sample customer will connect and share their screen shortly. Invitation expires in ${formatDuration(remainingSeconds(session, now))}.`
                    : terminal
                      ? "Send a new invitation to start another support session."
                      : session.status === "connecting"
                        ? "The customer has accepted. Preparing the shared screen…"
                        : session.status === "reconnecting"
                          ? "Restoring the shared screen…"
                          : "Screen sharing is paused. Reconnect to continue."}
                </p>
                {terminal ? (
                  <Button onClick={props.onResend}>New invitation</Button>
                ) : (
                  session.status === "disconnected" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        onAction({ type: "reconnect", at: Date.now() })
                      }
                    >
                      Reconnect
                    </Button>
                  )
                )}
              </div>
            )}
          </div>
          {(session.control === "requested" ||
            session.control === "denied" ||
            session.recordingPermission === "requested" ||
            session.recordingPermission === "denied" ||
            session.recording === "recording") && (
            <p
              role="status"
              className="mt-3 text-center text-xs text-muted-foreground"
            >
              {session.control === "requested"
                ? "Waiting for the sample customer to approve control… "
                : session.control === "denied"
                  ? "Customer declined remote control. View only. "
                  : ""}
              {session.recordingPermission === "requested"
                ? "Recording permission is pending. "
                : session.recordingPermission === "denied"
                  ? "Customer declined recording. No recording will be created."
                  : session.recording === "recording"
                    ? "Recording enabled in the demo; no real screen is captured."
                    : ""}
            </p>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <TooltipButton
              variant={session.muted ? "outline" : "secondary"}
              size="icon"
              aria-label={session.muted ? "Unmute" : "Mute"}
              aria-pressed={session.muted}
              onClick={() =>
                onAction({
                  type: "media",
                  field: "muted",
                  at: Date.now(),
                })
              }
              disabled={terminal}
              className={cn(
                SUPPORT_CONTROL_CLASS_NAME,
                !session.muted &&
                  "bg-inverse text-inverse-foreground hover:bg-inverse/90"
              )}
            >
              {session.muted ? (
                <IconMicrophoneOff className="size-4" />
              ) : (
                <SupportIcon name="mic" />
              )}
            </TooltipButton>
            <TooltipButton
              variant={session.cameraOn ? "secondary" : "outline"}
              size="icon"
              aria-label={
                session.cameraOn ? "Turn camera off" : "Turn camera on"
              }
              aria-pressed={session.cameraOn}
              onClick={() =>
                onAction({
                  type: "media",
                  field: "cameraOn",
                  at: Date.now(),
                })
              }
              disabled={terminal}
              className={SUPPORT_CONTROL_CLASS_NAME}
            >
              {session.cameraOn ? (
                <IconVideo className="size-4" />
              ) : (
                <SupportIcon name="video-off" />
              )}
            </TooltipButton>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {session.startedAt !== undefined && (
              <div className="h-[7.6875rem] w-[12.625rem] overflow-hidden rounded-xl border">
                <Image
                  src="/remote-assist/desktop-thumbnail.png"
                  width={202}
                  height={123}
                  alt="Shared screen preview"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            {session.startedAt !== undefined && (
              <ParticipantTile name={session.customer.name} />
            )}
            <ParticipantTile
              name={SUPPORT_STUDIO_LABEL}
              studio
              muted={session.muted}
              camera={session.cameraOn}
            />
          </div>
        </section>
        <SessionSidePanel
          {...props}
          open={panelOpen}
          onToggle={() => setPanelOpen((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
          panelClassName={
            !panelOpen
              ? "w-14"
              : session.startedAt === undefined
                ? "w-94"
                : "w-112"
          }
        />
      </div>
      <SupportToast toast={toast} onDismiss={dismiss} />
      <ConfirmDialog
        open={confirmEnd}
        onOpenChange={setConfirmEnd}
        title="End this support session?"
        icon={<IconPower className="size-6" stroke={1.5} />}
        description="The result and session log will be saved to this ticket. The ticket status stays unchanged."
        confirmLabel="End session"
        onConfirm={() => {
          setConfirmEnd(false)
          props.onEnd()
        }}
      />
    </div>
  )
}
function ParticipantTile({
  name,
  studio = false,
  muted = false,
  camera = false,
}: {
  name: string
  studio?: boolean
  muted?: boolean
  camera?: boolean
}) {
  return (
    <div className="dark flex h-[7.6875rem] w-[12.625rem] flex-col rounded-xl bg-background p-3 text-foreground">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        {studio ? (
          <span className="flex size-10 items-center justify-center rounded-full border">
            <Image
              src={SUPPORT_ASSETS.studio}
              width={28}
              height={28}
              alt="MonoGray Studio"
            />
          </span>
        ) : (
          <DiscussionAvatar
            person={{
              name,
              avatarUrl: "/remote-assist/participant-avatar.svg",
            }}
            className="size-8! border-0 bg-muted [&_[data-slot=avatar-image]]:object-top"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-xs" title={name}>
          {name}
        </span>
        {muted ? (
          <IconMicrophoneOff className="size-3.5" />
        ) : (
          <SupportIcon name="phone-mic" size={14} />
        )}
        {camera ? (
          <IconVideo className="size-3.5" />
        ) : (
          <SupportIcon name="video-off" size={14} />
        )}
      </div>
    </div>
  )
}
