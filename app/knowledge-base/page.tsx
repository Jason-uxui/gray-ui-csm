import { Suspense } from "react"

import { KnowledgeBasePage as KnowledgeBaseClientPage } from "@/components/knowledge-base/knowledge-base-page"
import { getRouteByPathOrThrow } from "@/lib/csm-routes"

const route = getRouteByPathOrThrow("/knowledge-base")

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={null}>
      <KnowledgeBaseClientPage
        title={route.title}
        description={route.description}
        metrics={route.templateMetrics}
      />
    </Suspense>
  )
}
