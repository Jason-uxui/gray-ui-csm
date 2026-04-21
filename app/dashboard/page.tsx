import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {["Revenue", "NPS", "Active Accounts", "At Risk"].map((item) => (
          <div key={item} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item}</p>
            <p className="mt-2 text-xl font-semibold">
              {item === "At Risk" ? "12" : item === "NPS" ? "61" : "324"}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border bg-background p-6">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Đây là ví dụ một route con (`/dashboard`) đang dùng chung layout sidebar.
          Bạn có thể tiếp tục tạo các route khác trong `app/*` và tái sử dụng cùng
          khung.
        </p>
        <Button className="mt-4">View Reports</Button>
      </section>
    </>
  )
}
