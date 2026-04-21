import { CsmPageTemplate } from "@/components/csm-page-template"
import { getRouteByPathOrThrow } from "@/lib/csm-routes"

const route = getRouteByPathOrThrow("/knowledge-base")

export default function KnowledgeBasePage() {
  return (
    <CsmPageTemplate
      title={route.title}
      description={route.description}
      metrics={route.templateMetrics}
    />
  )
}
