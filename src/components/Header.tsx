"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        FYL
      </Link>
      <Link
        href="/cart"
        className="rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium shadow backdrop-blur dark:bg-zinc-900/80"
      >
        Cart{itemCount > 0 ? ` (${itemCount})` : ""}
      </Link>
    </header>
  );
}
