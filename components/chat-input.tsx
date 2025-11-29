"use client"

import type React from "react"
import { Paperclip, Send } from "lucide-react"
import { motion } from "framer-motion"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string) => void
  isDisabled: boolean
}

export default function ChatInput({ value, onChange, onSubmit, isDisabled }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSubmit(value)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 pt-4">
      <motion.div
        className="flex flex-col items-center w-full gap-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          ease: [0.22, 0.61, 0.36, 1]
        }}
      >
        <div className="flex items-center gap-3 bg-card border border-border rounded-full px-4 py-3 max-w-2xl w-full min-h-[42px]">
          { }
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition"
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </button>

          { }
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or make a request..."
            disabled={isDisabled}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-extralight placeholder:text-sm disabled:opacity-50 outline-none leading-tight"
          />

          { }
          <button
            type="submit"
            disabled={isDisabled || !value.trim()}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        { }
        <p className="text-xs text-muted-foreground text-center">
          Gateway may produce inaccurate information about people, places or fact. Check{" "}
          <a href="#" className="underline hover:no-underline">
            Privacy Notice
          </a>
        </p>
      </motion.div>
    </form>
  )
}
