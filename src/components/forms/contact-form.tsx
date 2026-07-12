"use client";

import { useState, useTransition } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<{
    type: "idle" | "error" | "success";
    message: string;
  }>({ type: "idle", message: "" });
  const [isPending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    setStatus({ type: "idle", message: "" });

    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      setStatus({
        type: "error",
        message: result.error ?? "We couldn't send your enquiry just now.",
      });
      return;
    }

    setStatus({
      type: "success",
      message: "Your enquiry is on its way. We'll be in touch soon.",
    });
  }

  return (
    <form
      action={(formData) => startTransition(() => void submit(formData))}
      className="glass-card space-y-4 rounded-[32px] border border-white/60 p-8"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
          Phone
        </label>
        <input
          type="text"
          name="phone"
          className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
          Tell us what you have in mind
        </label>
        <textarea
          name="message"
          required
          rows={6}
          className="w-full rounded-3xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
          Optional inspiration photo
        </label>
        <input
          type="file"
          name="attachment"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full rounded-2xl border border-dashed border-[var(--color-blush)] bg-white px-4 py-3 text-sm text-[var(--color-cocoa)]"
        />
      </div>

      {status.type !== "idle" ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-[var(--color-berry)] px-6 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}
