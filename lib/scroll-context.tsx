"use client"

import React, { createContext, useContext, useState, useRef } from "react"

interface InteractionContextType {
  hideHighlights: boolean
  triggerInteraction: () => void
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined)

export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const [hideHighlights, setHideHighlights] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const triggerInteraction = () => {
    // INSTANTLY hide all highlights
    setHideHighlights(true)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Show highlights after 1 second of no interaction
    timeoutRef.current = setTimeout(() => {
      setHideHighlights(false)
    }, 1000)
  }

  return (
    <InteractionContext.Provider value={{ hideHighlights, triggerInteraction }}>
      {children}
    </InteractionContext.Provider>
  )
}

export function useInteraction() {
  const context = useContext(InteractionContext)
  if (!context) {
    throw new Error("useInteraction must be used within InteractionProvider")
  }
  return context
}
