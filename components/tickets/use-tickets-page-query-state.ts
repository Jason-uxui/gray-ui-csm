"use client"

import { startTransition, useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  getLayoutFromSearchParam,
  getViewFromSearchParam,
} from "@/components/tickets/tickets-page-helpers"
import type { TicketLayoutMode, TicketQueueStatus, TicketViewKey } from "@/lib/tickets/types"

type UseTicketsPageQueryStateArgs = {
  initialView?: string | null
  initialLayout?: string | null
}

export function useTicketsPageQueryState({
  initialView = "all",
  initialLayout = "board",
}: UseTicketsPageQueryStateArgs = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeView = getViewFromSearchParam(searchParams.get("view") ?? initialView)
  const resolvedLayout = getLayoutFromSearchParam(
    searchParams.get("layout") ?? initialLayout
  )
  const activeTicketId = searchParams.get("ticket")

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | TicketQueueStatus>(
    "all"
  )
  const [activeLayout, setActiveLayout] = useState<TicketLayoutMode>(resolvedLayout)
  const [isStatsExpanded, setIsStatsExpanded] = useState(true)

  useEffect(() => {
    setActiveLayout(resolvedLayout)
  }, [resolvedLayout])

  const replaceSearchParams = useCallback(
    (nextSearchParams: URLSearchParams) => {
      startTransition(() => {
        router.replace(`${pathname}?${nextSearchParams.toString()}`, {
          scroll: false,
        })
      })
    },
    [pathname, router]
  )

  const createContextSearchParams = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("view", activeView)
    nextSearchParams.set("layout", activeLayout)
    return nextSearchParams
  }, [activeLayout, activeView, searchParams])

  const handleLayoutModeChange = useCallback(
    (layoutMode: TicketLayoutMode) => {
      if (layoutMode === activeLayout) return

      setActiveLayout(layoutMode)

      const nextSearchParams = new URLSearchParams(searchParams.toString())
      nextSearchParams.set("view", activeView)
      nextSearchParams.set("layout", layoutMode)
      replaceSearchParams(nextSearchParams)
    },
    [activeLayout, activeView, replaceSearchParams, searchParams]
  )

  return {
    activeView,
    activeTicketId,
    activeLayout,
    handleLayoutModeChange,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    isStatsExpanded,
    setIsStatsExpanded,
    createContextSearchParams,
    replaceSearchParams,
  }
}

export type TicketsPageStatusFilter = "all" | TicketQueueStatus
export type TicketsPageView = TicketViewKey
