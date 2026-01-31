"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Trash2, X } from "lucide-react"
import ModelSelector from "./model-selector"
import ModeSwitcher from "./mode-switcher"
import { MODELS } from "@/lib/models"
import { getUserConversations, deleteConversation, type Conversation } from "@/lib/conversations"
import { getCurrentUser } from "@/lib/auth"
import { AnimatedCircularProgressBar } from "./ui/animated-circular-progress-bar"

interface ChatSidebarProps {
  selectedModel: string
  onModelChange: (model: string) => void
  currentConversationId?: string
  onConversationSelect: (conversationId: string) => void
  onNewChat: () => void
  refreshTrigger?: number
  mode: "standard" | "reasoning" | "navigation"
  onModeChange: (mode: "standard" | "reasoning" | "navigation") => void
  isOpen: boolean
  onClose: () => void
}

export default function ChatSidebar({
  selectedModel,
  onModelChange,
  currentConversationId,
  onConversationSelect,
  onNewChat,
  refreshTrigger,
  mode,
  onModeChange,
  isOpen,
  onClose
}: ChatSidebarProps) {
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteProgress, setDeleteProgress] = useState(0)
  const currentModel = MODELS.find((m) => m.id === selectedModel)

  useEffect(() => {
    loadConversations()
  }, [refreshTrigger])

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
    setDeletingId(conversationId)
    setDeleteProgress(0)
    const progressInterval = setInterval(() => {
      setDeleteProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    const result = await deleteConversation(conversationId)
    clearInterval(progressInterval)
    setDeleteProgress(100)

    setTimeout(() => {
      if (result.success) {
        setConversations(conversations.filter(c => c.$id !== conversationId))
        if (currentConversationId === conversationId) {
          onNewChat()
        }
      }
      setDeletingId(null)
      setDeleteProgress(0)
    }, 300)
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div className={`
        fixed lg:relative
        w-80 bg-black border-r border-sidebar-border flex flex-col h-screen
        z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-sidebar-border">
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        <div className="flex items-center gap-2 mb-4">
          <img src="/logo-icon.svg" alt="Solaris" className="w-9 h-9" />
          <span className="text-lg bg-gradient-to-r from-[#86ee02] via-[#a8ff3a] via-[#c4ff6e] via-[#d4ff8f] to-[#e8ffb8] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            <span className="font-bold">Solaris</span><span className="font-light">.dev</span>
          </span>
        </div>
        <button
          onClick={onNewChat}
          className="w-full bg-[#86ee02] hover:bg-[#86ee02]/90 text-black font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm cursor-pointer"
        >
          <MessageSquare size={18} />
          New Chat
        </button>
        <div className="mt-4">
          <ModeSwitcher mode={mode} onModeChange={onModeChange} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4 px-4">RECENT</h3>
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-center text-gray-500 text-sm py-4">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">No conversations yet</div>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat.$id}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition text-sm font-extralight flex items-center justify-between group cursor-pointer ${currentConversationId === chat.$id
                  ? 'bg-[#03301d] text-white'
                  : 'text-gray-300 hover:bg-white/10'
                  }`}
                onClick={() => onConversationSelect(chat.$id)}
              >
                <span className="truncate">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteConversation(chat.$id, e)}
                  className={`transition text-gray-400 hover:text-red-400 flex-shrink-0 ${deletingId === chat.$id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                >
                  {deletingId === chat.$id ? (
                    <AnimatedCircularProgressBar
                      max={100}
                      min={0}
                      value={deleteProgress}
                      gaugePrimaryColor="#87ed02"
                      gaugeSecondaryColor="rgba(135, 237, 2, 0.2)"
                      className="w-4 h-4"
                    />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

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
          className="w-full text-sm text-gray-400 hover:text-white transition py-2 cursor-pointer"
        >
          Logout
        </button>
      </div>
      </div>
    </>
  )
}
