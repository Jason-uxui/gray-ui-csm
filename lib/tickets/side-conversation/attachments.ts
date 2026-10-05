import type { ThreadAttachment } from "./types"

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
export const MAX_BATCH_FILES = 10
export const MAX_BATCH_BYTES = 20 * 1024 * 1024

export function readThreadAttachment(
  file: File,
  signal: AbortSignal
): Promise<ThreadAttachment> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Cancelled", "AbortError"))
      return
    }
    const reader = new FileReader()
    const abort = () => reader.abort()
    const cleanup = () => signal.removeEventListener("abort", abort)
    signal.addEventListener("abort", abort, { once: true })
    reader.onload = () => {
      cleanup()
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        url: String(reader.result),
        image: file.type.startsWith("image/"),
      })
    }
    reader.onerror = () => {
      cleanup()
      reject(new Error("This file could not be opened. Try again."))
    }
    reader.onabort = () => {
      cleanup()
      reject(new DOMException("Cancelled", "AbortError"))
    }
    reader.readAsDataURL(file)
  })
}
type AttachmentCallbacks = {
  start: (owner: string) => void
  complete: (owner: string, files: ThreadAttachment[]) => void
  error: (owner: string, message: string) => void
  finish: (owner: string) => void
}
/** Owns pending reads outside the composer so changing tabs cannot lose files. */
export function createAttachmentQueue(
  callbacks: AttachmentCallbacks,
  read = readThreadAttachment
) {
  const pending = new Map<string, Set<AbortController>>()
  let disposed = false
  return {
    isPending(owner: string) {
      return !!pending.get(owner)?.size
    },
    async add(owner: string, files: File[]) {
      if (disposed || !files.length) return
      if (files.some((file) => file.size > MAX_ATTACHMENT_BYTES)) {
        callbacks.error(owner, "Choose files smaller than 5 MB each.")
        return
      }
      if (
        files.length > MAX_BATCH_FILES ||
        files.reduce((sum, file) => sum + file.size, 0) > MAX_BATCH_BYTES
      ) {
        callbacks.error(owner, "Choose up to 10 files and 20 MB per selection.")
        return
      }
      const controller = new AbortController()
      const batch = pending.get(owner) ?? new Set<AbortController>()
      batch.add(controller)
      pending.set(owner, batch)
      callbacks.start(owner)
      try {
        const added = await Promise.all(
          files.map((file) => read(file, controller.signal))
        )
        if (!disposed) callbacks.complete(owner, added)
      } catch (error) {
        controller.abort()
        if (!disposed)
          callbacks.error(
            owner,
            error instanceof Error
              ? error.message
              : "Could not attach this file."
          )
      } finally {
        batch.delete(controller)
        if (!batch.size) pending.delete(owner)
        if (!disposed) callbacks.finish(owner)
      }
    },
    dispose() {
      disposed = true
      for (const batch of pending.values())
        for (const controller of batch) controller.abort()
      pending.clear()
    },
  }
}
