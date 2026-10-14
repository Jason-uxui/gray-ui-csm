import Image from "next/image"
import { cn } from "@/lib/utils"

export type SupportIconName =
  | "monitor"
  | "timer"
  | "summary-timer"
  | "calendar"
  | "stop"
  | "pointer"
  | "screenshot"
  | "maximize"
  | "mic"
  | "video-off"
  | "mail"
  | "copy"
  | "phone"
  | "phone-mic"
  | "phone-camera"
  | "keypad"
  | "hold"
  | "phone-end"
  | "play"
  | "file-video"
  | "download"
  | "menu-monitor"
  | "menu-list"
  | "menu-file"
  | "menu-back"
export function SupportIcon({
  name,
  size = 16,
  className,
}: {
  name: SupportIconName
  size?: number
  className?: string
}) {
  const phone =
    name.startsWith("phone") ||
    name.startsWith("menu-") ||
    name === "keypad" ||
    name === "hold"
  return (
    <Image
      src={`/remote-assist/${name}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden
      className={cn("shrink-0", !phone && "dark:invert", className)}
    />
  )
}
