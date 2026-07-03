"use client"

import { Header } from "@/components/ui/Header"
import { Chat } from "@/components/chat/Chat"
import { VoiceVisualizer } from "@/components/voice/VoiceVisualizer"
import { CartSidebar } from "@/components/cart/CartSidebar"
import { MenuGrid } from "@/components/menu/MenuGrid"
import { useWebSocket } from "@/hooks/useWebSocket"
import { Toaster } from "react-hot-toast"

export default function Home() {
  useWebSocket()

  return (
    <>
      <Toaster position="top-center" />
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto border-b dark:border-zinc-800">
            <div className="max-w-3xl mx-auto p-4">
              <h2 className="text-lg font-semibold mb-4">Menu</h2>
              <MenuGrid />
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <Chat />
          </div>
          <div className="px-4 py-4 border-t dark:border-zinc-800 flex justify-center">
            <VoiceVisualizer />
          </div>
        </div>
      </main>
      <CartSidebar />
    </>
  )
}
