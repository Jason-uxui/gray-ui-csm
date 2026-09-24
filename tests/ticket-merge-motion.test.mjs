import assert from "node:assert/strict"
import test from "node:test"
import { waitForMergePreview } from "../lib/tickets/merge-motion.ts"

test("mock operation remains pending until its preview duration", async () => {
  const controller = new AbortController()
  let done = false
  const operation = waitForMergePreview(controller.signal, 20).then(() => {
    done = true
  })
  await Promise.resolve()
  assert.equal(done, false)
  await operation
  assert.equal(done, true)
})

test("cancel rejects the pending operation before a caller can commit", async () => {
  const controller = new AbortController()
  const operation = waitForMergePreview(controller.signal)
  controller.abort()
  await assert.rejects(operation, { name: "AbortError" })
})

test("an already-cancelled operation never starts", async () => {
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(waitForMergePreview(controller.signal), {
    name: "AbortError",
  })
})
