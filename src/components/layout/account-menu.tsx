"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SignOutButton } from "@/components/ui/sign-out-button";

type AccountMenuProps = {
  accountHref: string;
  accountLabel: string;
  displayName: string;
};

export function AccountMenu({
  accountHref,
  accountLabel,
  displayName,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const menuItemClass =
    "w-full rounded-[16px] bg-white px-4 py-2.5 text-center font-display text-xs font-black uppercase tracking-[0.03em] text-[var(--color-cocoa)] transition hover:-translate-y-0.5 hover:text-[var(--color-berry)] disabled:opacity-60";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex max-w-[190px] cursor-pointer items-center gap-2 rounded-[20px] border border-white/80 bg-white/78 px-4 py-2 text-left shadow-[0_8px_18px_rgba(123,68,40,0.08)] transition hover:-translate-y-0.5"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[14px] bg-[var(--color-blush)] text-sm">
          🐶
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-[10px] font-black uppercase tracking-[0.08em] text-[var(--color-berry)]">
            Hi, {displayName}
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--color-cocoa)]">
            {accountLabel}
          </span>
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-44 rounded-[22px] border-2 border-white bg-[var(--color-cream)] p-3 shadow-[0_18px_34px_rgba(123,68,40,0.16)]">
          <div className="flex flex-col gap-2">
            <Link
              href={accountHref}
              onClick={() => setIsOpen(false)}
              className={menuItemClass}
            >
              {accountLabel}
            </Link>
            <SignOutButton className={menuItemClass} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
