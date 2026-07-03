import { create } from "zustand"
import type { CartItem } from "@/types/cart"

interface CartStore {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (itemId: number) => void
  updateQuantity: (itemId: number, quantity: number) => void
  clearCart: () => void
  recalculate: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,

  addItem: (item) => {
    const items = get().items
    const existing = items.find((i) => i.id === item.id)
    if (existing) {
      existing.quantity += item.quantity
      set({ items: [...items] })
    } else {
      set({ items: [...items, item] })
    }
    get().recalculate()
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((i) => i.id !== itemId) })
    get().recalculate()
  },

  updateQuantity: (itemId, quantity) => {
    const items = get().items
    const item = items.find((i) => i.id === itemId)
    if (item) {
      item.quantity = quantity
      set({ items: [...items] })
    }
    get().recalculate()
  },

  clearCart: () => {
    set({ items: [], subtotal: 0, tax: 0, total: 0 })
  },

  recalculate: () => {
    const subtotal = get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const tax = Math.round(subtotal * 0.05 * 100) / 100
    const total = subtotal + tax
    set({ subtotal, tax, total })
  },
}))
