"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { IconPlayerPause } from "@tabler/icons-react"
import { SupportIcon } from "./support-icons"
import { TooltipButton } from "@/components/ui/tooltip-button"

export function CallRecordingPlayer({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(false)
  async function toggle() {
    if (!audio.current) return
    setError(false)
    if (playing) audio.current.pause()
    else
      try {
        await audio.current.play()
      } catch {
        setError(true)
      }
  }
  return (
    <div>
      <div className="relative flex h-[67px] items-center justify-center overflow-hidden rounded-xl bg-background px-4">
        <div
          aria-hidden
          className="flex w-full items-center justify-center overflow-hidden"
        >
          {Array.from({ length: 13 }, (_, i) => (
            <Image
              key={i}
              src="/remote-assist/wave-active.svg"
              width={37}
              height={37}
              alt=""
              className={`h-9 min-w-0 flex-1 invert dark:invert-0 ${i / 13 > progress ? "opacity-25" : ""}`}
            />
          ))}
        </div>
        <TooltipButton
          type="button"
          size="icon"
          onClick={() => void toggle()}
          aria-label={
            playing
              ? "Pause sample call recording"
              : "Play sample call recording"
          }
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl focus-visible:ring-2"
        >
          {playing ? (
            <IconPlayerPause className="size-4" />
          ) : (
            <SupportIcon name="play" className="dark:invert-0" />
          )}
        </TooltipButton>
        <audio
          ref={audio}
          src={src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false)
            setProgress(0)
          }}
          onError={() => setError(true)}
          onTimeUpdate={(e) => {
            const a = e.currentTarget
            setProgress(a.duration ? a.currentTime / a.duration : 0)
          }}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          Audio could not play. Try again or download the sample.
        </p>
      )}
    </div>
  )
}
