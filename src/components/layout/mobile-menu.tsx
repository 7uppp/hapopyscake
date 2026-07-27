"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SignOutButton } from "@/components/ui/sign-out-button";

type NavItem = {
  href: string;
  label: string;
};

type MobileMenuProps = {
  accountHref: string;
  accountLabel: string;
  isSignedIn: boolean;
  navItems: NavItem[];
  productNavItems: NavItem[];
};

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

export function MobileMenu({
  accountHref,
  accountLabel,
  isSignedIn,
  navItems,
  productNavItems,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setIsShopOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsShopOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setIsShopOpen(false);
  };

  return (
    <div ref={menuRef} className="relative z-50 flex items-center gap-3 lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Toggle mobile menu"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[var(--color-berry)] text-white shadow-[0_10px_18px_rgba(236,127,169,0.28)]"
      >
        <Menu size={22} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+14px)] w-56 rounded-[28px] border-2 border-white bg-[var(--color-cream)] p-4 shadow-[0_18px_34px_rgba(123,68,40,0.18)]">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={closeMenu}
              className="nav-pill-button nav-pill-button-filled flex items-center justify-center gap-2 px-5 py-3 text-center font-display text-sm font-black uppercase"
            >
              <span>Home</span>
              <PawOutlineIcon className="h-5 w-5 text-white" />
            </Link>
            <div>
              <button
                type="button"
                aria-expanded={isShopOpen}
                onClick={() => setIsShopOpen((current) => !current)}
                className="nav-pill-button nav-pill-button-soft flex w-full cursor-pointer items-center justify-center gap-2 px-5 py-3 text-center font-display text-sm font-black uppercase"
              >
                <span>Shop cakes</span>
                <PawOutlineIcon className="h-5 w-5 text-[var(--color-berry)]" />
              </button>
              {isShopOpen ? (
                <div className="mt-3 space-y-3 rounded-[22px] bg-white/70 p-3">
                  {productNavItems.map((product) => (
                    <Link
                      key={`mobile-product-${product.href}`}
                      href={product.href}
                      onClick={closeMenu}
                      className="nav-pill-button nav-pill-button-soft flex min-h-[46px] items-center justify-center rounded-full border-2 border-[var(--color-berry)] bg-white px-5 py-3 text-center font-display text-[11px] font-black uppercase leading-none text-[var(--color-berry)] shadow-none"
                    >
                      <span className="whitespace-nowrap">{product.label}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            {navItems.slice(1).map((item) => (
              <Link
                key={`mobile-${item.href}-${item.label}`}
                href={item.href}
                onClick={closeMenu}
                className="nav-pill-button nav-pill-button-soft flex items-center justify-center gap-2 px-5 py-3 text-center font-display text-sm font-black uppercase"
              >
                <span>{item.label}</span>
                <PawOutlineIcon className="h-5 w-5 text-[var(--color-berry)]" />
              </Link>
            ))}
            {isSignedIn ? (
              <>
                <Link
                  href={accountHref}
                  onClick={closeMenu}
                  className="nav-pill-button nav-pill-button-soft flex items-center justify-center gap-2 rounded-full border-2 border-[var(--color-berry)] bg-white px-5 py-3 text-center font-display text-sm font-black uppercase text-[var(--color-berry)] shadow-none"
                >
                  <span>{accountLabel}</span>
                  <PawOutlineIcon className="h-5 w-5 text-[var(--color-berry)]" />
                </Link>
                <SignOutButton className="nav-pill-button nav-pill-button-soft flex items-center justify-center gap-2 rounded-full border-2 border-[var(--color-berry)] bg-white px-5 py-3 text-center font-display text-sm font-black uppercase text-[var(--color-berry)] shadow-none transition hover:-translate-y-0.5 disabled:opacity-60" />
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="nav-pill-button nav-pill-button-soft flex items-center justify-center gap-2 px-5 py-3 text-center font-display text-sm font-black uppercase"
              >
                <span>Login</span>
                <PawOutlineIcon className="h-5 w-5 text-[var(--color-berry)]" />
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
