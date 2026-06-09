import type { JSONContent } from "@tiptap/react"

import type { KnowledgeArticle } from "@/lib/knowledge-base/types"

export const suggestedCustomerReplyHeading = "Suggested customer reply"

export function normalizeSafeArticleHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined

  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined
    }

    return url.toString()
  } catch {
    return undefined
  }
}

function textNode(text: string): JSONContent {
  return {
    type: "text",
    text,
  }
}

function paragraph(text: string): JSONContent {
  return {
    type: "paragraph",
    content: text ? [textNode(text)] : undefined,
  }
}

function heading(text: string, level: 2 | 3): JSONContent {
  return {
    type: "heading",
    attrs: { level },
    content: [textNode(text)],
  }
}

function blockquote(text: string): JSONContent {
  return {
    type: "blockquote",
    content: [paragraph(text)],
  }
}

export function getTextContent(node: JSONContent): string {
  if (node.text) return node.text
  return node.content?.map(getTextContent).join("") ?? ""
}

export function isSuggestedReplyHeading(node: JSONContent) {
  return getTextContent(node).toLowerCase().includes("suggested customer reply")
}

export function extractCustomerReplyFromDocument(
  document: JSONContent
): string | undefined {
  const blocks = document.content ?? []

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]
    if (!block || !isSuggestedReplyHeading(block)) continue

    const nextBlock = blocks[index + 1]
    if (nextBlock?.type !== "paragraph") continue

    const reply = getTextContent(nextBlock).trim()
    return reply.length > 0 ? reply : undefined
  }

  return undefined
}

export function createKnowledgeArticleDocument(
  article: KnowledgeArticle
): JSONContent {
  return {
    type: "doc",
    content: [
      paragraph(article.summary),
      ...(article.quickPath ? [blockquote(article.quickPath)] : []),
      ...article.sections.flatMap((section) => [
        heading(section.title, 2),
        paragraph(section.body),
      ]),
      heading(suggestedCustomerReplyHeading, 2),
      paragraph(article.customerReply),
    ],
  }
}

export function getKnowledgeArticleDocument(article: KnowledgeArticle) {
  return article.content?.document ?? createKnowledgeArticleDocument(article)
}

export function createEmptyKnowledgeArticleDocument(): JSONContent {
  return {
    type: "doc",
    content: [
      paragraph(""),
      heading(suggestedCustomerReplyHeading, 2),
      paragraph(""),
    ],
  }
}
