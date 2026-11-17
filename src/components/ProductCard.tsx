"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col gap-1.5">
      <div className="relative aspect-square overflow-hidden rounded-md bg-white shadow-sm">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 25vw, 180px"
          className="object-contain"
        />
      </div>
      <button
        onClick={() => addItem(product.id)}
        className="rounded-full bg-zinc-900/90 px-2 py-1 text-[11px] font-medium text-white opacity-90 transition group-hover:opacity-100"
      >
        Add to cart
      </button>
    </div>
  );
}
