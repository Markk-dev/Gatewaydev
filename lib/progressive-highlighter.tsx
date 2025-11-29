import React from "react"
import { Highlighter } from "@/components/ui/highlighter"

interface HighlightRule {
    pattern: RegExp
    action: "highlight" | "underline" | "box" | "circle" | "strike-through" | "crossed-off" | "bracket"
    color: string
    priority: number
}

const HIGHLIGHT_RULES: HighlightRule[] = [
    {
        pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
        action: "highlight",
        color: "#ffd1dc",
        priority: 1
    },
    {
        pattern: /\b(1[0-9]{3}s?|20[0-9]{2}s?)\b/g,
        action: "circle",
        color: "#ffa500",
        priority: 2
    },
    {
        pattern: /\b([A-Z]{2,4})\b/g,
        action: "box",
        color: "#00bfff",
        priority: 3
    },
]

function countSentences(text: string): number {
    return (text.match(/[.!?]+/g) || []).length || 1
}

function getSentenceIndex(text: string, position: number): number {
    const beforeText = text.slice(0, position)
    return (beforeText.match(/[.!?]+/g) || []).length
}

export function parseAndHighlightProgressive(fullText: string, displayedText: string, isComplete: boolean): React.ReactNode {
    // Use displayed text for matching, but know the full context
    const textToAnalyze = isComplete ? fullText : displayedText
    
    const matches: Array<{ start: number; end: number; text: string; action: string; color: string; priority: number }> = []

    HIGHLIGHT_RULES.forEach(rule => {
        let match
        const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
        while ((match = regex.exec(fullText)) !== null) {
            // Only include matches that are fully visible in displayed text
            if (match.index + match[0].length <= displayedText.length) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0],
                    action: rule.action,
                    color: rule.color,
                    priority: rule.priority
                })
            }
        }
    })

    matches.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        return a.start - b.start
    })

    const nonOverlapping: typeof matches = []
    
    for (const match of matches) {
        let hasOverlap = false
        
        for (const existing of nonOverlapping) {
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

    const diverseMatches: typeof nonOverlapping = []
    const sentenceStyles = new Map<number, Set<string>>()

    for (const match of nonOverlapping) {
        const sentenceIdx = getSentenceIndex(fullText, match.start)

        if (!sentenceStyles.has(sentenceIdx)) {
            sentenceStyles.set(sentenceIdx, new Set())
        }

        const usedStyles = sentenceStyles.get(sentenceIdx)!

        if (!usedStyles.has(match.action)) {
            diverseMatches.push(match)
            usedStyles.add(match.action)
        }
    }

    const sentenceCount = countSentences(fullText)
    const maxHighlights = sentenceCount === 1 ? 3 : Math.min(5, sentenceCount * 2)
    
    const limitedMatches = diverseMatches.slice(0, maxHighlights)
    limitedMatches.sort((a, b) => a.start - b.start)

    if (limitedMatches.length === 0) {
        return displayedText
    }

    const segments: React.ReactNode[] = []
    let lastIndex = 0

    limitedMatches.forEach((match, index) => {
        if (match.start > lastIndex) {
            segments.push(
                <span key={`text-${index}`}>{displayedText.slice(lastIndex, match.start)}</span>
            )
        }
        
        segments.push(
            <Highlighter
                key={`highlight-${index}`}
                action={match.action as any}
                color={match.color}
                strokeWidth={2}
                animationDuration={400}
            >
                {match.text}
            </Highlighter>
        )
        lastIndex = match.end
    })

    if (lastIndex < displayedText.length) {
        segments.push(
            <span key="text-end">{displayedText.slice(lastIndex)}</span>
        )
    }

    return <>{segments}</>
}
