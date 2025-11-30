"use client"

import { ChevronDown } from "lucide-react"

interface Model {
  id: string
  name: string
  icon: string
}

interface ModelSelectorProps {
  currentModel?: Model
  models: Model[]
  onSelect: (modelId: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function ModelSelector({ currentModel, models, onSelect, isOpen, onOpenChange }: ModelSelectorProps) {
  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition cursor-pointer"
      >
        <img src={currentModel?.icon} alt={currentModel?.name} className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <div className="text-xs font-light text-sidebar-foreground truncate">
            {currentModel?.name || "Select Model"}
          </div>
        </div>
        <ChevronDown size={16} className={`transition-transform flex-shrink-0 text-[#86ee02] ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-black/90 border border-white/10 rounded-lg backdrop-blur-sm overflow-hidden">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onSelect(model.id)
                onOpenChange(false)
              }}
              className={`w-full flex items-center px-4 py-2 text-left text-xs font-light transition cursor-pointer ${currentModel?.id === model.id
                ? "bg-[#86ee02]/20 text-[#86ee02]"
                : "text-sidebar-foreground hover:bg-white/5"
                }`}
            >
              {model.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
