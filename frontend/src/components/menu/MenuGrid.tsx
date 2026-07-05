"use client"

import { useEffect, useState } from "react"
import type { MenuItem } from "@/types/menu"
import { fetchMenu } from "@/services/api"
import { useCartStore } from "@/stores/cartStore"
import { MenuCard } from "./MenuCard"

export function MenuGrid() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    fetchMenu()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = (item: MenuItem) => {
    addItem({ id: item.id, name: item.name, price: item.price }, 1)
  }

  if (loading) {
    return (
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
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <MenuCard key={item.id} item={item} onAdd={handleAdd} />
      ))}
    </div>
  )
}
