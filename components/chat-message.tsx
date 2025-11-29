"use client"

import { useEffect, useRef } from "react"
import { InteractiveGridPattern } from "./ui/interactive-grid-pattern"
import { Highlighter } from "./ui/highlighter"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  isBot: boolean
  isThinking?: boolean
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

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
              Whether it's a <Highlighter color="#86ee02" action="underline" strokeWidth={2} animationDuration={800}>question or a request</Highlighter>, I'm here to <Highlighter color="#86ee02" action="highlight" strokeWidth={3} animationDuration={1000}>help</Highlighter>.
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
              <div className={message.isBot ? "" : "bg-[#2a2a2a] px-5 py-2.5 rounded-full"}>
                <p className={`text-sm leading-relaxed ${message.isBot ? "text-foreground font-extralight" : "text-white font-light"}`}>
                  {message.text}
                </p>
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
