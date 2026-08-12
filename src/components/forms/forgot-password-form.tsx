"use client";

import { useActionState } from "react";

import { requestPasswordReset } from "@/lib/password-reset";

const initialState = {
  ok: false,
  message: "",
};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <div className="glass-card rounded-[32px] border border-white/60 p-8">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
            Account email
          </label>
          <input
            type="email"
            name="email"
            required
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-[var(--color-berry)] px-5 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
