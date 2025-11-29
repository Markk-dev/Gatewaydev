export interface ModelInfo {
  id: string
  name: string
  icon: string
  provider: string
}

export const MODELS: ModelInfo[] = [
  { 
    id: "x-ai/grok-4.1-fast:free", 
    name: "Grok 4.1 Fast", 
    icon: "/models/grok.png",
    provider: "xAI"
  },
  { 
    id: "openai/gpt-oss-20b:free", 
    name: "GPT OSS 20B", 
    icon: "/models/gpt.png",
    provider: "OpenAI"
  },
  { 
    id: "google/gemma-3n-e2b-it:free", 
    name: "Gemma 3N", 
    icon: "/models/gemini.png",
    provider: "Google"
  },
  { 
    id: "qwen/qwen3-4b:free", 
    name: "Qwen3 4B", 
    icon: "/models/Qwen.png",
    provider: "Alibaba"
  },
  { 
    id: "mistralai/mistral-small-3.1-24b-instruct:free", 
    name: "Mistral Small", 
    icon: "/models/Mistral.png",
    provider: "Mistral AI"
  },
  { 
    id: "tngtech/deepseek-r1t2-chimera:free", 
    name: "DeepSeek R1T2", 
    icon: "/models/deepseek.png",
    provider: "DeepSeek"
  },
]

export function getModelInfo(modelId: string): ModelInfo | undefined {
  return MODELS.find(m => m.id === modelId)
}

export function getModelName(modelId: string): string {
  return getModelInfo(modelId)?.name || modelId
}

export function getModelIcon(modelId: string): string {
  return getModelInfo(modelId)?.icon || "/models/gpt.png"
}
