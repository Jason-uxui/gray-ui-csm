"use client"

import type { ReactNode } from "react"
import { IconPlus } from "@tabler/icons-react"

import {
  ActivityTimelineList,
  type ActivityTimelineItem,
} from "@/components/activity/activity-timeline"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PersonLike = {
  name: string
  avatarUrl?: string
  email?: string
}

export type InternalNoteItem = {
  id: string
  author: PersonLike
  timestamp: string
  body: string
}

function getInitials(name?: string) {
  if (!name) return "?"
  const words = name.trim().split(/\s+/).slice(0, 2)
  return words.map((part) => part.charAt(0).toUpperCase()).join("")
}

function TimelineAvatar({
  person,
  className,
}: {
  person?: PersonLike
  className?: string
}) {
  return (
    <Avatar className={cn("border bg-background", className)} size="lg">
      {person?.avatarUrl ? (
        <AvatarImage src={person.avatarUrl} alt={person.name} />
      ) : null}
      <AvatarFallback className="text-xs">
        {getInitials(person?.name)}
      </AvatarFallback>
    </Avatar>
  )
}

function NoteCard({ note }: { note: InternalNoteItem }) {
  return (
    <div className="flex gap-3">
      <TimelineAvatar person={note.author} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{note.author.name}</span>
          <span className="text-muted-foreground">{note.timestamp}</span>
          <Badge variant="outline" className="h-5 rounded-full px-2 text-[11px]">
            Internal
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground">{note.body}</p>
      </div>
    </div>
  )
}

function ComposerShell({
  currentUser,
  children,
}: {
  currentUser: PersonLike
  children: ReactNode
}) {
  return (
    <div className="shrink-0 bg-background/95 px-6 py-5 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <TimelineAvatar person={currentUser} />
        <div className="min-w-0 flex-1 overflow-hidden rounded-3xl border bg-background shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

export function SharedActivityTabContent({
  items,
  emptyMessage = "No recent activity.",
  contentClassName,
}: {
  items: ActivityTimelineItem[]
  emptyMessage?: string
  contentClassName?: string
}) {
  return (
    <div className="scrollbar-hidden h-full overflow-y-auto px-6 py-6">
      <div className={cn(contentClassName)}>
        {items.length > 0 ? (
          <ActivityTimelineList items={items} />
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    </div>
  )
}

export function SharedInternalNotesTabContent({
  notes,
  currentUser,
  noteDraft,
  onNoteDraftChange,
  onAddNote,
}: {
  notes: InternalNoteItem[]
  currentUser: PersonLike
  noteDraft: string
  onNoteDraftChange: (nextValue: string) => void
  onAddNote: () => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-8">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>

      <ComposerShell currentUser={currentUser}>
        <textarea
          value={noteDraft}
          onChange={(event) => onNoteDraftChange(event.target.value)}
          placeholder="Write an internal note..."
          className="min-h-28 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70"
        />

        <div className="border-t px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Only the support team can see this note.
            </span>
            <Button
              type="button"
              size="sm"
              className="rounded-xl"
              onClick={onAddNote}
              disabled={!noteDraft.trim()}
            >
              Add note
              <IconPlus className="size-4" />
            </Button>
          </div>
        </div>
      </ComposerShell>
    </div>
  )
}
