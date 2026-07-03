"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import type { MenuItem } from "@/types/menu"
import { formatPrice } from "@/lib/utils"

interface MenuCardProps {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 overflow-hidden"
    >
      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <span className="text-4xl">{item.image ? "🍽️" : "🍽️"}</span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{item.name}</h3>
          <span className="text-sm font-bold">
            {formatPrice(item.price)}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {item.category}
          </span>
          <button
            onClick={() => onAdd(item)}
            className="size-7 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
