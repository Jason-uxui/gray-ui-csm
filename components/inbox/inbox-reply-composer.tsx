"use client"

import * as React from "react"
import {
  IconBolt,
  IconChevronDown,
  IconMicrophone,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconSearch,
  IconSend,
} from "@tabler/icons-react"

import { DiscussionComposerShell } from "@/components/detail-tabs/shared-discussion-tab-content"
import { macroSuggestions } from "@/components/tickets/ticket-detail-helpers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { currentUser, replyFromAccounts } from "@/lib/current-user"

function PreviewTool({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-muted-foreground"
            aria-label={`${label} (preview only)`}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label} · Preview only</TooltipContent>
    </Tooltip>
  )
}

export function InboxReplyComposer({
  reply,
  feedback,
  onReplyChange,
  onSend,
}: {
  reply: string
  feedback: string | null
  onReplyChange: (value: string) => void
  onSend: () => void
}) {
  const [replyFrom, setReplyFrom] = React.useState<string>(
    replyFromAccounts[0]?.address ?? ""
  )
  const [macroQuery, setMacroQuery] = React.useState("")
  const [previewMessage, setPreviewMessage] = React.useState<string | null>(
    null
  )
  const selectedAccount =
    replyFromAccounts.find((account) => account.address === replyFrom) ??
    replyFromAccounts[0]
  const filteredMacros = macroSuggestions.filter((macro) =>
    macro.toLowerCase().includes(macroQuery.trim().toLowerCase())
  )

  const insertMacro = (macro: string) => {
    onReplyChange([reply.trim(), macro].filter(Boolean).join("\n\n"))
    setPreviewMessage(null)
  }

  return (
    <DiscussionComposerShell
      currentUser={{
        name: currentUser.name,
        avatarUrl: currentUser.avatar,
        email: currentUser.email,
      }}
      className="px-4 py-3 md:px-6 md:py-4"
      headerClassName="gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3"
      header={
        <>
          <span className="text-muted-foreground">Via</span>
          <Badge
            variant="secondary"
            className="h-8 rounded-full px-3 font-medium"
          >
            Email
          </Badge>
          <span className="hidden text-muted-foreground sm:inline">From</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 rounded-full px-3 font-medium"
                  aria-label={`Reply from ${selectedAccount?.label}`}
                />
              }
            >
              {selectedAccount?.label}
              <IconChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 pb-3 text-base font-semibold text-foreground">
                  Select account
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={replyFrom}
                  onValueChange={setReplyFrom}
                >
                  {replyFromAccounts.map((account) => (
                    <DropdownMenuRadioItem
                      key={account.address}
                      value={account.address}
                      className="mb-2 rounded-xl border border-border/70 px-3 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {account.label}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {account.description}
                        </div>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <textarea
        value={reply}
        onChange={(event) => onReplyChange(event.target.value)}
        placeholder="Comment or type '/' for commands"
        aria-label="Reply message"
        className="min-h-20 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70 lg:min-h-40"
      />
      <div className="border-t px-3 py-2.5 sm:py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <div
            role="toolbar"
            aria-label="Message tools"
            className="no-scrollbar flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap sm:flex-wrap sm:overflow-visible"
          >
            <PreviewTool
              label="Formatting"
              onClick={() =>
                setPreviewMessage(
                  "Formatting is not available in this preview."
                )
              }
            >
              <span className="text-base font-medium">T</span>
            </PreviewTool>
            <PreviewTool
              label="Emoji"
              onClick={() =>
                setPreviewMessage("Emoji is not available in this preview.")
              }
            >
              <IconMoodSmile className="size-4" />
            </PreviewTool>
            <PreviewTool
              label="Attachment"
              onClick={() =>
                setPreviewMessage(
                  "Attachments are not available in this preview."
                )
              }
            >
              <IconPaperclip className="size-4" />
            </PreviewTool>
            <PreviewTool
              label="Voice message"
              onClick={() =>
                setPreviewMessage(
                  "Voice messages are not available in this preview."
                )
              }
            >
              <IconMicrophone className="size-4" />
            </PreviewTool>
            <PreviewTool
              label="Image"
              onClick={() =>
                setPreviewMessage("Images are not available in this preview.")
              }
            >
              <IconPhoto className="size-4" />
            </PreviewTool>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-1 size-9 rounded-xl px-0 text-sm font-medium sm:w-auto sm:px-3"
                    aria-label="Macros"
                  />
                }
              >
                <IconBolt className="size-4 sm:hidden" />
                <span className="hidden sm:inline">Macros</span>
                <IconChevronDown className="hidden size-4 text-muted-foreground sm:inline" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[19rem] rounded-2xl p-0"
              >
                <div className="border-b border-border/70 px-4 py-3">
                  <div className="text-sm font-semibold text-foreground">
                    Add Macros
                  </div>
                  <div className="relative mt-3">
                    <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={macroQuery}
                      onChange={(event) => setMacroQuery(event.target.value)}
                      placeholder="Search macros"
                      className="h-10 rounded-xl border-border/70 pl-9"
                    />
                  </div>
                </div>
                <div className="scrollbar-hidden max-h-72 overflow-y-auto px-2 py-2">
                  <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
                    Suggested replies
                  </div>
                  {filteredMacros.map((macro) => (
                    <DropdownMenuItem
                      key={macro}
                      onClick={() => insertMacro(macro)}
                    >
                      {macro}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-xl px-3 text-sm font-medium"
              onClick={() =>
                setPreviewMessage(
                  "End Chat is not available in this preview. Use Resolve in the header."
                )
              }
            >
              End Chat
            </Button>
            <Button
              type="button"
              className="h-9 rounded-xl px-4"
              onClick={onSend}
              disabled={!reply.trim()}
            >
              Send <IconSend className="size-4" />
            </Button>
          </div>
        </div>
        {feedback || previewMessage ? (
          <p role="status" className="mt-2 text-xs text-muted-foreground">
            {previewMessage ?? feedback}
          </p>
        ) : null}
      </div>
    </DiscussionComposerShell>
  )
}
