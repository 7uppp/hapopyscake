"use client";

import { useState, useTransition } from "react";

import { signIn } from "next-auth/react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("We couldn't log you in with those details.");
      return;
    }

    window.location.href = "/account";
  }

  return (
    <div className="glass-card rounded-[32px] border border-white/60 p-8">
      <form
        action={(formData) => startTransition(() => void handleSubmit(formData))}
        className="space-y-4"
      >
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

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-[var(--color-berry)] px-5 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
