"use client"

import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function Success() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        <CheckCircle className="size-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Order Placed!</h1>
        <p className="text-zinc-500">
          Your order has been submitted successfully.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2 bg-zinc-900 text-white rounded-full hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
