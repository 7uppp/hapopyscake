"use client";

import { useTransition } from "react";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await signOut({ callbackUrl: "/" });
        })
      }
      className="rounded-full border border-[var(--color-blush)] px-4 py-2 text-sm font-bold text-[var(--color-cocoa)] transition hover:bg-white disabled:opacity-60"
      disabled={isPending}
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
