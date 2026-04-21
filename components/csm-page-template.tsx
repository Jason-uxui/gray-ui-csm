import { Button } from "@/components/ui/button"

type CsmPageTemplateProps = {
  title: string
  description: string
}

export function CsmPageTemplate({ title, description }: CsmPageTemplateProps) {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">Open Items</p>
          <p className="mt-2 text-2xl font-semibold">24</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">Resolved Today</p>
          <p className="mt-2 text-2xl font-semibold">18</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">SLA Health</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">98.2%</p>
        </div>
      </div>

      <section className="rounded-xl border bg-background p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        <Button className="mt-4">Create New</Button>
      </section>
    </>
  )
}
