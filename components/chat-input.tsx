"use client"

import type React from "react"
import { Paperclip, Send, X, FileText, Image as ImageIcon } from "lucide-react"
import { motion } from "framer-motion"
import { performOCR } from "@/lib/api"
import { useRef, useState } from "react"


interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string, extractedText?: string, fileType?: 'image' | 'pdf', fileName?: string, file?: File) => void
  isDisabled: boolean
}

interface UploadedFile {
  file: File
  extractedText: string | null
  isExtracting: boolean
}

export default function ChatInput({ value, onChange, onSubmit, isDisabled }: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)

  const getFileType = (): 'image' | 'pdf' | undefined => {
    if (!uploadedFile) return undefined
    return uploadedFile.file.type === 'application/pdf' ? 'pdf' : 'image'
  }

  const canSend = () => {
    // Can't send if file is still extracting
    if (uploadedFile?.isExtracting) return false
    // Can send if there's text or extracted text
    return value.trim() || uploadedFile?.extractedText
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend()) return

    onSubmit(value, uploadedFile?.extractedText || undefined, getFileType(), uploadedFile?.file.name, uploadedFile?.file)
    setUploadedFile(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!canSend()) return

      onSubmit(value, uploadedFile?.extractedText || undefined, getFileType(), uploadedFile?.file.name, uploadedFile?.file)
      setUploadedFile(null)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's a supported format
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!supportedTypes.includes(file.type)) {
      alert('Please select a JPEG, PNG, or PDF file')
      return
    }

    // Set file with extracting state
    setUploadedFile({
      file,
      extractedText: null,
      isExtracting: true
    })

    try {
      const result = await performOCR(file)

      if (result.success && result.text) {
        setUploadedFile({
          file,
          extractedText: result.text.trim(),
          isExtracting: false
        })
      } else {
        setUploadedFile({
          file,
          extractedText: '',
          isExtracting: false
        })
      }
    } catch (error: any) {
      console.error('OCR error:', error)
      alert(`OCR failed: ${error.message}`)
      setUploadedFile(null)
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  const getFileIcon = () => {
    if (!uploadedFile) return null

    if (uploadedFile.file.type === 'application/pdf') {
      return <FileText size={16} className="text-blue-500" />
    }
    return <ImageIcon size={16} className="text-red-500" />
  }

  const getFileName = () => {
    if (!uploadedFile) return ''
    const name = uploadedFile.file.name
    // Truncate filename if too long (max 15 chars before extension)
    const maxLength = 15
    const parts = name.split('.')
    const ext = parts.pop() || ''
    const baseName = parts.join('.')

    if (baseName.length > maxLength) {
      return `${baseName.substring(0, maxLength)}...${ext ? '.' + ext : ''}`
    }
    return name
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 pt-4">
      <motion.div
        className="flex flex-col items-center w-full gap-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          ease: [0.22, 0.61, 0.36, 1]
        }}
      >
        {/* File chips above input */}
        {uploadedFile && (
          <div className="flex gap-2 w-full max-w-2xl">
            <div className="flex items-center gap-3 bg-card border border-border rounded-full px-5 py-2.5 text-xs font-extralight" style={{ fontFamily: 'var(--font-geist-sans)' }}>
              {getFileIcon()}
              <span className="text-foreground font-extralight">{getFileName()}</span>
              {uploadedFile.isExtracting ? (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-1 text-muted-foreground hover:text-foreground group relative w-3.5 h-3.5 flex items-center justify-center"
                >
                  <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin group-hover:opacity-0 transition-opacity" />
                  <X size={14} className="opacity-0 group-hover:opacity-100 absolute transition-opacity" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 bg-card border border-border rounded-full px-4 py-3 max-w-2xl w-full min-h-[42px]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleFileClick}
            disabled={isDisabled || uploadedFile !== null}
            className="text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
            aria-label="Attach image or PDF for OCR"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or make a request..."
            disabled={isDisabled}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-extralight placeholder:text-sm disabled:opacity-50 outline-none leading-tight cursor-pointer"
          />

          <button
            type="submit"
            disabled={isDisabled || !canSend()}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition cursor-pointer"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Gateway may produce inaccurate information about people, places or fact. Check{" "}
          <a href="#" className="underline hover:no-underline">
            Privacy Notice
          </a>
        </p>
      </motion.div>
    </form>
  )
}
