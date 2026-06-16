import type {
  KnowledgeArticle,
  KnowledgeArticleActivity,
  KnowledgeArticleComment,
  KnowledgeArticleExplorerGroup,
  KnowledgeArticleResolvedGroup,
} from "@/lib/knowledge-base/types"
import type { Ticket } from "@/lib/tickets/types"

const sharedPreviewImage = {
  type: "image" as const,
  title: "Billing workspace overview",
  caption:
    "Gradient mock showing the subscription workspace, seat allocation, and invoice preview area.",
  src: "/knowledge-base/billing-seat-wallpaper.png",
}

type KnowledgeArticleDiscussionSeed = {
  comments?: KnowledgeArticleComment[]
  activity?: KnowledgeArticleActivity[]
}

const knowledgeArticleDiscussionById: Record<
  string,
  KnowledgeArticleDiscussionSeed
> = {
  "kb-cancel-order": {
    comments: [
      {
        id: "kb-cancel-order-comment-1",
        articleId: "kb-cancel-order",
        author: { name: "Nina Flores" },
        timestamp: "Yesterday, 11:12 AM",
        body: "Can we call out that cancellation disappears after fulfillment starts? Agents keep asking where the button went.",
        badge: "Support",
        status: "open",
      },
      {
        id: "kb-cancel-order-comment-2",
        articleId: "kb-cancel-order",
        author: { name: "Santi Cazorla" },
        timestamp: "Today, 8:16 AM",
        body: "Added the shipped-order handoff to the return flow so the answer does not stop at a dead end.",
        badge: "Content",
        status: "resolved",
      },
    ],
  },
  "kb-product-exchange": {
    comments: [
      {
        id: "kb-product-exchange-comment-1",
        articleId: "kb-product-exchange",
        author: { name: "Jerome Bell" },
        timestamp: "2 days ago",
        body: "The replacement timing section should stay short. Support only needs the scan trigger and tracking expectation.",
        badge: "Editorial",
        status: "resolved",
      },
      {
        id: "kb-product-exchange-comment-2",
        articleId: "kb-product-exchange",
        author: { name: "Arlene McCoy" },
        timestamp: "Yesterday, 2:03 PM",
        body: "Please add a caveat for limited-stock variants before this goes into the next customer reply bundle.",
        badge: "Review",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-product-exchange-activity-1",
        articleId: "kb-product-exchange",
        title: "Exchange requirements reviewed",
        timestamp: "3 days ago",
        detail: "Jerome Bell confirmed the return-scan requirement with fulfillment operations.",
        tone: "positive",
      },
      {
        id: "kb-product-exchange-activity-2",
        articleId: "kb-product-exchange",
        title: "Limited-stock note requested",
        timestamp: "Yesterday, 2:03 PM",
        detail: "A reviewer asked for guidance when a requested replacement variant is unavailable.",
        tone: "warning",
      },
    ],
  },
  "kb-billing-seat-update": {
    comments: [
      {
        id: "kb-billing-seat-update-comment-1",
        articleId: "kb-billing-seat-update",
        author: { name: "Nina Flores" },
        timestamp: "Yesterday, 3:05 PM",
        body: "The proration explanation is strong, but we should avoid saying taxes always appear in the preview.",
        badge: "Billing",
        status: "open",
      },
      {
        id: "kb-billing-seat-update-comment-2",
        articleId: "kb-billing-seat-update",
        author: { name: "Santi Cazorla" },
        timestamp: "Today, 8:58 AM",
        body: "Adjusted the wording to say tax appears when applicable and kept the renewal amount callout.",
        badge: "Content",
        status: "resolved",
      },
      {
        id: "kb-billing-seat-update-comment-3",
        articleId: "kb-billing-seat-update",
        author: { name: "Arlene McCoy" },
        timestamp: "Today, 1:14 PM",
        body: "Can we reuse this reply in the billing queue macro after the next content sync?",
        badge: "Follow-up",
        status: "open",
      },
    ],
  },
  "kb-login-reset": {
    comments: [
      {
        id: "kb-login-reset-comment-1",
        articleId: "kb-login-reset",
        author: { name: "Amina Rahman" },
        timestamp: "3 days ago",
        body: "I separated self-service reset from admin recovery so agents can pick the right path faster.",
        badge: "Content",
        status: "resolved",
      },
      {
        id: "kb-login-reset-comment-2",
        articleId: "kb-login-reset",
        author: { name: "Liam Chen" },
        timestamp: "Today, 9:01 AM",
        body: "We should link this to the magic-link article once the access group gets cross-article links.",
        badge: "Follow-up",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-login-reset-activity-1",
        articleId: "kb-login-reset",
        title: "Admin recovery section added",
        timestamp: "4 days ago",
        detail: "The article now distinguishes lost-password recovery from email-ownership recovery.",
        tone: "neutral",
      },
      {
        id: "kb-login-reset-activity-2",
        articleId: "kb-login-reset",
        title: "Access queue linked",
        timestamp: "3 days ago",
        detail: "The article was attached to login block and password reset ticket suggestions.",
        tone: "positive",
      },
    ],
  },
  "kb-2fa-recovery-codes": {
    comments: [
      {
        id: "kb-2fa-recovery-codes-comment-1",
        articleId: "kb-2fa-recovery-codes",
        author: { name: "Priya Desai" },
        timestamp: "Yesterday, 10:27 AM",
        body: "Please keep the no-backup-code escalation language precise. This is easy to over-promise.",
        badge: "Security",
        status: "open",
      },
      {
        id: "kb-2fa-recovery-codes-comment-2",
        articleId: "kb-2fa-recovery-codes",
        author: { name: "Liam Chen" },
        timestamp: "Yesterday, 4:54 PM",
        body: "Good call. I softened the bypass wording and made verification the first explicit step.",
        badge: "Content",
        status: "resolved",
      },
    ],
    activity: [
      {
        id: "kb-2fa-recovery-codes-activity-1",
        articleId: "kb-2fa-recovery-codes",
        title: "Security language reviewed",
        timestamp: "Yesterday, 4:54 PM",
        detail: "The temporary bypass guidance was updated after review from the security support queue.",
        tone: "success",
      },
      {
        id: "kb-2fa-recovery-codes-activity-2",
        articleId: "kb-2fa-recovery-codes",
        title: "Recovery workflow tagged",
        timestamp: "Today, 8:35 AM",
        detail: "Tagged for authenticator, backup code, and account verification ticket matching.",
        tone: "neutral",
      },
    ],
  },
  "kb-card-charge-failed": {
    comments: [
      {
        id: "kb-card-charge-failed-comment-1",
        articleId: "kb-card-charge-failed",
        author: { name: "Nina Flores" },
        timestamp: "5 days ago",
        body: "Added the grace-period note because agents were answering seat access differently across renewal failures.",
        badge: "Billing",
        status: "resolved",
      },
      {
        id: "kb-card-charge-failed-comment-2",
        articleId: "kb-card-charge-failed",
        author: { name: "Santi Cazorla" },
        timestamp: "Today, 1:20 PM",
        body: "Can we mention 3DS confirmation in the customer reply, or should it stay in the agent-only context?",
        badge: "Question",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-card-charge-failed-activity-1",
        articleId: "kb-card-charge-failed",
        title: "Renewal failure scenarios expanded",
        timestamp: "8 days ago",
        detail: "Issuer declines, expired cards, 3DS prompts, and temporary bank limits were added as common causes.",
        tone: "neutral",
      },
      {
        id: "kb-card-charge-failed-activity-2",
        articleId: "kb-card-charge-failed",
        title: "Billing review completed",
        timestamp: "5 days ago",
        detail: "Billing operations confirmed the retry guidance and seat access expectations.",
        tone: "success",
      },
    ],
  },
  "kb-download-invoice-pdf": {
    comments: [
      {
        id: "kb-download-invoice-pdf-comment-1",
        articleId: "kb-download-invoice-pdf",
        author: { name: "Arlene McCoy" },
        timestamp: "2 days ago",
        body: "This needs a localization pass before publishing. VAT wording differs for a few supported regions.",
        badge: "Review",
        status: "open",
      },
      {
        id: "kb-download-invoice-pdf-comment-2",
        articleId: "kb-download-invoice-pdf",
        author: { name: "Nina Flores" },
        timestamp: "Today, 9:45 AM",
        body: "I can verify the tax ID update flow once billing profile permissions are final.",
        badge: "Billing",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-download-invoice-pdf-activity-1",
        articleId: "kb-download-invoice-pdf",
        title: "Marked needs review",
        timestamp: "5 days ago",
        detail: "The article was moved back to review while VAT-compliant invoice language is checked.",
        tone: "warning",
      },
      {
        id: "kb-download-invoice-pdf-activity-2",
        articleId: "kb-download-invoice-pdf",
        title: "Billing owner note added",
        timestamp: "2 days ago",
        detail: "Invoice download permissions now call out billing owners explicitly.",
        tone: "neutral",
      },
    ],
  },
  "kb-api-rate-limit": {
    comments: [
      {
        id: "kb-api-rate-limit-comment-1",
        articleId: "kb-api-rate-limit",
        author: { name: "Jerome Bell" },
        timestamp: "4 days ago",
        body: "Added Retry-After guidance so we stop recommending fixed retry intervals in integration tickets.",
        badge: "Technical",
        status: "resolved",
      },
      {
        id: "kb-api-rate-limit-comment-2",
        articleId: "kb-api-rate-limit",
        author: { name: "Amina Rahman" },
        timestamp: "Yesterday, 3:28 PM",
        body: "Can the customer reply mention jitter without sounding too engineering-heavy?",
        badge: "Review",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-api-rate-limit-activity-1",
        articleId: "kb-api-rate-limit",
        title: "Developer docs aligned",
        timestamp: "9 days ago",
        detail: "Rate limit copy was synced with the public developer docs response-header guidance.",
        tone: "positive",
      },
      {
        id: "kb-api-rate-limit-activity-2",
        articleId: "kb-api-rate-limit",
        title: "Backoff recommendation updated",
        timestamp: "4 days ago",
        detail: "Exponential backoff with jitter replaced the previous fixed-delay retry wording.",
        tone: "success",
      },
      {
        id: "kb-api-rate-limit-activity-3",
        articleId: "kb-api-rate-limit",
        title: "Customer reply review opened",
        timestamp: "Yesterday, 3:28 PM",
        detail: "A reviewer requested a less technical version of the retry guidance for customer replies.",
        tone: "warning",
      },
    ],
  },
  "kb-webhook-signature-failed": {
    comments: [
      {
        id: "kb-webhook-signature-failed-comment-1",
        articleId: "kb-webhook-signature-failed",
        author: { name: "Jerome Bell" },
        timestamp: "3 days ago",
        body: "This should stay in needs-review until we add framework-specific raw body examples.",
        badge: "Technical",
        status: "open",
      },
      {
        id: "kb-webhook-signature-failed-comment-2",
        articleId: "kb-webhook-signature-failed",
        author: { name: "Amina Rahman" },
        timestamp: "Today, 11:06 AM",
        body: "I added the staging versus production secret check because that has been the top repeat cause.",
        badge: "Content",
        status: "resolved",
      },
    ],
    activity: [
      {
        id: "kb-webhook-signature-failed-activity-1",
        articleId: "kb-webhook-signature-failed",
        title: "Marked needs review",
        timestamp: "11 days ago",
        detail: "The webhook article was held for technical review before publishing examples.",
        tone: "warning",
      },
      {
        id: "kb-webhook-signature-failed-activity-2",
        articleId: "kb-webhook-signature-failed",
        title: "Secret mismatch section updated",
        timestamp: "Today, 11:06 AM",
        detail: "Production and staging endpoint secret checks were added to the diagnosis path.",
        tone: "neutral",
      },
    ],
  },
  "kb-change-plan-annual-monthly": {
    comments: [
      {
        id: "kb-change-plan-annual-monthly-comment-1",
        articleId: "kb-change-plan-annual-monthly",
        author: { name: "Nina Flores" },
        timestamp: "6 days ago",
        body: "Draft is directionally right, but credit handling needs finance sign-off before agents quote it.",
        badge: "Billing",
        status: "open",
      },
      {
        id: "kb-change-plan-annual-monthly-comment-2",
        articleId: "kb-change-plan-annual-monthly",
        author: { name: "Santi Cazorla" },
        timestamp: "Yesterday, 5:19 PM",
        body: "I kept the customer reply neutral and avoided promising immediate cadence changes.",
        badge: "Content",
        status: "resolved",
      },
    ],
    activity: [
      {
        id: "kb-change-plan-annual-monthly-activity-1",
        articleId: "kb-change-plan-annual-monthly",
        title: "Draft created",
        timestamp: "12 days ago",
        detail: "Santi Cazorla drafted the annual-to-monthly plan change guidance.",
        tone: "neutral",
      },
      {
        id: "kb-change-plan-annual-monthly-activity-2",
        articleId: "kb-change-plan-annual-monthly",
        title: "Finance review requested",
        timestamp: "6 days ago",
        detail: "Credit treatment language was flagged for finance operations review.",
        tone: "warning",
      },
    ],
  },
  "kb-transfer-workspace-ownership": {
    comments: [
      {
        id: "kb-transfer-workspace-ownership-comment-1",
        articleId: "kb-transfer-workspace-ownership",
        author: { name: "Liam Chen" },
        timestamp: "4 days ago",
        body: "The post-transfer checklist should stay visible because billing contact misses create follow-up tickets.",
        badge: "Security",
        status: "resolved",
      },
      {
        id: "kb-transfer-workspace-ownership-comment-2",
        articleId: "kb-transfer-workspace-ownership",
        author: { name: "Priya Desai" },
        timestamp: "Today, 12:42 PM",
        body: "Can we add API token ownership caveats after the next permissions update?",
        badge: "Follow-up",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-transfer-workspace-ownership-activity-1",
        articleId: "kb-transfer-workspace-ownership",
        title: "Ownership prerequisites updated",
        timestamp: "10 days ago",
        detail: "The article now states that the recipient must already be an active admin.",
        tone: "neutral",
      },
      {
        id: "kb-transfer-workspace-ownership-activity-2",
        articleId: "kb-transfer-workspace-ownership",
        title: "Security checklist reviewed",
        timestamp: "4 days ago",
        detail: "Billing contact, API tokens, and security notifications were kept in the post-transfer checks.",
        tone: "success",
      },
    ],
  },
  "kb-login-magic-link-expired": {
    comments: [
      {
        id: "kb-login-magic-link-expired-comment-1",
        articleId: "kb-login-magic-link-expired",
        author: { name: "Amina Rahman" },
        timestamp: "3 days ago",
        body: "Security scanners consuming links is worth keeping. It explains a surprising number of enterprise reports.",
        badge: "Support",
        status: "resolved",
      },
      {
        id: "kb-login-magic-link-expired-comment-2",
        articleId: "kb-login-magic-link-expired",
        author: { name: "Liam Chen" },
        timestamp: "Today, 8:44 AM",
        body: "Let's cross-link this with password reset once article references are editable.",
        badge: "Follow-up",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-login-magic-link-expired-activity-1",
        articleId: "kb-login-magic-link-expired",
        title: "Security scanner cause added",
        timestamp: "7 days ago",
        detail: "The article now explains why some email links are consumed before the customer opens them.",
        tone: "neutral",
      },
      {
        id: "kb-login-magic-link-expired-activity-2",
        articleId: "kb-login-magic-link-expired",
        title: "Access queue suggestion enabled",
        timestamp: "3 days ago",
        detail: "Magic-link expiry tickets now surface this article in suggested replies.",
        tone: "positive",
      },
    ],
  },
  "kb-browser-cache-login-fix": {
    comments: [
      {
        id: "kb-browser-cache-login-fix-comment-1",
        articleId: "kb-browser-cache-login-fix",
        author: { name: "Liam Chen" },
        timestamp: "2 days ago",
        body: "This is still draft because we need browser-specific steps for Safari and Firefox.",
        badge: "Draft",
        status: "open",
      },
      {
        id: "kb-browser-cache-login-fix-comment-2",
        articleId: "kb-browser-cache-login-fix",
        author: { name: "Amina Rahman" },
        timestamp: "Today, 2:11 PM",
        body: "The private-window diagnostic is useful. Please keep it before any destructive cache clearing step.",
        badge: "Review",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-browser-cache-login-fix-activity-1",
        articleId: "kb-browser-cache-login-fix",
        title: "Draft opened",
        timestamp: "9 days ago",
        detail: "A draft article was created for stale browser session troubleshooting.",
        tone: "neutral",
      },
      {
        id: "kb-browser-cache-login-fix-activity-2",
        articleId: "kb-browser-cache-login-fix",
        title: "Browser-specific steps requested",
        timestamp: "2 days ago",
        detail: "Reviewers asked for Safari and Firefox variants before publishing.",
        tone: "warning",
      },
    ],
  },
  "kb-export-failed-timeout": {
    comments: [
      {
        id: "kb-export-failed-timeout-comment-1",
        articleId: "kb-export-failed-timeout",
        author: { name: "Jerome Bell" },
        timestamp: "Yesterday, 1:18 PM",
        body: "The job ID escalation note is good. It gives engineering what they need without asking customers for logs.",
        badge: "Technical",
        status: "resolved",
      },
      {
        id: "kb-export-failed-timeout-comment-2",
        articleId: "kb-export-failed-timeout",
        author: { name: "Nina Flores" },
        timestamp: "Today, 10:33 AM",
        body: "Could we add a line about partial exports? That comes up for larger report ranges.",
        badge: "Review",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-export-failed-timeout-activity-1",
        articleId: "kb-export-failed-timeout",
        title: "Retry guidance published",
        timestamp: "6 days ago",
        detail: "The article now recommends smaller date ranges before escalating failed export jobs.",
        tone: "success",
      },
      {
        id: "kb-export-failed-timeout-activity-2",
        articleId: "kb-export-failed-timeout",
        title: "Partial export follow-up opened",
        timestamp: "Today, 10:33 AM",
        detail: "A reviewer requested clearer wording for export jobs that complete partially.",
        tone: "warning",
      },
    ],
  },
  "kb-domain-verification-stuck": {
    comments: [
      {
        id: "kb-domain-verification-stuck-comment-1",
        articleId: "kb-domain-verification-stuck",
        author: { name: "Nina Flores" },
        timestamp: "2 days ago",
        body: "Needs review until the DNS provider examples are checked. The generic flow is ready.",
        badge: "Review",
        status: "open",
      },
      {
        id: "kb-domain-verification-stuck-comment-2",
        articleId: "kb-domain-verification-stuck",
        author: { name: "Jerome Bell" },
        timestamp: "Today, 11:55 AM",
        body: "I added the duplicate TXT record warning because providers split values in confusing ways.",
        badge: "Technical",
        status: "resolved",
      },
    ],
    activity: [
      {
        id: "kb-domain-verification-stuck-activity-1",
        articleId: "kb-domain-verification-stuck",
        title: "Marked needs review",
        timestamp: "4 days ago",
        detail: "The domain verification article was held while DNS provider examples are checked.",
        tone: "warning",
      },
      {
        id: "kb-domain-verification-stuck-activity-2",
        articleId: "kb-domain-verification-stuck",
        title: "Duplicate record note added",
        timestamp: "Today, 11:55 AM",
        detail: "Troubleshooting now includes duplicate TXT record and split-value checks.",
        tone: "neutral",
      },
    ],
  },
  "kb-audit-log-access": {
    comments: [
      {
        id: "kb-audit-log-access-comment-1",
        articleId: "kb-audit-log-access",
        author: { name: "Priya Desai" },
        timestamp: "Yesterday, 4:32 PM",
        body: "Please keep this focused on visibility and permissions. We should not list every event type here.",
        badge: "Security",
        status: "resolved",
      },
      {
        id: "kb-audit-log-access-comment-2",
        articleId: "kb-audit-log-access",
        author: { name: "Santi Cazorla" },
        timestamp: "Today, 9:18 AM",
        body: "I kept the customer reply short and left event examples in the body only.",
        badge: "Content",
        status: "resolved",
      },
    ],
    activity: [
      {
        id: "kb-audit-log-access-activity-1",
        articleId: "kb-audit-log-access",
        title: "Security permissions reviewed",
        timestamp: "3 days ago",
        detail: "Workspace owner and eligible admin access rules were confirmed for the audit log.",
        tone: "success",
      },
      {
        id: "kb-audit-log-access-activity-2",
        articleId: "kb-audit-log-access",
        title: "Customer reply shortened",
        timestamp: "Today, 9:18 AM",
        detail: "The reply now points to Admin Center > Security > Audit log without exposing extra internal detail.",
        tone: "neutral",
      },
    ],
  },
}

function withKnowledgeArticleDiscussion(articles: KnowledgeArticle[]) {
  return articles.map((article) => {
    const discussion = knowledgeArticleDiscussionById[article.id]
    const comments = article.comments ?? discussion?.comments
    const activity = article.activity ?? discussion?.activity

    return {
      ...article,
      ...(comments
        ? {
            comments,
            commentsCount: comments.length,
          }
        : {}),
      ...(activity
        ? {
            activity,
            activityCount: activity.length,
          }
        : {}),
    }
  })
}

export const knowledgeArticles: KnowledgeArticle[] = withKnowledgeArticleDiscussion([
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
        src: "/knowledge-base/billing-seat-wallpaper.png",
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
    comments: [
      {
        id: "kb-return-refund-policy-comment-1",
        articleId: "kb-return-refund-policy",
        author: { name: "Arlene McCoy" },
        timestamp: "Yesterday, 4:18 PM",
        body: "I tightened the refund timeline language so support can quote it directly without adding a second policy caveat.",
        badge: "Editorial",
        status: "resolved",
      },
      {
        id: "kb-return-refund-policy-comment-2",
        articleId: "kb-return-refund-policy",
        author: { name: "Jason Support Lab", avatarUrl: "/avatars/avatar-profile.jpg" },
        timestamp: "Today, 9:22 AM",
        body: "Can we keep the exchange path visible near the top? This article gets inserted most often when the customer wants a different variant, not only a refund.",
        badge: "Review",
        status: "open",
      },
      {
        id: "kb-return-refund-policy-comment-3",
        articleId: "kb-return-refund-policy",
        author: { name: "Santi Cazorla" },
        timestamp: "Today, 10:04 AM",
        body: "Added the before-shipment cancellation note to reduce follow-up tickets where the order is still processing.",
        badge: "Content",
        status: "open",
      },
    ],
    activity: [
      {
        id: "kb-return-refund-policy-activity-1",
        articleId: "kb-return-refund-policy",
        title: "Article published",
        timestamp: "3 days ago",
        detail: "Arlene McCoy published the latest return and refund policy for support use.",
        tone: "success",
      },
      {
        id: "kb-return-refund-policy-activity-2",
        articleId: "kb-return-refund-policy",
        title: "Refund timeline updated",
        timestamp: "Yesterday, 4:18 PM",
        detail: "The refund window was tightened to 5-7 business days after the returned item is reviewed.",
        tone: "neutral",
      },
      {
        id: "kb-return-refund-policy-activity-3",
        articleId: "kb-return-refund-policy",
        title: "Editorial comment resolved",
        timestamp: "Today, 9:40 AM",
        detail: "A review thread about quoting the policy directly was marked resolved.",
        tone: "positive",
      },
      {
        id: "kb-return-refund-policy-activity-4",
        articleId: "kb-return-refund-policy",
        title: "Customer reply refreshed",
        timestamp: "Today, 10:04 AM",
        detail: "The suggested customer reply was updated to include cancellation before shipment.",
        tone: "neutral",
      },
    ],
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
    media: [sharedPreviewImage],
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
    activity: [
      {
        id: "kb-cancel-order-activity-1",
        articleId: "kb-cancel-order",
        title: "Article published",
        timestamp: "1 week ago",
        detail: "Santi Cazorla published the cancellation workflow for orders still in processing.",
        tone: "success",
      },
      {
        id: "kb-cancel-order-activity-2",
        articleId: "kb-cancel-order",
        title: "Return flow cross-link reviewed",
        timestamp: "6 days ago",
        detail: "The article was checked against the return policy for shipped orders.",
        tone: "neutral",
      },
    ],
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
    media: [sharedPreviewImage],
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
    views: 354,
    helpfulRate: 90,
    linkedTickets: 21,
    matchReasons: ["subscription", "seat", "billing", "invoice"],
    quickPath: "Admin Center > Account > Billing > Subscription",
    media: [
      sharedPreviewImage,
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
    activity: [
      {
        id: "kb-billing-seat-update-activity-1",
        articleId: "kb-billing-seat-update",
        title: "Article linked to billing queue",
        timestamp: "2 days ago",
        detail: "Support operations linked this article to subscription and invoice change tickets.",
        tone: "positive",
      },
      {
        id: "kb-billing-seat-update-activity-2",
        articleId: "kb-billing-seat-update",
        title: "Proration section updated",
        timestamp: "1 day ago",
        detail: "The checkout preview guidance now calls out taxes, renewal amount, and payment method.",
        tone: "neutral",
      },
    ],
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
    media: [sharedPreviewImage],
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
  {
    id: "kb-2fa-recovery-codes",
    title: "Recover account with backup codes",
    summary:
      "Guide customers through two-factor recovery when their authenticator device is lost or unavailable.",
    category: "account-login",
    status: "published",
    updatedAt: "Updated 2 days ago",
    author: { name: "Liam Chen" },
    matchScore: "high",
    views: 154,
    helpfulRate: 81,
    linkedTickets: 11,
    matchReasons: ["2fa", "backup code", "authenticator", "recovery"],
    quickPath: "Profile > Security > Backup codes",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Use backup codes first",
        body: "If the customer saved recovery codes, they can use one code to sign in and then enroll a new authenticator app.",
      },
      {
        title: "No backup code available",
        body: "Verify account ownership through the support checklist, then trigger a temporary 2FA bypass valid for one sign-in session.",
      },
    ],
    customerReply:
      "If you still have your backup codes, use one to sign in and set up a new authenticator device. If not, we can help after account verification.",
  },
  {
    id: "kb-card-charge-failed",
    title: "Payment failed during renewal",
    summary:
      "Troubleshoot failed card charges, retry windows, and what happens to seat access during payment grace periods.",
    category: "billing",
    status: "published",
    updatedAt: "Updated 8 days ago",
    author: { name: "Nina Flores" },
    matchScore: "medium",
    views: 208,
    helpfulRate: 76,
    linkedTickets: 14,
    matchReasons: ["payment failed", "renewal", "card", "invoice"],
    quickPath: "Admin Center > Billing > Invoices",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Common reasons",
        body: "Cards may fail due to issuer declines, expired expiration dates, missing 3DS confirmation, or temporary bank limits.",
      },
      {
        title: "Retry behavior",
        body: "The system retries charges automatically across several days. Billing owners also receive email reminders with a direct payment link.",
      },
    ],
    customerReply:
      "We were unable to complete the renewal charge. Please update your payment method in Billing > Invoices and retry the outstanding invoice.",
  },
  {
    id: "kb-download-invoice-pdf",
    title: "Download VAT-compliant invoices",
    summary:
      "Where to find invoice PDFs, tax IDs, and localized billing details from the admin billing workspace.",
    category: "billing",
    status: "needs-review",
    updatedAt: "Updated 5 days ago",
    author: { name: "Arlene McCoy" },
    matchScore: "medium",
    views: 131,
    helpfulRate: 72,
    linkedTickets: 8,
    matchReasons: ["invoice", "vat", "tax id", "pdf"],
    quickPath: "Admin Center > Billing > Invoices > Download PDF",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Invoice availability",
        body: "Invoices become available immediately after successful payment and remain downloadable for all billing owners.",
      },
      {
        title: "Tax information",
        body: "Tax IDs and company legal names can be updated from Billing profile and appear on future invoices.",
      },
    ],
    customerReply:
      "You can download the invoice PDF from Admin Center > Billing > Invoices. If your tax details changed, update the billing profile for future invoices.",
  },
  {
    id: "kb-api-rate-limit",
    title: "API rate limit and retry strategy",
    summary:
      "Explains request limits, burst windows, response headers, and safe backoff guidance for integration stability.",
    category: "technical",
    status: "published",
    updatedAt: "Updated 9 days ago",
    author: { name: "Jerome Bell" },
    matchScore: "high",
    views: 267,
    helpfulRate: 83,
    linkedTickets: 19,
    matchReasons: ["api", "rate limit", "429", "retry"],
    quickPath: "Developer docs > API limits",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Limit model",
        body: "Each workspace has per-minute quotas and short burst ceilings. Exceeding either returns HTTP 429 with reset hints.",
      },
      {
        title: "Backoff pattern",
        body: "Use exponential backoff with jitter and honor Retry-After when present. Avoid synchronized retries from multiple workers.",
      },
    ],
    customerReply:
      "Your integration is hitting API limits. Please apply exponential backoff and Retry-After handling to reduce repeated 429 responses.",
  },
  {
    id: "kb-webhook-signature-failed",
    title: "Webhook signature verification failed",
    summary:
      "Diagnose invalid webhook signatures caused by raw body parsing, secret mismatches, or replayed delivery payloads.",
    category: "technical",
    status: "needs-review",
    updatedAt: "Updated 11 days ago",
    author: { name: "Amina Rahman" },
    matchScore: "medium",
    views: 88,
    helpfulRate: 69,
    linkedTickets: 6,
    matchReasons: ["webhook", "signature", "invalid", "secret"],
    quickPath: "Developer docs > Webhooks > Security",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Raw payload requirement",
        body: "Signature checks must use the exact raw request body bytes before JSON parsing or middleware mutation.",
      },
      {
        title: "Secret management",
        body: "Verify the endpoint secret in production and staging separately. A wrong environment secret is the most common mismatch.",
      },
    ],
    customerReply:
      "Webhook signatures usually fail when the raw request body is altered or the endpoint secret does not match. Please verify both first.",
  },
  {
    id: "kb-change-plan-annual-monthly",
    title: "Switch from annual to monthly plan",
    summary:
      "How billing owners can change billing cadence, review effective dates, and understand credit treatment.",
    category: "subscription",
    status: "draft",
    updatedAt: "Updated 12 days ago",
    author: { name: "Santi Cazorla" },
    matchScore: "low",
    views: 119,
    helpfulRate: 67,
    linkedTickets: 5,
    matchReasons: ["plan", "annual", "monthly", "downgrade"],
    quickPath: "Admin Center > Billing > Subscription > Change plan",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Effective date",
        body: "Cadence changes usually take effect at the next renewal unless a billing admin confirms immediate proration.",
      },
      {
        title: "Credit handling",
        body: "Unused annual value is prorated and applied as a credit to upcoming monthly invoices when eligible.",
      },
    ],
    customerReply:
      "You can change billing cadence from Billing > Subscription. We will show whether the change applies now or at the next renewal.",
  },
  {
    id: "kb-transfer-workspace-ownership",
    title: "Transfer workspace ownership",
    summary:
      "Required steps to move workspace ownership to another admin without interrupting billing or API access.",
    category: "subscription",
    status: "published",
    updatedAt: "Updated 10 days ago",
    author: { name: "Liam Chen" },
    matchScore: "medium",
    views: 143,
    helpfulRate: 79,
    linkedTickets: 10,
    matchReasons: ["owner", "transfer", "admin", "workspace"],
    quickPath: "Admin Center > Members > Roles",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Prerequisites",
        body: "The target user must already be an active admin. Ownership transfer cannot be completed to pending invites.",
      },
      {
        title: "Post-transfer checks",
        body: "Confirm billing contact, API tokens, and security notifications are assigned to the new owner profile.",
      },
    ],
    customerReply:
      "To transfer ownership, promote the recipient to admin first, then complete the transfer in Members > Roles and verify billing contact details.",
  },
  {
    id: "kb-login-magic-link-expired",
    title: "Magic sign-in link expired",
    summary:
      "Help customers request a fresh sign-in link and diagnose common causes of expired or reused authentication emails.",
    category: "account-login",
    status: "published",
    updatedAt: "Updated 7 days ago",
    author: { name: "Amina Rahman" },
    matchScore: "medium",
    views: 118,
    helpfulRate: 77,
    linkedTickets: 6,
    matchReasons: ["magic link", "expired", "email login", "sign in"],
    quickPath: "Sign in > Email link > Resend link",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Most common causes",
        body: "Magic links expire after a short window and become invalid after the first successful use. Security scanners that pre-open email links can also consume them.",
      },
      {
        title: "What to tell the customer",
        body: "Ask the customer to request a fresh email, open the newest message only, and complete sign-in from the same browser session where possible.",
      },
    ],
    customerReply:
      "That sign-in link has probably expired or was already used. Please request a new email link and open only the latest message.",
  },
  {
    id: "kb-browser-cache-login-fix",
    title: "Clear browser cache for login issues",
    summary:
      "Troubleshoot session loops, blank auth callbacks, and stale browser storage that blocks successful sign-in.",
    category: "account-login",
    status: "draft",
    updatedAt: "Updated 9 days ago",
    author: { name: "Liam Chen" },
    matchScore: "low",
    views: 74,
    helpfulRate: 68,
    linkedTickets: 4,
    matchReasons: ["cache", "cookies", "login loop", "browser"],
    quickPath: "Browser settings > Clear site data",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "When this helps",
        body: "Use this when sign-in redirects keep looping, the callback page stays blank, or the customer can log in successfully in a private window only.",
      },
      {
        title: "Recommended steps",
        body: "Clear cookies and cached files for the workspace domain, then restart the browser tab and retry the sign-in flow once.",
      },
    ],
    customerReply:
      "This looks like stale browser session data. Please clear cookies for the workspace site and try the sign-in flow again.",
  },
  {
    id: "kb-export-failed-timeout",
    title: "Export job failed or timed out",
    summary:
      "Guide customers through large export retries, timeout expectations, and the right checks before escalating a failed data export.",
    category: "technical",
    status: "published",
    updatedAt: "Updated 6 days ago",
    author: { name: "Jerome Bell" },
    matchScore: "medium",
    views: 133,
    helpfulRate: 75,
    linkedTickets: 7,
    matchReasons: ["export", "timeout", "csv", "download failed"],
    quickPath: "Reports > Export history",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Why exports fail",
        body: "Exports often fail when the selected date range is too large, the report includes archived records, or the browser closes before the background job completes.",
      },
      {
        title: "Safe retry pattern",
        body: "Retry with a smaller date range first, then check export history for partial completions before escalating the job ID to support engineering.",
      },
    ],
    customerReply:
      "Please retry the export with a smaller date range first, then check Export history. If it still fails, share the job ID so we can investigate.",
  },
  {
    id: "kb-domain-verification-stuck",
    title: "Domain verification still pending",
    summary:
      "Resolve stuck DNS verification states for integrations by checking propagation, record conflicts, and expected verification delays.",
    category: "technical",
    status: "needs-review",
    updatedAt: "Updated 4 days ago",
    author: { name: "Nina Flores" },
    matchScore: "medium",
    views: 96,
    helpfulRate: 73,
    linkedTickets: 5,
    matchReasons: ["domain", "dns", "verification", "pending"],
    quickPath: "Settings > Domains > Verify",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Expected wait time",
        body: "DNS verification can take several minutes to several hours depending on provider TTL and whether the new TXT record conflicts with an older value.",
      },
      {
        title: "What to verify",
        body: "Confirm the hostname, record type, and exact TXT value. Remove duplicate verification records when the provider UI split the string unexpectedly.",
      },
    ],
    customerReply:
      "Your domain record may still be propagating. Please confirm the TXT record exactly matches the latest verification value and allow additional DNS propagation time.",
  },
  {
    id: "kb-audit-log-access",
    title: "View audit log and admin activity",
    summary:
      "Explain which roles can access audit history and where admins can review security-sensitive workspace actions.",
    category: "subscription",
    status: "published",
    updatedAt: "Updated 3 days ago",
    author: { name: "Santi Cazorla" },
    matchScore: "low",
    views: 111,
    helpfulRate: 80,
    linkedTickets: 6,
    matchReasons: ["audit log", "admin activity", "security history", "workspace actions"],
    quickPath: "Admin Center > Security > Audit log",
    media: [sharedPreviewImage],
    sections: [
      {
        title: "Who can access it",
        body: "Only workspace owners and admins with security permissions can open the audit log. Regular members cannot view admin-only activity history.",
      },
      {
        title: "What it includes",
        body: "Audit history includes role changes, security setting updates, authentication events, and selected billing actions tied to an actor and timestamp.",
      },
    ],
    customerReply:
      "Workspace owners and eligible admins can review this from Admin Center > Security > Audit log.",
  },
])

const categoryFallbackOrder = [
  "kb-return-refund-policy",
  "kb-cancel-order",
  "kb-product-exchange",
]

export const knowledgeArticleExplorerGroups: KnowledgeArticleExplorerGroup[] = [
  {
    id: "billing-plans",
    label: "Billing & Plans",
    icon: "credit-card",
    defaultOpen: true,
    articleIds: [
      "kb-billing-seat-update",
      "kb-change-plan-annual-monthly",
      "kb-download-invoice-pdf",
      "kb-card-charge-failed",
    ],
  },
  {
    id: "access-security",
    label: "Access & Security",
    icon: "shield",
    defaultOpen: true,
    articleIds: [
      "kb-login-reset",
      "kb-2fa-recovery-codes",
      "kb-login-magic-link-expired",
      "kb-browser-cache-login-fix",
    ],
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    icon: "tool",
    articleIds: [
      "kb-return-refund-policy",
      "kb-cancel-order",
      "kb-product-exchange",
      "kb-export-failed-timeout",
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: "plug",
    articleIds: [
      "kb-api-rate-limit",
      "kb-webhook-signature-failed",
      "kb-domain-verification-stuck",
    ],
  },
  {
    id: "account-management",
    label: "Account Management",
    icon: "users",
    articleIds: [
      "kb-transfer-workspace-ownership",
      "kb-audit-log-access",
    ],
  },
]

export function getKnowledgeArticleExplorerGroups(
  articles = knowledgeArticles,
  groups = knowledgeArticleExplorerGroups
): KnowledgeArticleResolvedGroup[] {
  const articleById = new Map(articles.map((article) => [article.id, article]))

  return groups.map((group) => ({
    id: group.id,
    label: group.label,
    icon: group.icon,
    defaultOpen: group.defaultOpen ?? false,
    articles: group.articleIds.flatMap((articleId) => {
      const article = articleById.get(articleId)
      return article ? [article] : []
    }),
  }))
}

export function getKnowledgeArticleById(
  articleId: string | null,
  articles = knowledgeArticles
) {
  if (!articleId) return null
  return articles.find((article) => article.id === articleId) ?? null
}

export function getSuggestedKnowledgeArticles(
  ticket: Ticket,
  articles = knowledgeArticles
) {
  const searchableText = [
    ticket.subject,
    ticket.category,
    ticket.ticketType,
    ...(ticket.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  const scoredArticles = articles
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
