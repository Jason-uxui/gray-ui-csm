export const MAX_MERGE_TARGETS = 2

/** Validate again at submit time, not just when filtering picker results. */
export function canMergeTickets(
  currentId: string,
  selectedIds: string[],
  availableIds: string[],
  unavailableIds: string[] = []
) {
  return (
    selectedIds.length > 0 &&
    selectedIds.length <= MAX_MERGE_TARGETS &&
    new Set(selectedIds).size === selectedIds.length &&
    selectedIds.every(
      (id) =>
        id !== currentId &&
        availableIds.includes(id) &&
        !unavailableIds.includes(id)
    )
  )
}
