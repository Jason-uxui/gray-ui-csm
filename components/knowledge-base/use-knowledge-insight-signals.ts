"use client"

import * as React from "react"

import type {
  KnowledgeInsightSignal,
  KnowledgeInsightSignalAction,
  KnowledgeInsightSignalSource,
} from "@/lib/knowledge-base/insights"

export type KnowledgeMatchingSignalView = KnowledgeInsightSignal & {
  source: KnowledgeInsightSignalSource
  action: KnowledgeInsightSignalAction
  isMuted: boolean
}

function normalizeMatchingSignal(
  signal: KnowledgeInsightSignal
): KnowledgeMatchingSignalView {
  return {
    ...signal,
    action:
      signal.action ??
      (signal.source === "suggested" ? "add" : "mute"),
    isMuted: signal.isMuted ?? false,
  }
}

export function useKnowledgeInsightSignals(
  sourceSignals: KnowledgeInsightSignal[]
) {
  const [signals, setSignals] = React.useState<KnowledgeMatchingSignalView[]>(
    () => sourceSignals.map(normalizeMatchingSignal)
  )

  React.useEffect(() => {
    setSignals(sourceSignals.map(normalizeMatchingSignal))
  }, [sourceSignals])

  const maxMatches = React.useMemo(
    () => Math.max(...signals.map((signal) => signal.matches30d), 1),
    [signals]
  )

  const sortedSignals = React.useMemo(
    () =>
      [...signals].sort((firstSignal, secondSignal) => {
        if (
          firstSignal.source === "suggested" &&
          secondSignal.source !== "suggested"
        ) {
          return 1
        }

        if (
          firstSignal.source !== "suggested" &&
          secondSignal.source === "suggested"
        ) {
          return -1
        }

        return secondSignal.matches30d - firstSignal.matches30d
      }),
    [signals]
  )

  function updateSignal(
    signalId: string,
    updater: (
      signal: KnowledgeMatchingSignalView
    ) => KnowledgeMatchingSignalView | null
  ) {
    setSignals((currentSignals) =>
      currentSignals.flatMap((signal) => {
        if (signal.id !== signalId) return [signal]
        const nextSignal = updater(signal)
        return nextSignal ? [nextSignal] : []
      })
    )
  }

  function handleToggleMute(signalId: string) {
    updateSignal(signalId, (signal) => ({
      ...signal,
      isMuted: !signal.isMuted,
    }))
  }

  function handleRemove(signalId: string) {
    updateSignal(signalId, () => null)
  }

  function handleAddSignal(signalId: string) {
    updateSignal(signalId, (signal) => ({
      ...signal,
      source: "manual",
      action: "mute",
      isMuted: false,
      missedSearchesLabel: undefined,
      status: "Manual signal",
    }))
  }

  return {
    signals,
    sortedSignals,
    maxMatches,
    handleAddSignal,
    handleToggleMute,
    handleRemove,
  }
}
