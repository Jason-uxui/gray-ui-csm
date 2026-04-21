import { CsmPageTemplate } from "@/components/csm-page-template"
import { getRouteByPathOrThrow } from "@/lib/csm-routes"

const route = getRouteByPathOrThrow("/macros")

export default function MacrosPage() {
  return (
    <CsmPageTemplate
      title={route.title}
      description={route.description}
      metrics={route.templateMetrics}
    />
  )
}
