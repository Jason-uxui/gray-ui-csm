"use client"

import { useState } from "react"
import Image from "next/image"
import {
  IconAlertTriangle,
  IconPhoneOff,
  IconVideoOff,
  IconX,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { TooltipButton } from "@/components/ui/tooltip-button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import { DiscussionMessageEntry } from "@/components/detail-tabs/shared-discussion-tab-content"
import { ActivityTimelineList } from "@/components/activity/activity-timeline"
import { Input } from "@/components/ui/input"
import {
  sessionStatusLabel,
  recordingLabel,
  timeLabel,
  dateLabel,
  shortDateLabel,
} from "@/lib/tickets/remote-assist/presentation"
import {
  durationSeconds,
  formatDuration,
  formatSessionDuration,
  remainingSeconds,
  isActiveSession,
} from "@/lib/tickets/remote-assist/state"
import type {
  RemoteSession,
  SessionAction,
} from "@/lib/tickets/remote-assist/types"
import { SupportIcon } from "./support-icons"
import { RecordingPreviewDialog } from "./recording-preview-dialog"
import { CallRecordingPlayer } from "./call-recording-player"
import { SessionScenarios } from "./session-scenarios"
import { SupportToast, useSupportToast } from "./support-toast"

type CardProps = {
  session: RemoteSession
  now: number
  onOpen: (id: string) => void
  onAction: (id: string, action: SessionAction) => void
  onResend: (session: RemoteSession) => void
}
const panelClass =
  "w-full gap-3 rounded-tl-none rounded-b-2xl rounded-tr-2xl border-0 bg-sidebar-accent p-4 text-foreground shadow-raised-control ring-0"
function SessionCardTitle({
  session,
  summary = false,
}: {
  session: RemoteSession
  summary?: boolean
}) {
  return (
    <div className="relative z-10 -mb-px flex w-fit max-w-full flex-wrap items-center gap-3 rounded-t-2xl bg-sidebar-accent p-3 shadow-raised-control after:absolute after:right-px after:bottom-0 after:left-px after:h-px after:bg-sidebar-accent">
      <SupportIcon
        name={session.kind === "remote" ? "monitor" : "phone"}
        className={
          session.kind === "phone" ? "invert dark:invert-0" : undefined
        }
      />
      <span className="text-sm font-medium">
        {summary
          ? session.kind === "phone"
            ? "Call ended"
            : "Session ended"
          : session.kind === "phone"
            ? "Phone support"
            : "Remote assistance"}
      </span>
      <Badge
        variant="outline"
        className="rounded-full px-2.5 py-0.5 text-xs leading-4 font-semibold"
      >
        {summary && session.kind === "phone" && session.recording === "ready"
          ? sessionStatusLabel[session.status]
          : summary && session.recording !== "none"
            ? recordingLabel[session.recording]
            : sessionStatusLabel[session.status]}
      </Badge>
    </div>
  )
}
export function RemoteInvitationEntry(props: CardProps) {
  const { session, now, onOpen, onResend } = props
  const { toast, notify, dismiss } = useSupportToast()
  const link =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/tickets/${encodeURIComponent(session.ticketId)}?assist=${encodeURIComponent(session.id)}`
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      notify(`${label} copied`)
    } catch {
      notify(
        `Could not copy ${label.toLowerCase()}. Select the text and copy it manually.`,
        true
      )
    }
  }
  const waiting =
    session.status === "waiting" || session.status === "connecting"
  return (
    <DiscussionMessageEntry
      author={session.agent}
      timestamp={timeLabel(session.createdAt)}
      badges={
        <Badge variant="secondary" className="rounded-full text-xs">
          {session.kind === "remote" ? "Email" : "Phone"}
        </Badge>
      }
      body={session.invitationMessage}
      attachment={
        <div className="mt-2 w-full max-w-[33.9375rem]">
          <SessionCardTitle session={session} />
          <Card className={panelClass}>
            {session.kind === "remote" && (
              <div>
                <div className="flex min-h-9 min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="shrink-0 text-[13px] leading-5 text-muted-foreground">
                    Link to join
                  </span>
                  <a
                    href={link}
                    onClick={(e) => {
                      e.preventDefault()
                      onOpen(session.id)
                    }}
                    className="w-fit max-w-full min-w-0 shrink truncate rounded-full bg-secondary px-2.5 py-0.5 text-sm leading-5 font-medium no-underline transition-colors hover:bg-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {link.replace(/^https?:\/\//, "")}
                  </a>
                  <TooltipButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy invitation link"
                    className="h-9 w-10 rounded-xl focus-visible:ring-2 dark:hover:bg-muted"
                    onClick={() => void copy(link, "Link")}
                  >
                    <SupportIcon name="copy" />
                  </TooltipButton>
                </div>
                <div className="flex min-h-9 flex-wrap items-center gap-3">
                  <span className="shrink-0 text-[13px] leading-5 text-muted-foreground">
                    Access code
                  </span>
                  <span className="text-sm leading-5 font-medium tabular-nums">
                    {session.accessCode}
                  </span>
                  <TooltipButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy access code"
                    className="h-9 w-10 rounded-xl focus-visible:ring-2 dark:hover:bg-muted"
                    onClick={() => void copy(session.accessCode, "Code")}
                  >
                    <SupportIcon name="copy" />
                  </TooltipButton>
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2.5 border-t pt-3">
              <Button
                onClick={() => onOpen(session.id)}
                disabled={!isActiveSession(session)}
                className="rounded-xl"
              >
                Open {session.kind === "remote" ? "session" : "call"}
              </Button>
              {waiting && (
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  Expires in{" "}
                  <span
                    role="timer"
                    aria-label={`Invitation expires in ${formatDuration(remainingSeconds(session, now))}`}
                    className="relative isolate overflow-hidden rounded-full bg-muted px-2.5 py-0.5 text-xs leading-4 font-medium text-foreground tabular-nums"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 -z-10 bg-border transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((session.expiresAt - now) / (session.expiresAt - session.createdAt)) * 100))}%`,
                      }}
                    />
                    {formatDuration(remainingSeconds(session, now))}
                  </span>
                </span>
              )}
              {["expired", "canceled", "unanswered"].includes(
                session.status
              ) && (
                <Button variant="outline" onClick={() => onResend(session)}>
                  New invitation
                </Button>
              )}
            </div>
          </Card>
          <SupportToast toast={toast} onDismiss={dismiss} />
        </div>
      }
    />
  )
}
export function RemoteSummaryEntry({
  session,
  now,
  onAction,
}: Pick<CardProps, "session" | "now" | "onAction">) {
  const [logOpen, setLogOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [outcome, setOutcome] = useState(session.outcome)
  const [notice, setNotice] = useState("")
  const clip =
    session.kind === "remote"
      ? "/remote-assist/demo-screen-hd.mp4"
      : "/remote-assist/demo-call.wav"
  const fileName = `demo-${session.id}_${new Date(session.createdAt).toISOString().slice(0, 10)}.${session.kind === "remote" ? "mp4" : "wav"}`
  async function download() {
    try {
      const result = await fetch(clip)
      if (!result.ok) throw new Error()
      const url = URL.createObjectURL(await result.blob())
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setNotice("The demo preview could not be downloaded. Please try again.")
    }
  }
  return (
    <>
      <DiscussionMessageEntry
        author={session.agent}
        timestamp={timeLabel(session.endedAt ?? session.createdAt)}
        badges={
          <Badge variant="secondary" className="rounded-full text-xs">
            {session.kind === "remote" ? "Email" : "Phone"}
          </Badge>
        }
        body=""
        attachment={
          <div className="w-full max-w-[33.9375rem]">
            <SessionCardTitle session={session} summary />
            <Card className={panelClass}>
              <div
                className={
                  session.recording === "ready"
                    ? "grid grid-cols-[2fr_1fr] items-center gap-10 text-xs max-sm:grid-cols-1 max-sm:gap-3"
                    : "grid grid-cols-[minmax(0,136px)_minmax(0,1fr)] items-center gap-6 text-sm max-sm:grid-cols-1 max-sm:gap-3"
                }
              >
                <div className="flex items-center gap-3">
                  {session.recording !== "ready" && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <SupportIcon name="summary-timer" size={18} />
                    </span>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p
                      className={
                        session.recording === "ready"
                          ? "mt-1 font-semibold"
                          : "mt-1 font-medium"
                      }
                    >
                      {session.startedAt === undefined
                        ? "Not started"
                        : formatSessionDuration(durationSeconds(session, now))}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  {session.recording !== "ready" && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <SupportIcon name="calendar" size={18} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {session.recording === "ready" ? "Dates" : "Date & time"}
                    </p>
                    <p
                      className={
                        session.recording === "ready"
                          ? "mt-1 font-semibold"
                          : "mt-1 truncate font-medium"
                      }
                      title={`${dateLabel(session.createdAt)} · ${timeLabel(session.startedAt ?? session.createdAt)}–${timeLabel(session.endedAt ?? now)}`}
                    >
                      {session.recording === "ready" ? (
                        shortDateLabel(session.createdAt)
                      ) : (
                        <span className="whitespace-nowrap">
                          {dateLabel(session.createdAt)} ·{" "}
                          {timeLabel(session.startedAt ?? session.createdAt)}–
                          {timeLabel(session.endedAt ?? now)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {session.recording === "processing" ? (
                <div className="flex aspect-[511/180] flex-col items-center justify-center gap-3 rounded-lg border bg-sidebar-accent">
                  <span className="relative block size-5">
                    <Image
                      src="/remote-assist/processing-base.svg"
                      width={20}
                      height={20}
                      alt=""
                    />
                    <Image
                      src="/remote-assist/processing-active.svg"
                      width={20}
                      height={20}
                      alt=""
                      className="absolute inset-0 animate-spin motion-reduce:animate-none"
                    />
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Processing demo recording
                  </p>
                </div>
              ) : session.recording === "ready" ? (
                <>
                  {session.kind === "phone" ? (
                    <CallRecordingPlayer src={clip} />
                  ) : (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            className="group relative block w-full overflow-hidden rounded outline-none focus-visible:ring-2 focus-visible:ring-ring active:opacity-90"
                            aria-label="Play demo recording"
                            onClick={() => setPreviewOpen(true)}
                          />
                        }
                      >
                        <Image
                          src="/remote-assist/recording-poster.png"
                          width={511}
                          height={195}
                          alt="Demo recording of the shared screen"
                          className="h-auto w-full"
                        />
                        <span className="absolute top-1/2 left-1/2 flex h-10 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-primary-raised transition-colors group-hover:bg-primary/80">
                          <SupportIcon name="play" className="dark:invert-0" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent positionerClassName="z-[90]">
                        Play recording
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <SupportIcon name="file-video" size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {session.kind === "phone" ? "Call Summary" : fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supplied sample{" "}
                        {session.kind === "phone" ? "audio" : "video"} · no real
                        session recorded
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Download demo recording"
                            className="rounded-xl focus-visible:ring-2 dark:hover:bg-muted"
                            onClick={() => void download()}
                          />
                        }
                      >
                        <SupportIcon name="download" />
                      </TooltipTrigger>
                      <TooltipContent positionerClassName="z-[90]">
                        Download
                      </TooltipContent>
                    </Tooltip>
                    <Button
                      variant="secondary"
                      className="h-9 rounded-xl"
                      onClick={() => setLogOpen(true)}
                    >
                      View session log
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-lg border bg-sidebar-accent px-6 py-5 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {session.recording === "failed" ? (
                      <IconAlertTriangle className="size-5" stroke={1.5} />
                    ) : session.kind === "phone" ? (
                      <IconPhoneOff className="size-5" stroke={1.5} />
                    ) : (
                      <IconVideoOff className="size-5" stroke={1.5} />
                    )}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {session.recording === "failed"
                        ? "Recording unavailable"
                        : "No recording available"}
                    </p>
                    <p className="max-w-sm text-sm leading-5 text-muted-foreground">
                      {session.recording === "failed"
                        ? "We couldn’t process this recording. You can still review what happened in the session log."
                        : session.startedAt === undefined
                          ? session.kind === "phone"
                            ? "The customer did not connect to the call. No recording was created."
                            : "The session ended before screen sharing started. No recording was created."
                          : "Recording wasn’t enabled for this session. You can still review the session log."}
                    </p>
                  </div>
                </div>
              )}
              {session.recording !== "ready" && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogOpen(true)}
                  >
                    View session log
                  </Button>
                </div>
              )}
              {notice && (
                <p role="status" className="mt-2 text-xs text-muted-foreground">
                  {notice}
                </p>
              )}
            </Card>
          </div>
        }
      />
      <Sheet open={logOpen} onOpenChange={setLogOpen}>
        <SheetContent showCloseButton={false}>
          <SheetClose
            render={
              <TooltipButton
                variant="ghost"
                size="icon-sm"
                aria-label="Close session log"
                className="absolute top-4 right-4 rounded-xl focus-visible:ring-2"
              />
            }
          >
            <IconX className="size-4" />
          </SheetClose>
          <SheetHeader>
            <SheetTitle>Session log · {session.id}</SheetTitle>
            <SheetDescription>
              Events for {session.customer.name}. Demo history in this browser
              tab.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Session activity</p>
              <SessionScenarios
                session={session}
                onAction={(action) => onAction(session.id, action)}
              />
            </div>
            <ActivityTimelineList
              items={session.events.map((e) => ({
                id: e.id,
                title: e.title,
                detail: e.detail,
                timestamp: `${dateLabel(e.at)} · ${timeLabel(e.at)}`,
              }))}
            />
            <label
              className="mt-6 block text-sm font-medium"
              htmlFor={`${session.id}-outcome`}
            >
              Session summary
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                id={`${session.id}-outcome`}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Add the outcome or next step…"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onAction(session.id, {
                    type: "outcome",
                    value: outcome.trim(),
                    at: Date.now(),
                  })
                  setNotice("Summary saved")
                }}
              >
                Save
              </Button>
            </div>
            {notice && (
              <p role="status" className="mt-2 text-sm text-muted-foreground">
                {notice}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <RecordingPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        src={clip}
      />
    </>
  )
}
