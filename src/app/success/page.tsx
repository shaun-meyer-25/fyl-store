import Link from "next/link";
import { stripe } from "@/lib/stripe";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let email: string | null = null;
  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      email = session.customer_details?.email ?? null;
    } catch {
      // session lookup is best-effort for display only
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Order placed</h1>
      <p className="mt-3 text-zinc-500">
        This was a Stripe <strong>test-mode</strong> payment — no real money moved.
        {email && <> Confirmation would go to {email}.</>}
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
      >
        Back to shop
      </Link>
    </div>
  );
}
