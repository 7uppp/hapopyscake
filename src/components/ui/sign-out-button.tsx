"use client";

import { useTransition } from "react";

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await signOut({ callbackUrl: "/" });
        })
      }
      className={
        className ??
        "rounded-[16px] border border-[var(--color-blush)] px-4 py-2 text-sm font-bold text-[var(--color-cocoa)] transition hover:bg-white disabled:opacity-60"
      }
      disabled={isPending}
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
