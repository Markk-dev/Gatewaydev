"use client"

import { useState } from "react"
import ChatLayout from "@/components/chat-layout"
import ChatContainer from "@/components/chat-container"
import ChatSidebar from "@/components/chat-sidebar"

export default function Home() {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; isBot: boolean; isThinking?: boolean }>>([])
  const [isThinking, setIsThinking] = useState(false)
  const [selectedModel, setSelectedModel] = useState("deepseek")

  const handleSendMessage = (text: string) => {
    const userMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsThinking(true)

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: "This is a response from the chatbot. Your frontend is ready!",
        isBot: true,
      }
      setMessages((prev) => [...prev, botMessage])
      setIsThinking(false)
    }, 2000)
  }

  return (
    <ChatLayout>
      <ChatSidebar selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <ChatContainer
        messages={messages}
        isThinking={isThinking}
        selectedModel={selectedModel}
        onSendMessage={handleSendMessage}
      />
    </ChatLayout>
  )
}
