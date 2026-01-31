"use client"

import { useState } from "react"
import ChatMessages from "./chat-message"
import ChatInput from "./chat-input"

interface Message {
  id: string
  text: string
  isBot: boolean
  isThinking?: boolean
  reasoning?: {
    text: string
    time: number
    isComplete: boolean
  }
}

interface ChatContainerProps {
  messages: Message[]
  isThinking: boolean
  selectedModel: string
  onSendMessage: (text: string, extractedText?: string, fileType?: 'image' | 'pdf', fileName?: string, file?: File) => void
  isReasoningMode?: boolean
  isNavigationMode?: boolean
  preloadedMessageIds?: Set<string>
}

export default function ChatContainer({ messages, isThinking, selectedModel, onSendMessage, isReasoningMode = false, isNavigationMode = false, preloadedMessageIds }: ChatContainerProps) {
  const [inputValue, setInputValue] = useState("")
  const [isBotTyping, setIsBotTyping] = useState(false)

  const handleSubmit = (text: string, extractedText?: string, fileType?: 'image' | 'pdf', fileName?: string, file?: File) => {
    const userText = text.trim()
    if (userText || extractedText) {
      onSendMessage(userText || "What does this document say?", extractedText, fileType, fileName, file)
      setInputValue("")
    }
  }

  const handleTypingStatusChange = (isTyping: boolean) => {
    setIsBotTyping(isTyping)
  }

  return (
    <div className="flex-1 flex flex-col bg-background rounded-tr-xl rounded-br-xl overflow-hidden my-6 mr-6 shadow-2xl px-12 pt-6">
      <ChatMessages 
        messages={messages} 
        isThinking={isThinking} 
        selectedModel={selectedModel} 
        isReasoningMode={isReasoningMode}
        isNavigationMode={isNavigationMode}
        preloadedMessageIds={preloadedMessageIds}
        inputValue={inputValue}
        onTypingStatusChange={handleTypingStatusChange}
      />
      <ChatInput value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} isDisabled={isThinking || isBotTyping} />
    </div>
  )
}
