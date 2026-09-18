import Image from "next/image"

import { cn } from "@/lib/utils"

type GrayCsmLogoProps = {
  className?: string
}

export function GrayCsmLogo({ className }: GrayCsmLogoProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/20 bg-primary",
        className
      )}
    >
      <span className="brand-mark-gradient pointer-events-none absolute -inset-px" />
      <span className="relative h-[25.792px] w-[26px] shrink-0">
        <Image
          src="/gray-csm-logomark.svg"
          alt=""
          fill
          sizes="28px"
          className="absolute inset-[0_-4.34%_-3.88%_-3.85%] max-w-none"
        />
      </span>
    </span>
  )
}
