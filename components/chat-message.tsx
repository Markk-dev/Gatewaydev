"use client"

import { useEffect, useRef, useState } from "react"
import { InteractiveGridPattern } from "./ui/interactive-grid-pattern"
import { cn } from "@/lib/utils"
import { ProgressiveTyping } from "./ui/progressive-typing"
import { FileText, Image as ImageIcon } from "lucide-react"

interface Message {
  id: string
  text: string
  isBot: boolean
  isThinking?: boolean
  isNew?: boolean
  attachmentType?: 'image' | 'pdf'
  fileName?: string
}

export default function ChatMessages({
  messages,
  isThinking,
  selectedModel,
  isTyping,
}: {
  messages: Message[]
  isThinking: boolean
  selectedModel: string
  isTyping?: boolean
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set())
  const lastMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isThinking])

  // Mark all messages except the last one as completed
  useEffect(() => {
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1]

    // If there's a new message, mark all previous bot messages as completed
    if (lastMessage.id !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastMessage.id

      const previousBotMessages = messages
        .slice(0, -1)
        .filter(m => m.isBot)
        .map(m => m.id)

      if (previousBotMessages.length > 0) {
        setCompletedMessages(prev => {
          const newSet = new Set(prev)
          previousBotMessages.forEach(id => newSet.add(id))
          return newSet
        })
      }
    }
  }, [messages])

  const handleTypingComplete = (messageId: string) => {
    setCompletedMessages(prev => new Set(prev).add(messageId))
  }

  const hasMessages = messages.length > 0
  const showEmptyState = !hasMessages && !isThinking

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col scrollbar-hide">
      {showEmptyState ? (
        <div className="flex items-center justify-center h-full relative overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-300 ${isTyping ? 'opacity-0' : 'opacity-100'}`}>
            <InteractiveGridPattern
              width={30}
              height={30}
              squares={[40, 40]}
              className={cn(
                "[mask-image:radial-gradient(700px_circle_at_center,white,rgba(255,255,255,0.5),transparent)]",
                "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 border-none"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 pointer-events-none" />
          </div>
          <div className={`text-left max-w-2xl transition-opacity duration-300 relative z-10 ${isTyping ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className="text-6xl font-black mb-3 bg-gradient-to-r from-[#6dc700] via-[#7dd604] via-[#86ee02] via-[#9ef520] via-[#7dd604] to-[#6dc700] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]" style={{ fontWeight: 950, WebkitTextStroke: '0.5px rgba(109, 199, 0, 0.3)' }}>Greetings!</h1>
            <p className="text-lg font-light text-muted-foreground">
              Whether it's a question or a request, I'm here to help.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 items-start animate-in fade-in-50 duration-300 ${message.isBot ? "justify-start" : "justify-end"
                }`}
            >
              {message.isBot && (
                <img src="/logo-icon.svg" alt="Bot" className="w-8 h-8 shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col items-end gap-1 max-w-[75%]">
                {/* Show attachment icon above message for user messages */}
                {!message.isBot && message.attachmentType && (
                  <div className={`p-2 rounded-md ${
                    message.attachmentType === 'pdf' 
                      ? 'bg-blue-500/10' 
                      : 'bg-red-500/10'
                  }`}>
                    {message.attachmentType === 'pdf' ? (
                      <FileText size={18} className="text-blue-500" />
                    ) : (
                      <ImageIcon size={18} className="text-red-500" />
                    )}
                  </div>
                )}
                
                <div className={`${message.isBot ? "" : "bg-[#2a2a2a] px-5 py-2.5 rounded-full"}`}>
                  <p className={`text-sm leading-relaxed break-words ${message.isBot ? "text-foreground font-extralight" : "text-white font-light"}`}>
                    {message.isBot ? (
                      completedMessages.has(message.id) ? (
                        message.text
                      ) : (
                        <ProgressiveTyping
                          text={message.text}
                          duration={12}
                          onComplete={() => handleTypingComplete(message.id)}
                          renderSegment={(displayedText) => displayedText}
                        />
                      )
                    ) : (
                      message.text
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start animate-in fade-in-50 duration-300">
              <img src="/logo-icon.svg" alt="Bot" className="w-8 h-8 shrink-0" />
              <div className="flex items-center relative">
                <div className="absolute w-2 h-2 rounded-full bg-[#86ee02] animate-ping opacity-75"></div>
                <div className="relative w-2 h-2 rounded-full bg-[#86ee02]"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
