"use client"

import { Mic, MicOff } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MicButtonProps {
  isListening: boolean
  onClick: () => void
  disabled?: boolean
}

export function MicButton({
  isListening,
  onClick,
  disabled,
}: MicButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center size-16 rounded-full transition-colors",
        isListening
          ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
          : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      whileTap={{ scale: 0.9 }}
      animate={
        isListening
          ? {
              scale: [1, 1.05, 1],
              transition: { repeat: Infinity, duration: 1.5 },
            }
          : {}
      }
    >
      {isListening ? (
        <Mic className="size-6" />
      ) : (
        <MicOff className="size-6" />
      )}
    </motion.button>
  )
}
