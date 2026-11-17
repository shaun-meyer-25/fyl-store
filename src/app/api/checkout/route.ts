import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProduct } from "@/lib/products";

type CheckoutBody = {
  lines: { productId: string; quantity: number }[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CheckoutBody;

  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const line_items = body.lines.map(({ productId, quantity }) => {
    const product = getProduct(productId);
    if (!product) {
      throw new Error(`Unknown product: ${productId}`);
    }
    const safeQuantity = Math.min(Math.max(1, Math.floor(quantity)), 20);
    return {
      quantity: safeQuantity,
      price_data: {
        currency: "usd",
        unit_amount: product.priceCents,
        product_data: {
          name: product.name,
          description: product.description,
          images: [],
        },
      },
    };
  });

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
  });

  return NextResponse.json({ url: session.url });
}
