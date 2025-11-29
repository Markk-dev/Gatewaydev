"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Trash2 } from "lucide-react"
import ModelSelector from "./model-selector"
import { MODELS } from "@/lib/models"
import { getUserConversations, deleteConversation, type Conversation } from "@/lib/conversations"
import { getCurrentUser } from "@/lib/auth"

interface ChatSidebarProps {
  selectedModel: string
  onModelChange: (model: string) => void
  currentConversationId?: string
  onConversationSelect: (conversationId: string) => void
  onNewChat: () => void
}

export default function ChatSidebar({ 
  selectedModel, 
  onModelChange, 
  currentConversationId,
  onConversationSelect,
  onNewChat
}: ChatSidebarProps) {
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const currentModel = MODELS.find((m) => m.id === selectedModel)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const user = await getCurrentUser()
    if (user) {
      const result = await getUserConversations(user.$id)
      if (result.success) {
        setConversations(result.conversations)
      }
    }
    setIsLoading(false)
  }

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const result = await deleteConversation(conversationId)
    if (result.success) {
      setConversations(conversations.filter(c => c.$id !== conversationId))
      if (currentConversationId === conversationId) {
        onNewChat()
      }
    }
  }

  return (
    <div className="w-80 bg-black border-r border-sidebar-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <img src="/logo-icon.svg" alt="Gateway" className="w-9 h-9" />
          <span className="text-lg bg-gradient-to-r from-[#86ee02] via-[#a8ff3a] via-[#c4ff6e] via-[#d4ff8f] to-[#e8ffb8] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            <span className="font-bold">Gateway</span><span className="font-light">.dev</span>
          </span>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={onNewChat}
          className="w-full bg-[#86ee02] hover:bg-[#86ee02]/90 text-black font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm"
        >
          <MessageSquare size={18} />
          New Chat
        </button>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4 px-4">RECENT</h3>
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-center text-gray-500 text-sm py-4">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">No conversations yet</div>
          ) : (
            conversations.map((chat) => (
              <button
                key={chat.$id}
                onClick={() => onConversationSelect(chat.$id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition text-sm font-extralight flex items-center justify-between group ${
                  currentConversationId === chat.$id 
                    ? 'bg-white/20 text-white' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="truncate">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteConversation(chat.$id, e)}
                  className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Model Selector and Logout at Bottom */}
      <div className="p-6 border-t border-sidebar-border space-y-3">
        <ModelSelector
          currentModel={currentModel}
          models={MODELS}
          onSelect={onModelChange}
          isOpen={isModelSelectorOpen}
          onOpenChange={setIsModelSelectorOpen}
        />
        <button
          onClick={async () => {
            const { logout } = await import("@/lib/auth")
            await logout()
            window.location.href = "/"
          }}
          className="w-full text-sm text-gray-400 hover:text-white transition py-2"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
