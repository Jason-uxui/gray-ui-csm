import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { AppShell } from "@/components/app-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://gray-ui-csm.vercel.app"),
  title: {
    default: "Gray CSM UI",
    template: "%s | Gray CSM UI",
  },
  description:
    "Open-source CSM workspace UI built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Gray CSM UI",
    description:
      "Open-source CSM workspace UI built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.",
    url: "https://gray-ui-csm.vercel.app",
    siteName: "Gray CSM UI",
    type: "website",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Gray CSM Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Gray CSM UI",
    description:
      "Open-source CSM workspace UI built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.",
    images: ["/android-chrome-512x512.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#f59e0b",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        {process.env.NODE_ENV === "development" ? (
          <Script
            src="https://mcp.figma.com/mcp/html-to-design/capture.js"
            strategy="afterInteractive"
          />
        ) : null}
        <ThemeProvider>
          <TooltipProvider delay={0}>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
