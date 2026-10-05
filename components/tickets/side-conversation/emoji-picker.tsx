"use client"
import { Popover } from "@base-ui/react/popover"
import { IconMoodSmile } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
const EMOJIS = ["👍", "❤️", "🎉", "😀", "🙏", "👀", "✅", "💡"]
export function EmojiPicker({
  label,
  reaction = false,
  selected = [],
  onSelect,
}: {
  label: string
  reaction?: boolean
  selected?: string[]
  onSelect: (emoji: string) => void
}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={reaction ? "size-7 text-muted-foreground" : undefined}
            aria-label={label}
            title={label}
          />
        }
      >
        <IconMoodSmile className={reaction ? "size-3.5" : "size-4"} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={8} className="z-[70]">
          <Popover.Popup className="rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg">
            <Popover.Title className="sr-only">{label}</Popover.Title>
            <div className="grid grid-cols-4 gap-1">
              {EMOJIS.map((emoji) => (
                <Popover.Close
                  key={emoji}
                  render={
                    <Button
                      type="button"
                      variant={selected.includes(emoji) ? "secondary" : "ghost"}
                      size="icon-sm"
                      aria-label={`${reaction ? "React" : "Insert"} ${emoji}`}
                      aria-pressed={
                        reaction ? selected.includes(emoji) : undefined
                      }
                    />
                  }
                  onClick={() => onSelect(emoji)}
                >
                  {emoji}
                </Popover.Close>
              ))}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
