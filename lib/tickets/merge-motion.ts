/** Demo latency belongs to the mock transaction, not the production dialog. */
export const MERGE_PREVIEW_DURATION_MS = 2200
// Match .merge-completion-toast: 700ms delay + 500ms entrance + 4s visible.
export const MERGE_TOAST_LIFETIME_MS = 700 + 500 + 4000

export function waitForMergePreview(
  signal: AbortSignal,
  duration = MERGE_PREVIEW_DURATION_MS
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Merge cancelled", "AbortError"))
      return
    }
    const cancel = () => {
      clearTimeout(timer)
      reject(new DOMException("Merge cancelled", "AbortError"))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancel)
      resolve()
    }, duration)
    signal.addEventListener("abort", cancel, { once: true })
  })
}
