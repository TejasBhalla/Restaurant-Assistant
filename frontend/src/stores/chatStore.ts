import { create } from "zustand"
import type { ChatMessage } from "@/types/chat"

interface ChatStore {
  messages: ChatMessage[]
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void
  clear: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (msg) => {
    const message: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    set((state) => ({ messages: [...state.messages, message] }))
  },
  clear: () => set({ messages: [] }),
}))
