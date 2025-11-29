"use client"

import { useState } from "react"
import { MessageSquare, Trash2 } from "lucide-react"
import ModelSelector from "./model-selector"

interface ChatSidebarProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

const models = [
  { id: "deepseek", name: "DeepSeek", icon: "/models/deepseek.png" },
  { id: "gpt4", name: "GPT-4", icon: "/models/gpt.png" },
  { id: "claude", name: "Claude", icon: "/models/claude.png" },
  { id: "grok", name: "Grok", icon: "/models/grok.png" },
]

const recentChats = [
  { id: "1", title: "Project discussion" },
  { id: "2", title: "API integration help" },
]

export default function ChatSidebar({ selectedModel, onModelChange }: ChatSidebarProps) {
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const currentModel = models.find((m) => m.id === selectedModel)

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
        <button className="w-full bg-[#86ee02] hover:bg-[#86ee02]/90 text-black font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm">
          <MessageSquare size={18} />
          New Chat
        </button>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4 px-4">RECENT</h3>
        <div className="space-y-1">
          {recentChats.map((chat) => (
            <button
              key={chat.id}
              className="w-full text-left px-4 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition text-sm font-extralight flex items-center justify-between group"
            >
              <span>{chat.title}</span>
              <Trash2 size={16} className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Model Selector at Bottom */}
      <div className="p-6 border-t border-sidebar-border">
        <ModelSelector
          currentModel={currentModel}
          models={models}
          onSelect={onModelChange}
          isOpen={isModelSelectorOpen}
          onOpenChange={setIsModelSelectorOpen}
        />
      </div>
    </div>
  )
}
