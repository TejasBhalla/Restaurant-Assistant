import axios from "axios"
import type { MenuItem } from "@/types/menu"
import type { Cart } from "@/types/cart"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
})

export async function fetchMenu(): Promise<MenuItem[]> {
  const { data } = await api.get<{ items: MenuItem[] }>("/menu")
  return data.items
}

export async function submitCheckout(order: {
  customer_name: string
  items: Cart["items"]
}) {
  const { data } = await api.post("/checkout", order)
  return data
}
