"use client";

import { useState, useTransition } from "react";

import { signIn } from "next-auth/react";

export function RegisterForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    setError("");
    setSuccess("");

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      marketingOptIn: formData.get("marketingOptIn") === "on",
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "We couldn't create your account.");
      return;
    }

    setSuccess("Account created. Logging you in...");

    const loginResult = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    if (loginResult?.error) {
      window.location.href = "/login";
      return;
    }

    window.location.href = "/account";
  }

  return (
    <div className="glass-card rounded-[32px] border border-white/60 p-8">
      <form
        action={(formData) => startTransition(() => void submit(formData))}
        className="space-y-4"
      >
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
        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
          />
        </div>
        <label className="flex gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[var(--color-cocoa)]">
          <input type="checkbox" name="marketingOptIn" className="mt-1" />
          <span>
            I want launch updates, seasonal offers, and birthday reminder emails.
          </span>
        </label>

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-[var(--color-berry)] px-5 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
