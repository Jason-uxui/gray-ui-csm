"use client"

import { useEffect, useRef } from "react"
import type {
  RemoteSession,
  SessionAction,
} from "@/lib/tickets/remote-assist/types"
import {
  sampleCustomerAction,
  sampleCustomerResponse,
} from "@/lib/tickets/remote-assist/sample-customer"

export function useSampleCustomer(
  session: RemoteSession,
  onAction: (action: SessionAction) => void
) {
  const actionRef = useRef(onAction)
  useEffect(() => {
    actionRef.current = onAction
  }, [onAction])
  useEffect(() => {
    const response = sampleCustomerResponse(session)
    if (!response) return
    const timer = window.setTimeout(() => {
      const action = sampleCustomerAction(session, Date.now())
      if (action) actionRef.current(action)
    }, response.delayMs)
    return () => window.clearTimeout(timer)
  }, [session])
}
