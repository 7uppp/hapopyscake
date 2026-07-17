import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { auth } from "@/auth";
import { AccountMenu } from "@/components/layout/account-menu";
import { SignOutButton } from "@/components/ui/sign-out-button";

export async function Header() {
  const session = await auth();
  const accountHref = session?.user?.role === "ADMIN" ? "/admin/marketing" : "/account";
  const accountLabel = session?.user?.role === "ADMIN" ? "Dashboard" : "Account";
  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    "Friend";
  const navItems = [
    { href: "/", label: "Home", active: true },
    { href: "/order", label: "Shop cakes" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="relative z-40 bg-[var(--color-cream)]">
      <div className="border-b border-white/70 bg-[linear-gradient(90deg,#ffd8e8_0%,#fff1a8_50%,#ffd8e8_100%)] shadow-[0_8px_20px_rgba(236,127,169,0.12)]">
        <Link
          href="/register"
          className="container-shell flex min-h-11 items-center justify-center gap-3 py-2 text-center font-display text-sm font-black text-[var(--color-cocoa)] md:text-base"
        >
          <span className="text-xl" aria-hidden="true">🍪</span>
          <span>
            Sign up today and get a free cookie with your first cake order!
          </span>
          <span className="text-xl" aria-hidden="true">🐾</span>
        </Link>
      </div>
      <div className="container-shell grid grid-cols-[330px_1fr] items-start gap-8 pt-2 pb-1 max-xl:grid-cols-[290px_1fr] max-lg:flex max-lg:min-h-[132px] max-lg:items-center max-lg:justify-between max-lg:gap-4 max-lg:py-3">
        <Link href="/" className="relative -ml-8 -mb-10 block h-[188px] w-[395px] shrink-0 max-xl:-ml-3 max-xl:h-[150px] max-xl:w-[315px] max-lg:ml-0 max-lg:mb-0 max-lg:h-[112px] max-lg:w-[238px] max-md:h-[92px] max-md:w-[196px]">
          <Image
            src="/logo.png"
            alt="Happy's Cake logo"
            fill
            sizes="(max-width: 768px) 196px, (max-width: 1024px) 238px, (max-width: 1280px) 315px, 395px"
            className="object-contain"
            preload
          />
        </Link>

        <nav className="hidden w-full items-center justify-end pt-[72px] pr-2 max-xl:pt-[54px] max-xl:pr-1 lg:flex">
          <div className="flex items-center justify-center gap-14 max-xl:gap-10">
            {navItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={`nav-candy-button flex h-[44px] min-w-[92px] items-center justify-center whitespace-nowrap px-4 text-center font-display text-[11px] font-black uppercase leading-none tracking-[0.02em] transition hover:-translate-y-0.5 max-xl:h-10 max-xl:min-w-[84px] max-xl:px-3 max-xl:text-[10px] ${
                  item.active
                    ? "nav-candy-button-active text-white"
                    : "nav-candy-button-soft text-[var(--color-cocoa)]"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
            {session?.user ? (
              <AccountMenu
                accountHref={accountHref}
                accountLabel={accountLabel}
                displayName={displayName}
              />
            ) : (
              <Link
                href="/login"
                className="nav-candy-button nav-candy-button-soft flex h-[44px] min-w-[92px] items-center justify-center px-4 font-display text-[11px] font-black uppercase leading-none tracking-[0.02em] text-[var(--color-cocoa)] transition hover:-translate-y-0.5 max-xl:h-10 max-xl:min-w-[84px] max-xl:text-[10px]"
              >
                <span className="relative z-10">Login</span>
              </Link>
            )}
          </div>
        </nav>

        <div className="relative z-50 flex items-center gap-3 lg:hidden">
          <details className="group relative">
            <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full bg-[var(--color-berry)] text-white shadow-[0_10px_18px_rgba(236,127,169,0.28)] marker:hidden">
              <Menu size={22} />
            </summary>
            <div className="absolute right-0 top-[calc(100%+14px)] w-56 rounded-[28px] border-2 border-white bg-[var(--color-cream)] p-4 shadow-[0_18px_34px_rgba(123,68,40,0.18)]">
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link
                    key={`mobile-${item.href}-${item.label}`}
                    href={item.href}
                    className="rounded-full bg-white px-5 py-3 text-center font-display text-sm font-black uppercase text-[var(--color-cocoa)]"
                  >
                    {item.label}
                  </Link>
                ))}
                {session?.user ? (
                  <>
                    <Link
                      href={accountHref}
                      className="rounded-[22px] bg-white px-5 py-3 text-center text-[var(--color-cocoa)]"
                    >
                      <span className="block font-display text-sm font-black text-[var(--color-berry)]">
                        Hi, {displayName}
                      </span>
                      <span className="mt-1 block text-xs font-bold uppercase">
                        {accountLabel}
                      </span>
                    </Link>
                    <SignOutButton />
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-full bg-white px-5 py-3 text-center font-display text-sm font-black uppercase text-[var(--color-cocoa)]"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
