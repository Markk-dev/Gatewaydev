"use client"

import { useEffect, useRef } from "react"
import type React from "react"
import { useInView } from "motion/react"
import { annotate } from "rough-notation"
import { type RoughAnnotation } from "rough-notation/lib/model"
import { useInteraction } from "@/lib/scroll-context"

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket"

interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const annotationRef = useRef<RoughAnnotation | null>(null)

  // Try to get interaction context, but don't fail if not available
  let hideHighlights = false
  try {
    const context = useInteraction()
    hideHighlights = context.hideHighlights
  } catch {
    // Not in InteractionProvider, that's fine - highlights will always show
  }

  const isInView = useInView(elementRef, {
    once: true,
    margin: "-10%",
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useEffect(() => {
    if (!shouldShow) return

    const element = elementRef.current
    if (!element) return

    const annotationConfig = {
      type: action,
      color,
      strokeWidth,
      animationDuration,
      iterations,
      padding,
      multiline,
    }

    const annotation = annotate(element, annotationConfig)
    annotationRef.current = annotation

    // Small delay to ensure element is positioned
    requestAnimationFrame(() => {
      if (!hideHighlights) {
        annotation.show()
      }
    })

    const resizeObserver = new ResizeObserver(() => {
      annotation.hide()
      requestAnimationFrame(() => {
        annotation.show()
      })
    })

    resizeObserver.observe(element)
    resizeObserver.observe(document.body)

    return () => {
      if (element) {
        annotate(element, { type: action }).remove()
        resizeObserver.disconnect()
      }
    }
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
    hideHighlights,
  ])

  // Handle hide/show based on interaction
  useEffect(() => {
    if (!annotationRef.current) return

    if (hideHighlights) {
      // INSTANTLY remove
      annotationRef.current.remove()
      annotationRef.current = null
    } else {
      // Recreate after interaction stops
      const element = elementRef.current
      if (element) {
        const newAnnotation = annotate(element, {
          type: action,
          color,
          strokeWidth,
          animationDuration,
          iterations,
          padding,
          multiline,
        })
        annotationRef.current = newAnnotation
        requestAnimationFrame(() => {
          newAnnotation.show()
        })
      }
    }
  }, [hideHighlights, action, color, strokeWidth, animationDuration, iterations, padding, multiline])

  return (
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
    </span>
  )
}
