export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  image: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "long-dragon",
    name: "Long Dragon Tee",
    description: "FYL graphic tee.",
    priceCents: 2000,
    image: "/products/long-dragon.png",
  },
  {
    id: "bubble-rustler",
    name: "Bubble Rustler Tee",
    description: "FYL graphic tee.",
    priceCents: 2000,
    image: "/products/bubble-rustler.png",
  },
  {
    id: "duskfoot",
    name: "Duskfoot Tee",
    description: "FYL graphic tee.",
    priceCents: 2000,
    image: "/products/duskfoot.png",
  },
  {
    id: "pocket-bird",
    name: "Pocket Bird Tee",
    description: "FYL graphic tee.",
    priceCents: 2000,
    image: "/products/pocket-bird.png",
  },
  {
    id: "yesterday-tomorrow",
    name: "Yesterday/Tomorrow Tee",
    description: "FYL graphic tee.",
    priceCents: 2000,
    image: "/products/yesterday-tomorrow.png",
  },
  {
    id: "shadowfish",
    name: "Shadowfish Tee",
    description: "FYL graphic tee.",
    priceCents: 2000,
    image: "/products/shadowfish.png",
  },
  {
    id: "tree-city-1",
    name: "Tree City Tee",
    description: "FYL graphic tee.",
    priceCents: 2000,
    image: "/products/tree-city-1.png",
  },
  {
    id: "tree-city-2",
    name: "Tree City Tee",
    description: "FYL graphic tee.",
    priceCents: 2000,
    image: "/products/tree-city-2.png",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
