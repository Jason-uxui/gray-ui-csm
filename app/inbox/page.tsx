import { Suspense } from "react"

import { InboxPage as InboxWorkspace } from "@/components/inbox/inbox-page"

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 animate-pulse rounded-xl border bg-muted" />
      }
    >
      <InboxWorkspace />
    </Suspense>
  )
}
