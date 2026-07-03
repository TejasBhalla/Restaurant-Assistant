"use client"

import { X, ShoppingBag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useUIStore } from "@/stores/uiStore"
import { useCartStore } from "@/stores/cartStore"
import { CartItem } from "./CartItem"
import { OrderSummary } from "./OrderSummary"

export function CartSidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-zinc-900 border-l dark:border-zinc-800 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5" />
                <h2 className="font-semibold">Your Order</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              {items.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                  Your cart is empty
                </div>
              ) : (
                <div>
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onRemove={removeItem}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-4 py-4 border-t dark:border-zinc-800">
                <OrderSummary />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
