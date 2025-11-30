"use client"

import type React from "react"
import { InteractionProvider } from "@/lib/scroll-context"

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <InteractionProvider>
      <div className="flex h-screen bg-black overflow-hidden">
        {children}
      </div>
    </InteractionProvider>
  )
}
