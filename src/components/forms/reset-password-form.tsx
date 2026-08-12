"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPassword } from "@/lib/password-reset";

const initialState = {
  ok: false,
  message: "",
};

type ResetPasswordFormProps = {
  email: string;
  token: string;
};

export function ResetPasswordForm({ email, token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);

  if (!email || !token) {
    return (
      <div className="glass-card rounded-[32px] border border-white/60 p-8">
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          This reset link is missing details. Please request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="mt-5 inline-flex rounded-full bg-[var(--color-berry)] px-5 py-3 font-bold text-white shadow-lg shadow-pink-300/50"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[32px] border border-white/60 p-8">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />

        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
            New password
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
            Confirm new password
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-berry)]"
          />
        </div>

        {state.message ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        {state.ok ? (
          <Link
            href="/login"
            className="inline-flex w-full justify-center rounded-full bg-[var(--color-berry)] px-5 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5"
          >
            Back to login
          </Link>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-[var(--color-berry)] px-5 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isPending ? "Updating..." : "Update password"}
          </button>
        )}
      </form>
    </div>
  );
}
