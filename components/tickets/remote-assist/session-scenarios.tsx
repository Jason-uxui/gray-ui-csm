"use client"

import { IconDots, IconFlask } from "@tabler/icons-react"
import { TooltipButton } from "@/components/ui/tooltip-button"
import { SUPPORT_CONTROL_CLASS_NAME } from "./support-control-styles"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type {
  RemoteSession,
  SessionAction,
} from "@/lib/tickets/remote-assist/types"

export function SessionScenarioItems({
  session,
  onAction,
}: {
  session: RemoteSession
  onAction: (action: SessionAction) => void
}) {
  const act = (
    type:
      | "join"
      | "connecting"
      | "disconnect"
      | "reconnect"
      | "expire"
      | "unanswered"
  ) => onAction({ type, at: Date.now() })
  const canJoin = ["waiting", "dialing", "connecting", "reconnecting"].includes(
    session.status
  )
  const live = session.status === "live"
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel className="flex items-center gap-2">
        <IconFlask className="size-4" />
        Demo scenarios
      </DropdownMenuLabel>
      <DropdownMenuItem disabled={!canJoin} onClick={() => act("connecting")}>
        Customer is connecting
      </DropdownMenuItem>
      <DropdownMenuItem disabled={!canJoin} onClick={() => act("join")}>
        Customer joins / reconnects
      </DropdownMenuItem>
      <DropdownMenuItem disabled={!live} onClick={() => act("disconnect")}>
        Connection lost
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={session.status !== "disconnected"}
        onClick={() => act("reconnect")}
      >
        Try reconnecting
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={session.startedAt !== undefined || !canJoin}
        onClick={() => act(session.kind === "phone" ? "unanswered" : "expire")}
      >
        {session.kind === "phone" ? "Call unanswered" : "Invitation expires"}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={session.control !== "requested" || !live}
        onClick={() =>
          onAction({ type: "control", value: "granted", at: Date.now() })
        }
      >
        Customer grants control
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={session.control !== "requested" || !live}
        onClick={() =>
          onAction({ type: "control", value: "denied", at: Date.now() })
        }
      >
        Customer declines control
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={session.control !== "granted" || !live}
        onClick={() =>
          onAction({ type: "control", value: "none", at: Date.now() })
        }
      >
        Customer revokes control
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={session.recordingPermission !== "requested" || !live}
        onClick={() =>
          onAction({
            type: "recording-permission",
            value: "granted",
            at: Date.now(),
          })
        }
      >
        Customer allows recording
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={session.recordingPermission !== "requested" || !live}
        onClick={() =>
          onAction({
            type: "recording-permission",
            value: "denied",
            at: Date.now(),
          })
        }
      >
        Customer declines recording
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={
          !live ||
          session.recordingPermission === "requested" ||
          session.recordingPermission === "granted"
        }
        onClick={() =>
          onAction({
            type: "recording-permission",
            value: "requested",
            at: Date.now(),
          })
        }
      >
        Request recording permission
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={session.status !== "ended" || session.recording === "none"}
        onClick={() =>
          onAction({
            type: "recording-result",
            value: "ready",
            at: Date.now(),
          })
        }
      >
        Demo recording is ready
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={session.status !== "ended" || session.recording === "none"}
        onClick={() =>
          onAction({
            type: "recording-result",
            value: "failed",
            at: Date.now(),
          })
        }
      >
        Recording processing fails
      </DropdownMenuItem>
    </DropdownMenuGroup>
  )
}

export function SessionScenarios(props: {
  session: RemoteSession
  onAction: (action: SessionAction) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TooltipButton
            variant="outline"
            size="icon"
            className={SUPPORT_CONTROL_CLASS_NAME}
            aria-label="Demo scenarios"
          />
        }
      >
        <IconDots className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[70dvh] w-64 overflow-y-auto"
      >
        <SessionScenarioItems {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
