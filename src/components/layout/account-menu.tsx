"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SignOutButton } from "@/components/ui/sign-out-button";

function PawOutlineIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.2 9.2c-1.2.1-2.2-1.1-2.3-2.7S6.5 3.6 7.7 3.5 9.9 4.6 10 6.2 9.4 9.1 8.2 9.2Z" />
      <path d="M15.8 9.2c1.2.1 2.2-1.1 2.3-2.7s-.6-2.9-1.8-3-2.2 1.1-2.3 2.7.6 2.9 1.8 3Z" />
      <path d="M12 8.4c-1.2 0-2.1-1.3-2.1-2.9S10.8 2.6 12 2.6s2.1 1.3 2.1 2.9-.9 2.9-2.1 2.9Z" />
      <path d="M5.2 13.3c-1 .5-2.4-.2-3-1.6s-.4-2.8.7-3.3 2.4.2 3 1.6.4 2.8-.7 3.3Z" />
      <path d="M18.8 13.3c1 .5 2.4-.2 3-1.6s.4-2.8-.7-3.3-2.4.2-3 1.6-.4 2.8.7 3.3Z" />
      <path d="M7.6 17.3c.8-2.7 2.2-4.3 4.4-4.3s3.6 1.6 4.4 4.3c.5 1.8-.8 3.4-2.7 2.8-.7-.2-1.1-.4-1.7-.4s-1 .2-1.7.4c-1.9.6-3.2-1-2.7-2.8Z" />
    </svg>
  );
}

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
    "nav-pill-button nav-pill-button-soft flex h-10 w-full items-center justify-center gap-2 px-4 text-center font-display text-[11px] font-black uppercase leading-none tracking-[0.03em] transition hover:-translate-y-0.5 disabled:opacity-60";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="nav-pill-button nav-pill-button-filled flex h-11 min-w-[112px] cursor-pointer flex-col items-center justify-center px-5 text-center font-display font-black uppercase leading-none transition hover:-translate-y-0.5 max-xl:h-10 max-xl:min-w-[98px] max-xl:px-4"
      >
        <span className="text-[9px] tracking-[0.08em]">Welcome</span>
        <span className="mt-1 max-w-full truncate text-[10px] tracking-[0.06em]">
          {displayName}
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
              <span>{accountLabel}</span>
              <PawOutlineIcon className="h-4 w-4 text-[var(--color-berry)]" />
            </Link>
            <SignOutButton className={menuItemClass} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
