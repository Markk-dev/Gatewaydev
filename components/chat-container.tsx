"use client"

import { useState } from "react"
import ChatMessages from "./chat-message"
import ChatInput from "./chat-input"

interface Message {
  id: string
  text: string
  isBot: boolean
  isThinking?: boolean
}

interface ChatContainerProps {
  messages: Message[]
  isThinking: boolean
  selectedModel: string
  onSendMessage: (text: string) => void
}

export default function ChatContainer({ messages, isThinking, selectedModel, onSendMessage }: ChatContainerProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (text: string) => {
    if (text.trim()) {
      onSendMessage(text)
      setInputValue("")
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background rounded-tr-xl rounded-br-xl overflow-hidden my-6 mr-6 shadow-2xl px-12 pt-6">
      {/* Messages */}
      <ChatMessages messages={messages} isThinking={isThinking} selectedModel={selectedModel} isTyping={inputValue.length > 0} />

      {/* Input */}
      <ChatInput value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} isDisabled={isThinking} />
    </div>
  )
}
