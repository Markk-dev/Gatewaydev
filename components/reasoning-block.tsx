"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ReasoningBlockProps {
  reasoningText: string
  reasoningTime: number
  isComplete: boolean
  onReasoningComplete?: () => void
}

export default function ReasoningBlock({ reasoningText, reasoningTime, isComplete, onReasoningComplete }: ReasoningBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [displayedText, setDisplayedText] = useState("")
  const [liveTimer, setLiveTimer] = useState(0)
  useEffect(() => {
    if (isComplete) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setLiveTimer(elapsed)
    }, 100)

    return () => clearInterval(interval)
  }, [isComplete])
  useEffect(() => {
    if (!reasoningText) return

    let currentIndex = 0
    setDisplayedText("")

    const interval = setInterval(() => {
      if (currentIndex < reasoningText.length) {
        setDisplayedText(reasoningText.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 5) 

    return () => clearInterval(interval)
  }, [reasoningText])
  const hasCollapsedRef = useRef(false)

  useEffect(() => {
    if (isComplete && displayedText === reasoningText && reasoningText && !hasCollapsedRef.current) {
      const timer = setTimeout(() => {
        setIsExpanded(false)
        hasCollapsedRef.current = true
        if (onReasoningComplete) {
          onReasoningComplete()
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isComplete, displayedText, reasoningText, onReasoningComplete])

  return (
    <div className="mt-[-5px]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gray-400 text-xs hover:text-gray-300 transition mb-1"
      >
        <span>
          {isComplete
            ? `Reasoned for ${reasoningTime} seconds`
            : `Thinking... ${liveTimer}s`}
        </span>
        {(reasoningText || isComplete) && (
          <>
            {isExpanded ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </>
        )}
      </button>
      {isExpanded && (reasoningText || displayedText) && (
        <div className="mt-1">
          <div className="text-xs leading-relaxed whitespace-pre-wrap italic opacity-50">
            {displayedText || "Processing your request..."}
            {!isComplete && (
              <span className="inline-block w-0.5 h-3 bg-gray-400 ml-0.5 animate-pulse" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
