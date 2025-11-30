"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ReasoningBlockProps {
  reasoningText: string
  reasoningTime: number // in seconds
  isComplete: boolean
  onReasoningComplete?: () => void
}

export default function ReasoningBlock({ reasoningText, reasoningTime, isComplete, onReasoningComplete }: ReasoningBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [displayedText, setDisplayedText] = useState("")

  // Stream the reasoning text character by character
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
    }, 15) // Speed of typing

    return () => clearInterval(interval)
  }, [reasoningText])

  // Auto-collapse when reasoning is complete and notify parent (only once)
  const hasCollapsedRef = useRef(false)

  useEffect(() => {
    if (isComplete && displayedText === reasoningText && reasoningText && !hasCollapsedRef.current) {
      const timer = setTimeout(() => {
        setIsExpanded(false)
        hasCollapsedRef.current = true
        if (onReasoningComplete) {
          onReasoningComplete()
        }
      }, 800) // Wait before collapsing and showing answer
      return () => clearTimeout(timer)
    }
  }, [isComplete, displayedText, reasoningText, onReasoningComplete])

  // Don't show anything if there's no reasoning text yet
  if (!reasoningText && !isComplete) return null

  return (
    <div className="mb-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gray-400 text-xs hover:text-gray-300 transition mb-1"
      >
        <span>
          {isComplete ? `Reasoned for ${reasoningTime} seconds` : "Thinking..."}
        </span>
        {isExpanded ? (
          <ChevronUp size={12} />
        ) : (
          <ChevronDown size={12} />
        )}
      </button>

      {/* Reasoning Content - Streams in real-time */}
      {isExpanded && (
        <div className="mt-1">
          <div className="text-xs leading-relaxed whitespace-pre-wrap italic opacity-50">
            {displayedText}
            {!isComplete && (
              <span className="inline-block w-0.5 h-3 bg-gray-400 ml-0.5 animate-pulse" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
