"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types/chat"

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
          isUser &&
            "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900",
          !isUser &&
            !isSystem &&
            "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
          isSystem &&
            "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200"
        )}
      >
        {message.text}
      </div>
    </motion.div>
  )
}
