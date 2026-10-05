"use client"
import { createContext, useContext, type ReactNode } from "react"
import type { Ticket } from "@/lib/tickets/types"
import { useSideConversationState } from "./use-side-conversation"

const SideContext = createContext<ReturnType<
  typeof useSideConversationState
> | null>(null)
export function SideConversationContext({
  ticket,
  children,
}: {
  ticket: Ticket
  children: ReactNode
}) {
  const state = useSideConversationState(ticket)
  return <SideContext.Provider value={state}>{children}</SideContext.Provider>
}
export function useSideConversation() {
  const value = useContext(SideContext)
  if (!value) throw new Error("Side conversation requires a ticket provider")
  return value
}
