import { Button } from "@/components/ui/button"

export default function Page() {
  const stats = [
    { label: "Revenue", value: "324" },
    { label: "NPS", value: "61" },
    { label: "Active Accounts", value: "324" },
    { label: "At Risk", value: "12" },
  ]

  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border bg-background p-6">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route demonstrates how additional workspace screens can share the
          same app shell and design system primitives.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Demo data for UI showcase. Replace with real API data in production.
        </p>
        <Button className="mt-4">View Reports</Button>
      </section>
    </>
  )
}
