"use client"

import { useId, useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  IconArrowDown,
  IconArrowsExchange,
  IconMail,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getAssignedAgent,
  findTransferCandidates,
  getAvailableFollowers,
} from "@/lib/tickets/agents"
import { getTicketInitials } from "@/lib/tickets/presentation"
import { getTicketNumberLabel } from "./ticket-detail-helpers"
import type { Ticket, TicketPerson } from "@/lib/tickets/types"

function Person({ person }: { person: TicketPerson }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-8 shrink-0">
        {person.avatarUrl && (
          <AvatarImage src={person.avatarUrl} alt={person.name} />
        )}
        <AvatarFallback>{getTicketInitials(person.name)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 text-sm font-medium break-words">
        {person.name}
      </span>
    </div>
  )
}

export function TicketAgentPanel({
  ticket,
  onTransfer,
  onFollowersChange,
}: {
  ticket: Ticket
  onTransfer: (agent: TicketPerson) => void
  onFollowersChange: (followers: TicketPerson[]) => void
}) {
  const [selecting, setSelecting] = useState(false)
  const [query, setQuery] = useState("")
  const [target, setTarget] = useState<TicketPerson | null>(null)
  const searchId = useId()
  const assignedPerson = getAssignedAgent(ticket.assignee)
  const followers = ticket.followers ?? []
  const candidates = findTransferCandidates(ticket.assignee, query)
  const availableFollowers = getAvailableFollowers(followers)

  return (
    <div className="space-y-6">
      <section aria-label="Agent Assigned" className="space-y-3">
        <h3 className="text-base font-semibold">Agent Assigned</h3>
        {selecting ? (
          <div className="rounded-xl border">
            <div className="relative space-y-3 border-b p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Transfer from
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelecting(false)
                    setQuery("")
                  }}
                >
                  Cancel
                </Button>
              </div>
              {assignedPerson ? (
                <Person person={assignedPerson} />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Unassigned
                </span>
              )}
              <span className="absolute -bottom-3 left-1/2 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground">
                <IconArrowDown className="size-4" />
              </span>
            </div>
            <div className="space-y-3 p-4 pt-6">
              <label
                htmlFor={searchId}
                className="text-xs text-muted-foreground"
              >
                Transfer to
              </label>
              <div className="relative">
                <IconSearch className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  id={searchId}
                  autoFocus
                  placeholder="Search agents…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {candidates.map((agent) => (
                  <div
                    key={agent.email}
                    className="flex items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <Person person={agent} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-foreground"
                      aria-label={`Transfer to ${agent.name}`}
                      onClick={() => setTarget(agent)}
                    >
                      Transfer
                    </Button>
                  </div>
                ))}
                {!candidates.length && (
                  <p
                    role="status"
                    className="py-5 text-center text-sm text-muted-foreground"
                  >
                    No agents found. Try another name or email.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 rounded-xl border p-4">
              {assignedPerson ? (
                <>
                  <Person person={assignedPerson} />
                  {assignedPerson?.email && (
                    <a
                      className="flex items-center gap-2 text-sm text-foreground"
                      href={`mailto:${assignedPerson?.email}`}
                    >
                      <IconMail className="size-4 shrink-0" />
                      <span className="break-all">{assignedPerson?.email}</span>
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </div>
            <Button className="w-full" onClick={() => setSelecting(true)}>
              {ticket.assignee ? "Transfer to Other Agent" : "Assign agent"}
            </Button>
          </>
        )}
      </section>
      <section className="space-y-3 border-t pt-5" aria-label="Followers">
        <h3 className="text-sm font-medium">
          Followers {followers.length ? `(${followers.length})` : ""}
        </h3>
        {followers.map((follower) => (
          <div
            key={follower.name}
            className="flex items-center justify-between gap-2 rounded-lg border p-3"
          >
            <Person person={follower} />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove follower ${follower.name}`}
              onClick={() =>
                onFollowersChange(
                  followers.filter((person) => person.name !== follower.name)
                )
              }
            >
              <IconX className="size-4" />
            </Button>
          </div>
        ))}
        {!followers.length && (
          <p className="text-sm text-muted-foreground">No followers yet</p>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="link"
                className="h-auto p-0 text-foreground underline"
              />
            }
          >
            + Add Followers
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {availableFollowers.map((person) => (
              <DropdownMenuItem
                key={person.name}
                onClick={() => onFollowersChange([...followers, person])}
              >
                {person.name}
              </DropdownMenuItem>
            ))}
            {!availableFollowers.length && (
              <DropdownMenuItem disabled>
                Everyone is already added
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
      <ConfirmDialog
        showCloseButton
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title={`${ticket.assignee ? "Transfer" : "Assign"} Ticket ${getTicketNumberLabel(ticket)} ${ticket.assignee ? "to Another Agent" : "to an Agent"}?`}
        description={
          <>
            By confirming,{" "}
            <strong className="text-foreground">{target?.name}</strong> will
            become responsible for this ticket. Your access may change based on
            workspace permissions.
          </>
        }
        illustration={
          <div className="flex size-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <IconArrowsExchange className="size-10" />
          </div>
        }
        confirmLabel={
          ticket.assignee ? "Confirm Transfer" : "Confirm Assignment"
        }
        onConfirm={() => {
          if (!target) return
          onTransfer(target)
          setTarget(null)
          setSelecting(false)
          setQuery("")
        }}
      />
    </div>
  )
}
