"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SideConversationMode } from "@/lib/tickets/side-conversation/types"
import { useSideConversation } from "./context"
import { ThreadPanel } from "./thread-panel"
import { EmailPanel } from "./email-panel"
import { ChildTicketsPanel } from "./child-tickets-panel"

export function SideConversationPanel() {
  const side = useSideConversation()
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
      {!(side.mode === "thread" && side.target) && (
        <Tabs
          value={side.mode}
          onValueChange={(value) => side.setMode(value as SideConversationMode)}
        >
          <TabsList
            variant="line"
            className="w-full justify-between border-b border-border"
          >
            <TabsTrigger value="thread">Thread</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="children">Child Tickets</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {side.notice && (
        <p role="status" className="text-xs text-muted-foreground">
          {side.notice}
        </p>
      )}
      {side.mode === "thread" && <ThreadPanel />}
      {side.mode === "email" && <EmailPanel />}
      {side.mode === "children" && <ChildTicketsPanel />}
    </div>
  )
}
