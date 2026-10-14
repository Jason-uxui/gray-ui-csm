import assert from "node:assert/strict"
import { beforeEach, afterEach, test } from "node:test"
import {
  loadKnowledgeBaseSnapshot,
  saveKnowledgeBaseSnapshot,
  KNOWLEDGE_BASE_STORAGE_UPDATED_EVENT,
} from "../lib/knowledge-base/storage.ts"

const key = "gray-ui-csm:knowledge-base"
const legacyKey = "gray-ui-csm:knowledge-base-articles"
const fallback = {
  version: 1,
  seedRevision: 2,
  articles: [
    {
      id: "seed",
      title: "Current sample",
      status: "published",
      details: { tags: [] },
    },
  ],
  groups: [{ id: "group", label: "Articles", articleIds: ["seed"] }],
}
const edited = {
  ...fallback.articles[0],
  title: "My edited title",
  status: "draft",
  content: {
    format: "tiptap-json",
    document: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Saved content" }],
        },
      ],
    },
  },
  details: { tags: ["saved"], seo: { metaTitle: "Search title" } },
  versions: [{ id: "revision" }],
}
let events
const persisted = (value) => JSON.parse(JSON.stringify(value))
beforeEach(() => {
  const values = new Map()
  events = []
  globalThis.window = {
    localStorage: {
      getItem: (name) => values.get(name) ?? null,
      setItem: (name, value) => values.set(name, String(value)),
      removeItem: (name) => values.delete(name),
    },
    dispatchEvent: (event) => events.push(event.type),
  }
})
afterEach(() => {
  delete globalThis.window
})

test("save stamps the seed revision and reload keeps title, content, status and metadata", () => {
  saveKnowledgeBaseSnapshot({
    version: 1,
    articles: [edited],
    groups: fallback.groups,
  })
  assert.equal(
    JSON.parse(window.localStorage.getItem(key)).seedRevision,
    fallback.seedRevision
  )
  assert.deepEqual(
    persisted(loadKnowledgeBaseSnapshot(fallback).articles[0]),
    edited
  )
  assert.deepEqual(events, [KNOWLEDGE_BASE_STORAGE_UPDATED_EVENT])
})

test("a snapshot saved without a seed revision keeps an edited sample", () => {
  window.localStorage.setItem(
    key,
    JSON.stringify({ version: 1, articles: [edited], groups: fallback.groups })
  )
  assert.deepEqual(
    persisted(loadKnowledgeBaseSnapshot(fallback).articles[0]),
    edited
  )
})

test("refreshing an untouched old sample preserves user activity and pin state", () => {
  const comments = [{ id: "comment", body: "Saved comment" }]
  const old = {
    ...fallback.articles[0],
    title: "Old sample",
    isPinned: true,
    comments,
  }
  window.localStorage.setItem(
    key,
    JSON.stringify({ ...fallback, seedRevision: 1, articles: [old] })
  )
  const result = loadKnowledgeBaseSnapshot(fallback).articles[0]
  assert.equal(result.title, "Current sample")
  assert.equal(result.isPinned, true)
  assert.deepEqual(result.comments, comments)
})

test("seed upgrades retain custom articles and their group membership", () => {
  const custom = { ...edited, id: "custom" }
  window.localStorage.setItem(
    key,
    JSON.stringify({
      ...fallback,
      seedRevision: 1,
      articles: [custom],
      groups: [{ ...fallback.groups[0], articleIds: ["seed", "custom"] }],
    })
  )
  const result = loadKnowledgeBaseSnapshot(fallback)
  assert.deepEqual(
    result.articles.find((article) => article.id === "custom"),
    custom
  )
  assert.deepEqual(result.groups[0].articleIds, ["seed", "custom"])
})

test("legacy article storage migrates edited content without losing the draft", () => {
  window.localStorage.setItem(legacyKey, JSON.stringify([edited]))
  const result = loadKnowledgeBaseSnapshot(fallback)
  assert.deepEqual(persisted(result.articles[0]), edited)
  assert.equal(window.localStorage.getItem(legacyKey), null)
  assert.deepEqual(
    JSON.parse(window.localStorage.getItem(key)),
    persisted(result)
  )
})

test("malformed storage falls back safely and unavailable storage does not throw", () => {
  window.localStorage.setItem(key, "{broken")
  assert.deepEqual(loadKnowledgeBaseSnapshot(fallback), fallback)
  window.localStorage.setItem = () => {
    throw new Error("Quota exceeded")
  }
  assert.doesNotThrow(() => saveKnowledgeBaseSnapshot(fallback))
})
