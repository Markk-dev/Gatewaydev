"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ProgressiveTypingProps {
  text: string
  duration?: number
  className?: string
  onComplete?: () => void
  renderSegment: (text: string, isComplete: boolean) => React.ReactNode
}

export function ProgressiveTyping({
  text,
  duration = 20,
  className,
  onComplete,
  renderSegment,
}: ProgressiveTypingProps) {
  const [displayedLength, setDisplayedLength] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedLength(0)
    setIsComplete(false)
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        currentIndex++
        setDisplayedLength(currentIndex)
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, duration)

    return () => clearInterval(interval)
  }, [text, duration, onComplete])

  const displayedText = text.slice(0, displayedLength)

  return (
    <span className={cn("inline-block", className)}>
      {renderSegment(displayedText, isComplete)}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />
      )}
    </span>
  )
}
