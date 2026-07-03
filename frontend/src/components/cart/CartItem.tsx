"use client"

import { Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "@/types/cart"
import { formatPrice } from "@/lib/utils"

interface CartItemProps {
  item: CartItemType
  onRemove: (id: number) => void
  onUpdateQuantity: (id: number, quantity: number) => void
}

export function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: CartItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b dark:border-zinc-800">
      <div className="flex-1">
        <p className="text-sm font-medium">{item.name}</p>
        <p className="text-xs text-zinc-500">{formatPrice(item.price)} each</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              onUpdateQuantity(
                item.id,
                Math.max(1, item.quantity - 1)
              )
            }
            className="size-6 rounded border text-xs dark:border-zinc-700"
          >
            -
          </button>
          <span className="w-6 text-center text-sm">
            {item.quantity}
          </span>
          <button
            onClick={() =>
              onUpdateQuantity(item.id, item.quantity + 1)
            }
            className="size-6 rounded border text-xs dark:border-zinc-700"
          >
            +
          </button>
        </div>
        <p className="text-sm font-medium w-16 text-right">
          {formatPrice(item.price * item.quantity)}
        </p>
        <button
          onClick={() => onRemove(item.id)}
          className="text-zinc-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
