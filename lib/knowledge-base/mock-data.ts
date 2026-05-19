import type { KnowledgeArticle } from "@/lib/knowledge-base/types"
import type { Ticket } from "@/lib/tickets/types"

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "kb-return-refund-policy",
    title: "Return and refund policy",
    summary:
      "Step-by-step guide for returning a product, exchanging an item, or requesting a refund within 30 days of purchase.",
    category: "other",
    status: "published",
    updatedAt: "Updated 3 days ago",
    author: { name: "Arlene McCoy" },
    matchScore: "high",
    views: 241,
    helpfulRate: 78,
    linkedTickets: 12,
    matchReasons: ["wrong product", "return", "swap", "refund"],
    quickPath: "Account > Orders > Select order > Return / Exchange",
    media: [
      {
        type: "image",
        title: "Return request screen",
        caption: "Example state after a customer selects the order to return.",
      },
      {
        type: "video",
        title: "Return and exchange walkthrough",
        duration: "2:14",
      },
    ],
    sections: [
      {
        title: "Return window",
        body: "Customers can request a return or exchange within 30 days of purchase when the item is unused and in original packaging.",
      },
      {
        title: "Before shipment",
        body: "If the order is still processing, the customer can cancel it from order history and place a new order with the correct item.",
      },
      {
        title: "Exchange process",
        body: "For a different variant, color, or size, select Exchange instead of Return. The replacement ships after the original item is received.",
      },
      {
        title: "Refund timeline",
        body: "Refunds are usually processed within 5-7 business days after the returned item is received and reviewed.",
      },
    ],
    customerReply:
      "Here is our return and exchange guide for this situation: Return and refund policy. It explains how to start a return, exchange an item, or cancel before shipment when the order is still processing.",
  },
  {
    id: "kb-cancel-order",
    title: "How to cancel an order before shipment",
    summary:
      "Cancel or modify an order while it is still in processing status from the customer account dashboard.",
    category: "other",
    status: "published",
    updatedAt: "Updated 1 week ago",
    author: { name: "Santi Cazorla" },
    matchScore: "medium",
    views: 189,
    helpfulRate: 65,
    linkedTickets: 7,
    matchReasons: ["cancel order", "processing", "wrong item"],
    quickPath: "Account > Orders > Processing orders > Cancel order",
    sections: [
      {
        title: "When cancellation is available",
        body: "Customers can cancel an order while its status is Processing. Once the item has shipped, they need to use the return flow.",
      },
      {
        title: "Customer steps",
        body: "Open order history, select the active order, then choose Cancel order. A confirmation email is sent after cancellation succeeds.",
      },
    ],
    customerReply:
      "If your order is still processing, you may be able to cancel it from Account > Orders and reorder the correct item. Once it ships, the return or exchange flow is the right path.",
  },
  {
    id: "kb-product-exchange",
    title: "Product exchange process",
    summary:
      "How to swap a product for a different variant, color, or size through the support portal.",
    category: "other",
    status: "published",
    updatedAt: "Updated 6 days ago",
    author: { name: "Jerome Bell" },
    matchScore: "medium",
    views: 92,
    helpfulRate: 71,
    linkedTickets: 5,
    matchReasons: ["exchange", "variant", "wrong color"],
    quickPath: "Support portal > Orders > Exchange item",
    sections: [
      {
        title: "Exchange requirements",
        body: "The original product must be unused and returned in its original packaging before the replacement item is shipped.",
      },
      {
        title: "Replacement timing",
        body: "Replacement orders are created after the return scan is received. Customers receive tracking as soon as the replacement ships.",
      },
    ],
    customerReply:
      "For exchanges, start from the support portal and choose Exchange item. The replacement is created after the original item is returned.",
  },
  {
    id: "kb-billing-seat-update",
    title: "Adding seats to a subscription",
    summary:
      "How account admins can add seats, review prorated billing, and confirm invoice changes before the next renewal.",
    category: "subscription",
    status: "published",
    updatedAt: "Updated 1 day ago",
    author: { name: "Santi Cazorla" },
    matchScore: "high",
    views: 324,
    helpfulRate: 84,
    linkedTickets: 21,
    matchReasons: ["subscription", "seat", "billing", "invoice"],
    quickPath: "Admin Center > Account > Billing > Subscription",
    media: [
      {
        type: "image",
        title: "Billing workspace overview",
        caption:
          "Gradient mock showing the subscription workspace, seat allocation, and invoice preview area.",
        src: "/knowledge-base/billing-seat-wallpaper.png",
      },
    ],
    sections: [
      {
        title: "When to use this article",
        body: "Use this when a customer needs more paid seats, asks why the invoice changed after adding teammates, or wants confirmation before the next renewal. The flow applies to active paid subscriptions only.",
      },
      {
        title: "Who can add seats",
        body: "Only account admins and billing owners can add seats to a paid subscription. If the requester is a workspace member, ask them to contact an admin or add the current billing owner to the thread.",
      },
      {
        title: "Add seats from billing",
        body: "Open Admin Center > Account > Billing > Subscription, choose Add seats, enter the number of additional seats, and review the updated seat count before continuing.",
      },
      {
        title: "Review prorated cost",
        body: "The checkout preview shows the prorated cost for the current billing cycle, the next renewal amount, tax if applicable, and the payment method that will be charged.",
      },
      {
        title: "Confirm invoice changes",
        body: "After confirmation, the new seats become available immediately. The prorated charge appears on the next invoice summary and the account activity log records the admin who approved the change.",
      },
      {
        title: "Troubleshooting",
        body: "If Add seats is disabled, check whether the account is on a trial, has an unpaid invoice, uses reseller billing, or has a pending subscription change. Escalate to Billing Operations when the invoice preview fails to load.",
      },
      {
        title: "Suggested customer reply",
        body: "An account admin can add seats from Admin Center > Account > Billing > Subscription. Before confirming, they will see the prorated charge for this billing cycle and the updated renewal amount.",
      },
    ],
    customerReply:
      "An account admin can add seats from Admin Center > Account > Billing > Subscription. Before confirming, they will see the prorated charge for this billing cycle and the updated renewal amount.",
  },
  {
    id: "kb-login-reset",
    title: "Resetting account access",
    summary:
      "Troubleshoot login blocks, password reset issues, and admin-assisted account recovery.",
    category: "account-login",
    status: "published",
    updatedAt: "Updated 4 days ago",
    author: { name: "Amina Rahman" },
    matchScore: "high",
    views: 176,
    helpfulRate: 74,
    linkedTickets: 9,
    matchReasons: ["login", "access", "password", "reset"],
    quickPath: "Sign in > Forgot password > Verify email",
    sections: [
      {
        title: "Self-service reset",
        body: "Customers can reset their password from the sign-in screen after verifying the email tied to their account.",
      },
      {
        title: "Admin recovery",
        body: "If the customer no longer has email access, an account admin can verify ownership and request support-assisted recovery.",
      },
    ],
    customerReply:
      "For access issues, start with Forgot password on the sign-in screen. If you no longer have access to that email, an account admin can request recovery.",
  },
]

const categoryFallbackOrder = [
  "kb-return-refund-policy",
  "kb-cancel-order",
  "kb-product-exchange",
]

export function getSuggestedKnowledgeArticles(ticket: Ticket) {
  const searchableText = [
    ticket.subject,
    ticket.category,
    ticket.ticketType,
    ...(ticket.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  const scoredArticles = knowledgeArticles
    .map((article) => {
      const categoryScore = article.category === ticket.category ? 4 : 0
      const reasonScore = article.matchReasons.reduce((score, reason) => {
        return searchableText.includes(reason.toLowerCase()) ? score + 2 : score
      }, 0)
      const returnIntentScore = /wrong|return|swap|exchange|order|product/.test(
        searchableText
      )
        ? categoryFallbackOrder.includes(article.id)
          ? 3
          : 0
        : 0

      return {
        article,
        score: categoryScore + reasonScore + returnIntentScore,
      }
    })
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score
      return second.article.helpfulRate - first.article.helpfulRate
    })

  return scoredArticles.slice(0, 3).map(({ article }) => article)
}
