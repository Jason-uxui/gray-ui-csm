import { CsmPageTemplate } from "@/components/csm-page-template"
import { getRouteByPathOrThrow } from "@/lib/csm-routes"

const route = getRouteByPathOrThrow("/internal-notes")

export default function InternalNotesPage() {
  return (
    <CsmPageTemplate
      title={route.title}
      description={route.description}
      metrics={route.templateMetrics}
    />
  )
}
