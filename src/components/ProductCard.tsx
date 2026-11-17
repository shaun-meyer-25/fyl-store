"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { withBasePath } from "@/lib/base-path";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;

    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomed(false);
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zoomed]);

  return (
    <div className="group flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => setZoomed(true)}
        className="relative aspect-square overflow-hidden rounded-md bg-white shadow-sm"
      >
        <Image
          src={withBasePath(product.image)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 25vw, 180px"
          className="object-contain"
        />
      </button>
      <button
        onClick={() => addItem(product.id)}
        className="rounded-full bg-zinc-900/90 px-2 py-1 text-[11px] font-medium text-white opacity-90 transition group-hover:opacity-100"
      >
        Add to cart
      </button>

      {zoomed &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
            onClick={() => setZoomed(false)}
          >
            <div className="relative aspect-[419/452] w-full max-w-lg">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-zinc-900"
            >
              Close
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
