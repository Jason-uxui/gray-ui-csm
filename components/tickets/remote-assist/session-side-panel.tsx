"use client"

import { useState } from "react"
import {
  IconInfoCircle,
  IconUsers,
  IconMessage2,
  IconBook2,
  IconArrowBackUp,
  IconX,
} from "@tabler/icons-react"
import Image from "next/image"
import { DetailRightPanelShell } from "@/components/detail-right-panel-shell"
import {
  DiscussionAvatar,
  DiscussionMessageEntry,
  DiscussionThreadContent,
} from "@/components/detail-tabs/shared-discussion-tab-content"
import { SharedInternalNotesTabContent } from "@/components/detail-tabs/shared-activity-notes-tab-content"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TooltipButton } from "@/components/ui/tooltip-button"
import { SUPPORT_GHOST_CONTROL_CLASS_NAME } from "./support-control-styles"
import { Badge } from "@/components/ui/badge"
import {
  TicketDetailsContent,
  type TicketDetailsContentProps,
} from "../ticket-details-content"
import { TicketAgentPanel } from "../ticket-agent-panel"
import { TicketKnowledgePanel } from "../ticket-knowledge-panel"
import { getKnowledgeArticleUrl } from "../ticket-knowledge-helpers"
import { ThreadComposer } from "../thread-composer"
import {
  timeLabel,
  sessionStatusLabel,
} from "@/lib/tickets/remote-assist/presentation"
import type {
  RemoteSession,
  SessionAction,
} from "@/lib/tickets/remote-assist/types"
import type { TicketPerson } from "@/lib/tickets/types"
import { useSessionComposer } from "./use-session-composer"
import { cn } from "@/lib/utils"

type Section = "details" | "people" | "chat" | "knowledge"
const sections = [
  { value: "details" as const, label: "Ticket Details", icon: IconInfoCircle },
  { value: "people" as const, label: "People", icon: IconUsers },
  { value: "chat" as const, label: "Session chat", icon: IconMessage2 },
  { value: "knowledge" as const, label: "Knowledge Base", icon: IconBook2 },
]
type Props = TicketDetailsContentProps & {
  session: RemoteSession
  open: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  onAction: (action: SessionAction) => void
  onTransfer: (person: TicketPerson) => void
  onFollowersChange: (people: TicketPerson[]) => void
  onCreateArticle: () => void
  panelClassName: string
}
export function SessionSidePanel(props: Props) {
  const { session, onAction } = props
  const [section, setSection] = useState<Section | null>(null)
  const [tab, setTab] = useState("chat")
  const [noteDraft, setNoteDraft] = useState("")
  const composer = useSessionComposer(session, onAction)
  const activeSection =
    section ?? (session.startedAt === undefined ? "details" : "chat")
  const live = session.status === "live"
  const conversation = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <DiscussionAvatar person={session.customer} className="size-10!" />
        <div>
          <p className="text-sm font-semibold">{session.customer.name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={
                live
                  ? "size-1.5 rounded-full bg-status-success"
                  : "size-1.5 rounded-full bg-status-warning"
              }
            />
            {sessionStatusLabel[session.status]}
          </p>
        </div>
      </div>
      <DiscussionThreadContent
        threadClassName="space-y-6"
        composer={
          <div className="px-4 pt-2 pb-4">
            <ThreadComposer
              iconTooltips
              iconButtonClassName={SUPPORT_GHOST_CONTROL_CLASS_NAME}
              name={session.customer.name}
              draft={composer.draft}
              onDraftChange={composer.setDraft}
              attachments={composer.attachments}
              onAddAttachments={composer.add}
              onRemoveAttachment={composer.remove}
              pending={!live || composer.pending}
              onSend={composer.send}
              replyTo={composer.replyTo}
              onCancelReply={() => composer.setReplyTo(undefined)}
              placeholder={`Message ${session.customer.name.split(" ")[0]}…`}
              sendLabel="Send session message"
            />
            {composer.error && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {composer.error}
              </p>
            )}
          </div>
        }
      >
        <p className="border-t pt-4 text-center text-xs text-muted-foreground">
          Today
        </p>
        {session.messages.map((message) => (
          <DiscussionMessageEntry
            key={message.id}
            author={message.author}
            timestamp={timeLabel(message.at)}
            className={cn(
              "gap-2.5 [&>[data-slot=avatar]]:size-8 [&>div>div:first-child]:text-xs",
              message.author.name === session.agent.name &&
                "[&>[data-slot=avatar]]:invisible [&>div>div:first-child]:sr-only"
            )}
            body={
              <div>
                <div className="rounded-xl bg-secondary p-3 text-sm leading-6 whitespace-pre-wrap">
                  {message.replyTo && (
                    <p className="mb-2 border-l-2 border-muted-foreground px-2 text-xs">
                      Replying to {message.replyTo.author}:{" "}
                      {message.replyTo.body}
                    </p>
                  )}
                  {message.body}
                  {message.attachments?.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      download={file.name}
                      className="mt-2 block rounded-lg border bg-background text-xs text-primary"
                    >
                      {file.image && (
                        <div className="relative aspect-video max-h-40 w-full">
                          <Image
                            src={file.url}
                            unoptimized
                            fill
                            sizes="320px"
                            alt={file.name}
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="block truncate p-2">{file.name}</span>
                    </a>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-1 h-7 text-xs text-muted-foreground"
                  disabled={!live}
                  onClick={() =>
                    composer.setReplyTo({
                      id: message.id,
                      author: message.author.name,
                      body: message.body,
                    })
                  }
                >
                  <IconArrowBackUp className="size-3.5" />
                  Reply
                </Button>
              </div>
            }
          />
        ))}
      </DiscussionThreadContent>
    </div>
  )
  function content(current: Section) {
    if (current === "details") return <TicketDetailsContent {...props} />
    if (current === "people")
      return (
        <div className="space-y-4">
          <Badge variant="outline">Session participants</Badge>
          <p className="text-sm">{session.customer.name} · Customer</p>
          <p className="text-sm">{session.agent.name} · Support agent</p>
          <TicketAgentPanel
            iconTooltips
            ticket={props.ticket}
            onTransfer={props.onTransfer}
            onFollowersChange={props.onFollowersChange}
          />
        </div>
      )
    if (current === "knowledge")
      return (
        <TicketKnowledgePanel
          iconTooltips
          isSendingReply={!live}
          onCreateArticle={props.onCreateArticle}
          onInsertArticle={(article) => {
            composer.setDraft(
              `${article.title}\n${getKnowledgeArticleUrl(article)}`
            )
            setSection("chat")
            setTab("chat")
          }}
        />
      )
    return (
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex h-full min-h-0 flex-col"
      >
        <TabsList
          variant="line"
          className="mx-2 grid w-auto shrink-0 grid-cols-2 border-b border-border"
        >
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent
          value="chat"
          className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden"
        >
          {conversation}
        </TabsContent>
        <TabsContent
          value="notes"
          className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden"
        >
          <fieldset disabled={!live} className="flex h-full min-h-0 flex-col">
            <SharedInternalNotesTabContent
              showComposerAvatar={false}
              notes={session.notes.map((note) => ({
                id: note.id,
                author: note.author,
                body: note.body,
                timestamp: timeLabel(note.at),
              }))}
              currentUser={session.agent}
              noteDraft={noteDraft}
              onNoteDraftChange={setNoteDraft}
              onAddNote={() => {
                if (!noteDraft.trim() || !live) return
                const at = Date.now()
                onAction({
                  type: "note",
                  at,
                  message: {
                    id: crypto.randomUUID(),
                    body: noteDraft.trim(),
                    author: session.agent,
                    at,
                  },
                })
                setNoteDraft("")
              }}
            />
          </fieldset>
        </TabsContent>
      </Tabs>
    )
  }
  return (
    <>
      <div
        className={cn(
          "hidden min-h-0 shrink-0 border-l xl:block",
          props.panelClassName
        )}
      >
        <DetailRightPanelShell
          iconTooltips
          iconButtonClassName={SUPPORT_GHOST_CONTROL_CLASS_NAME}
          hideHeader={activeSection === "chat"}
          open={props.open}
          sections={sections}
          activeSection={activeSection}
          onToggleOpen={props.onToggle}
          onSelectSection={(next) => {
            setSection(next)
            if (!props.open) props.onToggle()
          }}
          renderSection={content}
          className="h-full w-full"
          contentClassName={
            activeSection === "chat" ? "overflow-hidden p-0!" : undefined
          }
        />
      </div>
      <Sheet open={props.mobileOpen} onOpenChange={props.onMobileOpenChange}>
        <SheetContent
          showCloseButton={false}
          className="data-[side=right]:w-full sm:max-w-md"
        >
          <SheetClose
            render={
              <TooltipButton
                variant="ghost"
                size="icon-sm"
                aria-label="Close session panel"
                className="absolute top-4 right-4 rounded-xl focus-visible:ring-2"
              />
            }
          >
            <IconX className="size-4" />
          </SheetClose>
          <SheetHeader>
            <SheetTitle>Session panel</SheetTitle>
            <SheetDescription>
              Chat, internal notes and ticket details for this session.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 gap-2 border-b px-4 pb-3">
              {sections.map((item) => {
                const Icon = item.icon
                return (
                  <TooltipButton
                    key={item.value}
                    variant={
                      activeSection === item.value ? "secondary" : "ghost"
                    }
                    size="icon"
                    className={SUPPORT_GHOST_CONTROL_CLASS_NAME}
                    aria-label={item.label}
                    aria-pressed={activeSection === item.value}
                    onClick={() => setSection(item.value)}
                  >
                    <Icon className="size-4" />
                  </TooltipButton>
                )
              })}
            </div>
            <div
              className={cn(
                "min-h-0 flex-1",
                activeSection !== "chat" && "overflow-y-auto p-4"
              )}
            >
              {content(activeSection)}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
