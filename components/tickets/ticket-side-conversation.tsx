"use client"
import type { ReactNode } from "react"
import { IconMessages } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import type { Ticket } from "@/lib/tickets/types"
import { getTicketNumberLabel } from "./ticket-detail-helpers"
import {
  SideConversationContext,
  useSideConversation,
} from "./side-conversation/context"
import { SideConversationPanel } from "./side-conversation/panel"

export { useSideConversation } from "./side-conversation/context"
export { SideConversationPanel } from "./side-conversation/panel"
export { ForwardMessageAction } from "./side-conversation/forward-message-action"

export function SideConversationProvider({
  ticket,
  children,
}: {
  ticket: Ticket
  children: ReactNode
}) {
  return (
    <SideConversationContext ticket={ticket}>
      {children}
      <MobileSideConversation />
    </SideConversationContext>
  )
}
function MobileSideConversation() {
  const side = useSideConversation()
  return (
    <Sheet open={side.mobileOpen} onOpenChange={side.setMobileOpen}>
      <SheetContent className="bg-background data-[side=right]:w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Side Conversation</SheetTitle>
          <SheetDescription>
            Collaborate on {getTicketNumberLabel(side.ticket)}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
          <SideConversationPanel />
        </div>
      </SheetContent>
    </Sheet>
  )
}
export function SideConversationLauncher() {
  const side = useSideConversation()
  return (
    <Button variant="outline" className="xl:hidden" onClick={side.open}>
      <IconMessages />
      Side Conversation
    </Button>
  )
}
