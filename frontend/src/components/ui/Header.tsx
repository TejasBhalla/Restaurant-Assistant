"use client"

import { ShoppingCart, Radio, RadioOff } from "lucide-react"
import { useUIStore } from "@/stores/uiStore"
import { useVoiceStore } from "@/stores/voiceStore"
import { cn } from "@/lib/utils"

export function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const connected = useVoiceStore((s) => s.connected)

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">AI Restaurant</h1>
        <span
          className={cn(
            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
            connected
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}
        >
          {connected ? (
            <Radio className="size-3" />
          ) : (
            <RadioOff className="size-3" />
          )}
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <button
        onClick={toggleSidebar}
        className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <ShoppingCart className="size-5" />
      </button>
    </header>
  )
}
