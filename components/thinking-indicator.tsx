export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex gap-1.5">
        <div
          className="w-2 h-2 rounded-full thinking-dot"
          style={{
            backgroundColor: "#ccff00",
            animationDelay: "0s",
          }}
        />
        <div
          className="w-2 h-2 rounded-full thinking-dot"
          style={{
            backgroundColor: "#ccff00",
            animationDelay: "0.2s",
          }}
        />
        <div
          className="w-2 h-2 rounded-full thinking-dot"
          style={{
            backgroundColor: "#ccff00",
            animationDelay: "0.4s",
          }}
        />
      </div>
      <span className="text-sm text-muted-foreground">Thinking...</span>
    </div>
  )
}
