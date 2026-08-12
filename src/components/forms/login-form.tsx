"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setError("");
    setIsPending(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("We couldn't log you in with those details.");
        return;
      }

      window.location.href = "/account";
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="glass-card rounded-[32px] border border-white/60 p-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-bold text-[var(--color-cocoa)]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-[var(--color-berry)] transition hover:text-[var(--color-ink)]"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
