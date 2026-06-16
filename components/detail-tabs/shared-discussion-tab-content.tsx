"use client"

import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type DiscussionPerson = {
  name: string
  avatarUrl?: string
  email?: string
}

function getDiscussionInitials(name?: string) {
  if (!name) return "--"

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function DiscussionAvatar({
  person,
  className,
}: {
  person?: DiscussionPerson
  className?: string
}) {
  return (
    <Avatar className={cn("border bg-background", className)} size="lg">
      {person?.avatarUrl ? (
        <AvatarImage src={person.avatarUrl} alt={person.name} />
      ) : null}
      <AvatarFallback className="text-xs">
        {getDiscussionInitials(person?.name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function DiscussionMessageEntry({
  author,
  timestamp,
  badges,
  body,
  attachment,
  className,
}: {
  author: DiscussionPerson
  timestamp: string
  badges?: React.ReactNode
  body: string
  attachment?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex gap-3", className)}>
      <DiscussionAvatar person={author} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{author.name}</span>
          <span className="text-muted-foreground">{timestamp}</span>
          {badges}
        </div>
        <div className="mt-2 text-sm leading-6 text-foreground">{body}</div>
        {attachment ? <div className="mt-3 max-w-xl">{attachment}</div> : null}
      </div>
    </div>
  )
}

export function DiscussionComposerShell({
  currentUser,
  header,
  contentClassName,
  children,
}: {
  currentUser: DiscussionPerson
  header?: React.ReactNode
  contentClassName?: string
  children: React.ReactNode
}) {
  return (
    <div className="shrink-0 bg-background/95 px-6 py-5 backdrop-blur-xl">
      <div className={cn("flex items-start gap-3", contentClassName)}>
        <DiscussionAvatar person={currentUser} />
        <div className="min-w-0 flex-1 overflow-hidden rounded-3xl border bg-background shadow-sm">
          {header ? (
            <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3 text-sm">
              {header}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
}

export function DiscussionThreadContent({
  scrollContainerRef,
  bottomAnchorRef,
  threadClassName,
  children,
  composer,
}: {
  scrollContainerRef?: React.Ref<HTMLDivElement>
  bottomAnchorRef?: React.Ref<HTMLDivElement>
  threadClassName?: string
  children: React.ReactNode
  composer: React.ReactNode
}) {
  return (
    <>
      <div
        ref={scrollContainerRef}
        className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-6 py-6"
      >
        <div className={cn("space-y-8", threadClassName)}>
          {children}
          <div ref={bottomAnchorRef} className="h-px" />
        </div>
      </div>
      {composer}
    </>
  )
}
