"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypingAnimationProps {
  text: string
  duration?: number
  className?: string
  onComplete?: () => void
  children?: React.ReactNode
}

export function TypingAnimation({
  text,
  duration = 50,
  className,
  onComplete,
  children,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText("")
    setIsComplete(false)
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, duration)

    return () => clearInterval(interval)
  }, [text, duration, onComplete])

  if (isComplete && children) {
    return <>{children}</>
  }

  return (
    <span className={cn("inline-block", className)}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-1 h-4 ml-0.5 bg-current animate-pulse" />
      )}
    </span>
  )
}
