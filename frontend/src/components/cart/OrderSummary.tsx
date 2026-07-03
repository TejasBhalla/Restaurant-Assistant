"use client"

import { useCartStore } from "@/stores/cartStore"
import { formatPrice } from "@/lib/utils"

export function OrderSummary() {
  const subtotal = useCartStore((s) => s.subtotal)
  const tax = useCartStore((s) => s.tax)
  const total = useCartStore((s) => s.total)

  return (
    <div className="space-y-2 pt-3 border-t dark:border-zinc-800">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500">Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500">Tax (5%)</span>
        <span>{formatPrice(tax)}</span>
      </div>
      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  )
}
