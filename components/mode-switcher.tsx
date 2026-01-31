"use client"

import { useState } from "react"

interface ModeSwitcherProps {
  mode: "standard" | "reasoning" | "navigation"
  onModeChange: (mode: "standard" | "reasoning" | "navigation") => void
}

export default function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  const [isChanging, setIsChanging] = useState(false)

  const handleModeChange = (newMode: "standard" | "reasoning" | "navigation") => {
    if (newMode === mode || isChanging) return
    
    setIsChanging(true)
    setTimeout(() => {
      onModeChange(newMode)
      setIsChanging(false)
    }, 250)
  }

  const getSliderPosition = () => {
    if (mode === "standard") return "2px"
    if (mode === "reasoning") return "calc(33.333% + 1px)"
    return "calc(66.666% + 0px)"
  }

  return (
    <div className="w-full bg-white/5 rounded-lg p-0.5 flex relative border border-gray-800">
      <div
        className="absolute top-0.5 bottom-0.5 w-[calc(33.333%-2px)] bg-[#87ed02] rounded-md transition-all duration-300 ease-in-out"
        style={{
          left: getSliderPosition(),
        }}
      />
      <button
        onClick={() => handleModeChange("standard")}
        disabled={isChanging}
        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors duration-300 relative z-10 ${mode === "standard" ? "text-[#000000]" : "text-gray-400"
          } ${isChanging ? "cursor-wait" : "cursor-pointer"}`}
      >
        Standard
      </button>
      <button
        onClick={() => handleModeChange("reasoning")}
        disabled={isChanging}
        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors duration-300 relative z-10 ${mode === "reasoning" ? "text-[#000000]" : "text-gray-400"
          } ${isChanging ? "cursor-wait" : "cursor-pointer"}`}
      >
        Reasoning
      </button>
      <button
        onClick={() => handleModeChange("navigation")}
        disabled={isChanging}
        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors duration-300 relative z-10 ${mode === "navigation" ? "text-[#000000]" : "text-gray-400"
          } ${isChanging ? "cursor-wait" : "cursor-pointer"}`}
      >
        Navigation
      </button>
    </div>
  )
}
