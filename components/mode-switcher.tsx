"use client"

import { useState } from "react"

interface ModeSwitcherProps {
  mode: "standard" | "reasoning"
  onModeChange: (mode: "standard" | "reasoning") => void
}

export default function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  const [isChanging, setIsChanging] = useState(false)

  const handleModeChange = (newMode: "standard" | "reasoning") => {
    if (newMode === mode || isChanging) return
    
    setIsChanging(true)
    // Delay the actual mode change to allow fade-out animation
    setTimeout(() => {
      onModeChange(newMode)
      setIsChanging(false)
    }, 250)
  }

  return (
    <div className="w-full bg-white/5 rounded-lg p-0.5 flex relative border border-gray-800">
      {/* Animated background slider */}
      <div
        className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-[#87ed02] rounded-md transition-all duration-300 ease-in-out"
        style={{
          left: mode === "standard" ? "2px" : "calc(50% + 0px)",
        }}
      />

      {/* Standard button */}
      <button
        onClick={() => handleModeChange("standard")}
        disabled={isChanging}
        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors duration-300 relative z-10 ${mode === "standard" ? "text-[#000000]" : "text-gray-400"
          } ${isChanging ? "cursor-wait" : "cursor-pointer"}`}
      >
        Standard
      </button>

      {/* Reasoning button */}
      <button
        onClick={() => handleModeChange("reasoning")}
        disabled={isChanging}
        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors duration-300 relative z-10 ${mode === "reasoning" ? "text-[#000000]" : "text-gray-400"
          } ${isChanging ? "cursor-wait" : "cursor-pointer"}`}
      >
        Reasoning
      </button>
    </div>
  )
}
