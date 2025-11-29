import type React from "react"

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {children}
    </div>
  )
}
