"use client"

import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

/** Figma Sidebar / MediaAsset placeholder, with the native 24px inner shadow. */
export function ContactAvatar({
  className,
  size = "list",
}: {
  className?: string
  size?: "list" | "detail"
}) {
  const filterId = React.useId().replaceAll(":", "")

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-full bg-[var(--inbox-avatar-background)]",
        size === "list" ? "size-6" : "size-10",
        className
      )}
    >
      {size === "list" ? (
        <svg
          className="absolute top-0 left-0 h-[161.61%] w-full"
          viewBox="0 0 24 38.7861"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g opacity="0.44" filter={`url(#${filterId})`}>
            <path
              d="M12 14.7861C18.6274 14.7861 24 20.1587 24 26.7861C23.9998 33.4134 18.6273 38.7861 12 38.7861C5.37272 38.7861 0.000222654 33.4134 0 26.7861C0 20.1587 5.37258 14.7861 12 14.7861ZM12 4.5C14.3669 4.5 16.2861 6.4192 16.2861 8.78613C16.2859 11.1529 14.3668 13.0713 12 13.0713C9.63335 13.0711 7.71507 11.1528 7.71484 8.78613C7.71484 6.4193 9.63321 4.50017 12 4.5Z"
              fill="var(--inbox-avatar-foreground)"
            />
          </g>
          <defs>
            <filter
              id={filterId}
              x="0"
              y="4.5"
              width="24"
              height="36.2861"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="2" />
              <feGaussianBlur stdDeviation="1.55" />
              <feComposite
                in2="hardAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0.54 0"
              />
              <feBlend mode="normal" in2="shape" />
            </filter>
          </defs>
        </svg>
      ) : (
        <>
          <Image
            src="/avatars/contact-placeholder.svg"
            alt=""
            width={32}
            height={52}
            className="absolute top-0 left-0 h-[161.61%] w-full dark:hidden"
          />
          <Image
            src="/avatars/contact-placeholder-dark.svg"
            alt=""
            width={40}
            height={65}
            className="absolute top-0 left-0 hidden h-[161.61%] w-full dark:block"
          />
        </>
      )}
    </span>
  )
}
