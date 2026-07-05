"use client"

import { useEffect, useState } from "react"
import { fetchMenu } from "@/services/api"
import type { MenuItem } from "@/types/menu"
import { MenuCard } from "@/components/menu/MenuCard"
import { useCartStore } from "@/stores/cartStore"
import { CartSidebar } from "@/components/cart/CartSidebar"
import { Header } from "@/components/ui/Header"

export default function Dashboard() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)

  useEffect(() => {
    fetchMenu()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = (item: MenuItem) => {
    addItem({ id: item.id, name: item.name, price: item.price }, 1)
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        <h1 className="text-2xl font-bold mb-2">Menu Dashboard</h1>
        <p className="text-zinc-500 text-sm mb-6">
          Browse and add items to your order
        </p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border dark:border-zinc-800 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-zinc-200 dark:bg-zinc-800" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleAdd} />
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border dark:border-zinc-800">
            <h2 className="font-semibold mb-2">Current Order</h2>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm py-1"
              >
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </main>
      <CartSidebar />
    </>
  )
}
