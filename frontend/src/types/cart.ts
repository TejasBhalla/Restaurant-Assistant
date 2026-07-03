export interface CartItem {
  id: number
  name: string
  quantity: number
  price: number
  size?: string
  specialInstructions?: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}
