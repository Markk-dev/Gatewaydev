import React from "react"
import { Highlighter } from "@/components/ui/highlighter"

interface HighlightRule {
    pattern: RegExp
    action: "highlight" | "underline" | "box" | "circle" | "strike-through" | "crossed-off" | "bracket"
    color: string
    priority: number
}

// Define highlighting rules - only for the MOST important terms
const HIGHLIGHT_RULES: HighlightRule[] = [
    // Names (capitalized words, 2+ words together like "Alan Turing", "Charles Babbage")
    {
        pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
        action: "highlight",
        color: "#ffd1dc",
        priority: 1
    },
    // Years and dates (1000s-2000s, including 1830s, 1940s, etc.)
    {
        pattern: /\b(1[0-9]{3}s?|20[0-9]{2}s?)\b/g,
        action: "circle",
        color: "#ffa500",
        priority: 2
    },
    // Technical terms or acronyms (2-4 capital letters like "AI", "CPU")
    {
        pattern: /\b([A-Z]{2,4})\b/g,
        action: "box",
        color: "#00bfff",
        priority: 3
    },
]

function countSentences(text: string): number {
    // Count sentences by periods, exclamation marks, and question marks
    return (text.match(/[.!?]+/g) || []).length || 1
}

function getSentenceIndex(text: string, position: number): number {
    // Find which sentence a position belongs to
    const beforeText = text.slice(0, position)
    return (beforeText.match(/[.!?]+/g) || []).length
}

export function parseAndHighlight(text: string): React.ReactNode {
    const matches: Array<{ start: number; end: number; text: string; action: string; color: string; priority: number }> = []

    // Find all matches
    HIGHLIGHT_RULES.forEach(rule => {
        let match
        const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
        while ((match = regex.exec(text)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0],
                action: rule.action,
                color: rule.color,
                priority: rule.priority
            })
        }
    })

    // Sort by priority (lower number = higher priority), then by position
    matches.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        return a.start - b.start
    })

    // Remove ALL overlapping matches - keep only the highest priority one
    const nonOverlapping: typeof matches = []

    for (const match of matches) {
        let hasOverlap = false

        for (const existing of nonOverlapping) {
            // Check if there's ANY overlap (even partial)
            if (
                (match.start >= existing.start && match.start < existing.end) ||
                (match.end > existing.start && match.end <= existing.end) ||
                (match.start <= existing.start && match.end >= existing.end)
            ) {
                hasOverlap = true
                break
            }
        }

        if (!hasOverlap) {
            nonOverlapping.push(match)
        }
    }

    // Ensure variety: don't use same style twice in one sentence
    const diverseMatches: typeof nonOverlapping = []
    const sentenceStyles = new Map<number, Set<string>>()

    for (const match of nonOverlapping) {
        const sentenceIdx = getSentenceIndex(text, match.start)

        if (!sentenceStyles.has(sentenceIdx)) {
            sentenceStyles.set(sentenceIdx, new Set())
        }

        const usedStyles = sentenceStyles.get(sentenceIdx)!

        // Only add if this style hasn't been used in this sentence yet
        if (!usedStyles.has(match.action)) {
            diverseMatches.push(match)
            usedStyles.add(match.action)
        }
    }

    // Limit highlights based on text length
    const sentenceCount = countSentences(text)
    const maxHighlights = sentenceCount === 1 ? 3 : Math.min(5, sentenceCount * 2)

    // Take only the most important (highest priority) matches
    const limitedMatches = diverseMatches.slice(0, maxHighlights)

    // Sort by position for rendering
    limitedMatches.sort((a, b) => a.start - b.start)

    // If no matches, return plain text
    if (limitedMatches.length === 0) {
        return text
    }

    // Build segments
    const segments: React.ReactNode[] = []
    let lastIndex = 0

    limitedMatches.forEach((match, index) => {
        // Add text before match
        if (match.start > lastIndex) {
            segments.push(
                <span key={`text-${index}`}>{text.slice(lastIndex, match.start)}</span>
            )
        }
        // Add highlighted match
        segments.push(
            <Highlighter
                key={`highlight-${index}`}
                action={match.action as any}
                color={match.color}
                strokeWidth={2}
                animationDuration={600}
            >
                {match.text}
            </Highlighter>
        )
        lastIndex = match.end
    })

    // Add remaining text
    if (lastIndex < text.length) {
        segments.push(
            <span key="text-end">{text.slice(lastIndex)}</span>
        )
    }

    return <>{segments}</>
}
