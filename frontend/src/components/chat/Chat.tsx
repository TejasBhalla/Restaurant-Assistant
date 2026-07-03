"use client"

import { useEffect, useRef } from "react"
import { useChatStore } from "@/stores/chatStore"
import { useVoiceStore } from "@/stores/voiceStore"
import { ChatBubble } from "./ChatBubble"
import { TypingIndicator } from "./TypingIndicator"

export function Chat() {
  const messages = useChatStore((s) => s.messages)
  const isListening = useVoiceStore((s) => s.isListening)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
          Press the mic button and start speaking...
        </div>
      )}
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {isListening && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
