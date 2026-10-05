import { cn } from "@/lib/utils"
export function Presence({ online }: { online: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          online ? "bg-status-success" : "bg-muted-foreground/50"
        )}
      />
      {online ? "Online" : "Offline"}
    </span>
  )
}
