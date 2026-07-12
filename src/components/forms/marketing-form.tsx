"use client";

import { useState, useTransition } from "react";

export function MarketingForm() {
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    setStatus("");

    const response = await fetch("/api/marketing/send", {
      method: "POST",
      body: JSON.stringify({
        subject: String(formData.get("subject") ?? ""),
        html: String(formData.get("html") ?? ""),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      setStatus(result.error ?? "Campaign send failed.");
      return;
    }

    setStatus(`Campaign sent to ${result.recipients} subscribed contacts.`);
  }

  return (
    <form
      action={(formData) => startTransition(() => void submit(formData))}
      className="glass-card space-y-4 rounded-[32px] border border-white/60 p-8"
    >
      <div>
        <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
          Subject line
        </label>
        <input
          type="text"
          name="subject"
          required
          className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
          Email content
        </label>
        <textarea
          name="html"
          rows={8}
          required
          className="w-full rounded-3xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
          placeholder="<h1>Birthday weekend special</h1><p>...</p>"
        />
      </div>

      {status ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--color-cocoa)]">
          {status}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--color-berry)] px-6 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send campaign"}
        </button>
        <a
          href="/api/marketing/export"
          className="rounded-full border border-[var(--color-blush)] px-6 py-3 font-bold text-[var(--color-berry)] transition hover:bg-white"
        >
          Export subscribers CSV
        </a>
      </div>
    </form>
  );
}
