"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, type Product } from "@/lib/products";

export type CartLine = { productId: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  itemCount: number;
  lineItems: { product: Product; quantity: number }[];
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "fyl-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Deliberate one-time sync from localStorage after mount, so SSR and
      // the initial client render match (avoids a hydration mismatch).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt/missing storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore storage write failures (e.g. private browsing)
    }
  }, [lines, hydrated]);

  function addItem(productId: string, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId
            ? { ...l, quantity: l.quantity + quantity }
            : l
        );
      }
      return [...prev, { productId, quantity }];
    });
  }

  function removeItem(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, quantity } : l))
    );
  }

  function clear() {
    setLines([]);
  }

  const lineItems = useMemo(
    () =>
      lines
        .map((l) => {
          const product = PRODUCTS.find((p) => p.id === l.productId);
          return product ? { product, quantity: l.quantity } : null;
        })
        .filter((x): x is { product: Product; quantity: number } => x !== null),
    [lines]
  );

  const itemCount = lineItems.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalCents = lineItems.reduce(
    (sum, l) => sum + l.product.priceCents * l.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        addItem,
        removeItem,
        setQuantity,
        clear,
        itemCount,
        lineItems,
        subtotalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
