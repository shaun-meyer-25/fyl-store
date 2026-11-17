"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { lineItems, setQuantity, removeItem, subtotalCents, lines } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-zinc-500">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Cart</h1>
      <ul className="flex flex-col gap-6">
        {lineItems.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-sm text-zinc-500">{formatPrice(product.priceCents)}</p>
            </div>
            <input
              type="number"
              min={1}
              max={20}
              value={quantity}
              onChange={(e) => setQuantity(product.id, Number(e.target.value))}
              className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-transparent"
            />
            <button
              onClick={() => removeItem(product.id)}
              className="text-sm text-zinc-500 underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <span className="text-sm font-medium">Subtotal</span>
        <span className="text-lg font-semibold">{formatPrice(subtotalCents)}</span>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={checkout}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
      >
        {loading ? "Redirecting to checkout…" : "Checkout with Stripe (test mode)"}
      </button>
    </div>
  );
}
