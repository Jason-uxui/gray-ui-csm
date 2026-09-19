import { Suspense } from "react"

import { AnalyticsPage } from "@/components/analytics/analytics-page"

export default function Page() {
  return (
    <Suspense>
      <AnalyticsPage />
    </Suspense>
  )
}
