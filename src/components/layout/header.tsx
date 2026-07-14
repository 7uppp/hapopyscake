import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingCart } from "lucide-react";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/ui/sign-out-button";

export async function Header() {
  const session = await auth();
  const navItems = [
    { href: "/", label: "Home", active: true },
    { href: "/order", label: "Shop cakes" },
    { href: "/gallery", label: "Gallery" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="relative z-40 bg-[#fffaf1]">
      <div className="container-shell grid grid-cols-[330px_1fr_112px] items-start gap-8 pt-2 pb-1 max-xl:grid-cols-[290px_1fr_104px] max-lg:flex max-lg:min-h-[132px] max-lg:items-center max-lg:justify-between max-lg:gap-4 max-lg:py-3">
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

        <nav className="hidden w-full items-center justify-center gap-12 pt-[72px] max-xl:gap-9 max-xl:pt-[54px] lg:flex">
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
        </nav>

        <div className="hidden items-center justify-end gap-3 pt-[72px] max-xl:pt-[54px] lg:flex">
          {session?.user ? (
            <>
              <Link
                href={session.user.role === "ADMIN" ? "/admin/marketing" : "/account"}
                className="nav-candy-button nav-candy-button-soft flex h-[44px] min-w-[92px] items-center justify-center px-4 font-display text-[11px] font-black uppercase leading-none tracking-[0.02em] text-[var(--color-cocoa)] max-xl:h-10 max-xl:min-w-[84px] max-xl:text-[10px]"
              >
                <span className="relative z-10">{session.user.role === "ADMIN" ? "Dashboard" : "Account"}</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/order"
              className="nav-cart-button flex h-[44px] min-w-[92px] translate-y-[1px] items-center justify-center gap-2 rounded-full px-5 font-display text-[11px] font-black uppercase leading-none tracking-[0.02em] text-[var(--color-cocoa)] transition hover:-translate-y-0.5 max-xl:h-10 max-xl:min-w-[84px] max-xl:px-4 max-xl:text-[10px]"
            >
              <ShoppingCart size={18} />
              <span className="relative z-10">0</span>
            </Link>
          )}
        </div>

        <div className="relative z-50 flex items-center gap-3 lg:hidden">
          <details className="group relative">
            <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full bg-[var(--color-berry)] text-white shadow-[0_10px_18px_rgba(236,127,169,0.28)] marker:hidden">
              <Menu size={22} />
            </summary>
            <div className="absolute right-0 top-[calc(100%+14px)] w-56 rounded-[28px] border-2 border-white bg-[#fffaf1] p-4 shadow-[0_18px_34px_rgba(123,68,40,0.18)]">
              <div className="flex flex-col gap-3">
                <Link
                  href="/order"
                  className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-berry)] px-5 py-3 text-center font-display text-sm font-black uppercase text-white shadow-[0_8px_16px_rgba(236,127,169,0.2)]"
                >
                  <ShoppingCart size={17} />
                  Cart 0
                </Link>
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
                  <Link
                    href={session.user.role === "ADMIN" ? "/admin/marketing" : "/account"}
                    className="rounded-full bg-white px-5 py-3 text-center font-display text-sm font-black uppercase text-[var(--color-cocoa)]"
                  >
                    {session.user.role === "ADMIN" ? "Dashboard" : "Account"}
                  </Link>
                ) : null}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
