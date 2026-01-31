"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import ChatLayout from "@/components/chat-layout"
import ChatContainer from "@/components/chat-container"
import ChatSidebar from "@/components/chat-sidebar"
import { sendChatMessage, type Message } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"
import { createConversation, addMessage, getConversationMessages } from "@/lib/conversations"
import { uploadFile } from "@/lib/file-storage"

const AVAILABLE_MODELS = [
  "x-ai/grok-4.1-fast:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-3n-e2b-it:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "tngtech/deepseek-r1t2-chimera:free",
]

const REQUEST_TIMEOUT = 30000

interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  isThinking?: boolean
  attachmentType?: 'image' | 'pdf'
  fileName?: string
  reasoning?: {
    text: string
    time: number
    isComplete: boolean
  }
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [selectedModel, setSelectedModel] = useState("x-ai/grok-4.1-fast:free")
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [refreshSidebar, setRefreshSidebar] = useState(0)
  const [mode, setMode] = useState<"standard" | "reasoning" | "navigation">("standard")
  const [preloadedMessageIds, setPreloadedMessageIds] = useState<Set<string>>(new Set())
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
 
    const checkAuth = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/')
      } else {
        setUserId(user.$id)
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const tryModelWithTimeout = async (model: string, history: Message[], isReasoning: boolean = false, isNavigation: boolean = false): Promise<string> => {
    return Promise.race([
      sendChatMessage(model, history, isReasoning, isNavigation).then(response => response.choices[0].message.content),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), REQUEST_TIMEOUT)
      )
    ])
  }

  const parseReasoningResponse = (content: string) => {
    const reasoningMatch = content.match(/<reasoning>([\s\S]*?)<\/reasoning>/);
    if (reasoningMatch) {
      const reasoningText = reasoningMatch[1].trim();
      const answer = content.replace(/<reasoning>[\s\S]*?<\/reasoning>/, '').trim();
      return { reasoningText, answer };
    }
    return { reasoningText: null, answer: content };
  }

  const getNextModel = (currentModel: string): string | null => {
    const currentIndex = AVAILABLE_MODELS.indexOf(currentModel)
    if (currentIndex === -1 || currentIndex === AVAILABLE_MODELS.length - 1) {
      return null
    }
    return AVAILABLE_MODELS[currentIndex + 1]
  }

  const handleSendMessage = async (text: string, extractedText?: string, fileType?: 'image' | 'pdf', fileName?: string, file?: File) => {
    const userMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      attachmentType: fileType,
      fileName: fileName
    }
    setMessages((prev) => [...prev, userMessage])
    setIsThinking(true)


    let fileId: string | undefined
    if (file) {
      const uploadResult = await uploadFile(file)
      if (uploadResult.success) {
        fileId = uploadResult.fileId
      }
    }

    let convId = currentConversationId
    if (!convId && userId) {
      const result = await createConversation(userId, text)
      if (result.success && result.conversation) {
        convId = result.conversation.$id
        setCurrentConversationId(convId)
        setRefreshSidebar(prev => prev + 1)
      }
    }

    if (convId) {
      await addMessage(convId, 'user', text, fileId)
    }

    let contextMessage = text
    if (extractedText) {
      contextMessage = `${text}\n\n[Context from uploaded document]:\n${extractedText}`
    }

    const newHistory: Message[] = [...conversationHistory, { role: "user", content: contextMessage }]
    setConversationHistory(newHistory)

    let currentModel = selectedModel
    let attempts = 0
    const maxAttempts = AVAILABLE_MODELS.length
    let hasShownWarning = false

    const startTime = Date.now()
    
    // Add placeholder message for reasoning mode
    let botMessageId: string | null = null
    if (mode === "reasoning") {
      botMessageId = (Date.now() + 1).toString()
      setMessages((prev) => [...prev, {
        id: botMessageId!,
        text: "",
        isBot: true,
        reasoning: {
          text: "",
          time: 0,
          isComplete: false
        }
      }])
    }
    
    while (attempts < maxAttempts) {
      try {
        const aiResponse = await tryModelWithTimeout(currentModel, newHistory, mode === "reasoning", mode === "navigation")
        
        const endTime = Date.now()
        const reasoningTime = Math.round((endTime - startTime) / 1000)

        let botMessage: any = {
          id: botMessageId || (Date.now() + 1).toString(),
          text: aiResponse,
          isBot: true,
        }

        if (mode === "reasoning") {
          const { reasoningText, answer } = parseReasoningResponse(aiResponse)
          botMessage = {
            ...botMessage,
            text: answer,
            reasoning: reasoningText ? {
              text: reasoningText,
              time: reasoningTime,
              isComplete: true
            } : undefined
          }
          
          // Update the existing message
          setMessages((prev) => prev.map(msg => 
            msg.id === botMessageId ? botMessage : msg
          ))
        } else {
          setMessages((prev) => [...prev, botMessage])
        }

        setConversationHistory([...newHistory, { role: "assistant", content: aiResponse }])
        
     
        if (convId) {
          await addMessage(convId, 'bot', aiResponse, undefined)
        }
        
        setIsThinking(false)
        return
      } catch (error: any) {
        attempts++
        const nextModel = getNextModel(currentModel)
        
        if (!nextModel) {
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            text: "All models are currently unavailable. Please try again later or check if the Flask backend is running.",
            isBot: true,
          }
          setMessages((prev) => [...prev, errorMessage])
          setIsThinking(false)
          return
        }

        if (!hasShownWarning) {
          const isTimeout = error.message === 'timeout'
          const warningMessage = {
            id: `${Date.now()}-warning`,
            text: isTimeout 
              ? "The model was taking longer than expected to respond. Automatically switching to another model..."
              : "The model encountered a problem. Automatically switching to another model...",
            isBot: true,
          }
          setMessages((prev) => [...prev, warningMessage])
          hasShownWarning = true
        }
        
        currentModel = nextModel
        setSelectedModel(nextModel)
        
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    setCurrentConversationId(conversationId)
    setIsSidebarOpen(false) // Close sidebar on mobile after selection
    const result = await getConversationMessages(conversationId)
    
    if (result.success && result.messages) {
    
      const uiMessages = result.messages.map(msg => {
        const baseMsg = {
          id: msg.$id,
          text: msg.message,
          isBot: msg.sender === 'bot',
          attachmentType: msg.file_id ? 'image' as const : undefined,
          fileName: undefined
        }
        
        // Parse reasoning from stored messages
        if (msg.sender === 'bot') {
          const { reasoningText, answer } = parseReasoningResponse(msg.message)
          if (reasoningText) {
            return {
              ...baseMsg,
              text: answer,
              reasoning: {
                text: reasoningText,
                time: 0,
                isComplete: true
              }
            }
          }
        }
        
        return baseMsg
      })
      setMessages(uiMessages)
      
      // Mark all loaded messages as completed (no typing animation)
      const botMessageIds = uiMessages.filter(m => m.isBot).map(m => m.id)
      setPreloadedMessageIds(new Set(botMessageIds))

      const history: Message[] = result.messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message
      }))
      setConversationHistory(history)
    }
  }

  const handleNewChat = () => {
    setCurrentConversationId(null)
    setMessages([])
    setConversationHistory([])
    setPreloadedMessageIds(new Set())
    setIsSidebarOpen(false) // Close sidebar on mobile after new chat
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <ChatLayout>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-[#86ee02] text-black p-2 rounded-lg shadow-lg hover:bg-[#86ee02]/90 transition"
      >
        <Menu size={24} />
      </button>

      <ChatSidebar 
        selectedModel={selectedModel} 
        onModelChange={setSelectedModel}
        currentConversationId={currentConversationId || undefined}
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
        refreshTrigger={refreshSidebar}
        mode={mode}
        onModeChange={setMode}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <ChatContainer
        messages={messages}
        isThinking={isThinking}
        selectedModel={selectedModel}
        onSendMessage={handleSendMessage}
        isReasoningMode={mode === "reasoning"}
        isNavigationMode={mode === "navigation"}
        preloadedMessageIds={preloadedMessageIds}
      />
    </ChatLayout>
  )
}
