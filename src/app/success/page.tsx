"use client";

import { Suspense } from "react";
import Link from "next/link";

function SuccessContent() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Order placed</h1>
      <p className="mt-3 text-zinc-500">
        This was a Stripe <strong>test-mode</strong> payment — no real money moved.
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

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
