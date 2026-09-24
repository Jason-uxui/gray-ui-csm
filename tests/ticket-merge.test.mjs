import assert from "node:assert/strict"
import test from "node:test"
import { canMergeTickets } from "../lib/tickets/merge.ts"

const available = ["current", "a", "b", "c"]
test("one or two distinct source tickets can be merged", () => {
  assert.equal(canMergeTickets("current", ["a"], available), true)
  assert.equal(canMergeTickets("current", ["a", "b"], available), true)
})
test("a source is required", () => {
  assert.equal(canMergeTickets("current", [], available), false)
})
test("the current ticket cannot be selected", () => {
  assert.equal(canMergeTickets("current", ["current"], available), false)
})
test("duplicate sources and excessive selections are rejected", () => {
  assert.equal(canMergeTickets("current", ["a", "a"], available), false)
  assert.equal(canMergeTickets("current", ["a", "b", "c"], available), false)
})
test("missing or previously merged sources are rejected at submission", () => {
  assert.equal(canMergeTickets("current", ["deleted"], available), false)
  assert.equal(canMergeTickets("current", ["a"], available, ["a"]), false)
  assert.equal(canMergeTickets("current", ["a", "b"], available, ["b"]), false)
})
