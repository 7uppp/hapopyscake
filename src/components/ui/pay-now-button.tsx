"use client";

import { useState, useTransition } from "react";

type PayNowButtonProps = {
  orderId: string;
};

export function PayNowButton({ orderId }: PayNowButtonProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function payNow() {
    setError("");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "We couldn't restart payment.");
      return;
    }

    window.location.href = result.checkoutUrl;
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => void payNow())}
        className="rounded-full bg-[var(--color-berry)] px-4 py-2 text-xs font-black uppercase tracking-[0.05em] text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isPending ? "Opening..." : "Pay now"}
      </button>
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
