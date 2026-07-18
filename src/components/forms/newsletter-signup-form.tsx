"use client";

import { useState, useTransition } from "react";

export function NewsletterSignupForm() {
  const [message, setMessage] = useState("No spam, only treats & tail wags! ♥");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    setIsError(false);
    setMessage("");

    const response = await fetch("/api/marketing/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setIsError(true);
      setMessage(result.error ?? "We couldn't save your signup right now.");
      return;
    }

    setMessage("You're in the pack! We'll send the sweet stuff soon.");
  }

  return (
    <form
      action={(formData) => startTransition(() => void submit(formData))}
      className="space-y-2"
    >
      <div className="flex rounded-full bg-white p-1.5 shadow-[0_8px_16px_rgba(123,68,40,0.08)]">
        <input
          type="email"
          name="email"
          required
          placeholder="Enter your email"
          className="min-h-12 flex-1 rounded-full bg-transparent px-6 text-sm text-[var(--color-cocoa)] outline-none placeholder:text-[var(--color-cocoa)]/55"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--color-berry)] px-9 text-sm font-black uppercase tracking-[0.04em] text-white transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? "Joining..." : "Join the pack"}
        </button>
      </div>
      <p
        className={`text-center text-sm ${
          isError ? "text-rose-700" : "text-[var(--color-cocoa)]"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
