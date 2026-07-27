import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { AccountMenu } from "@/components/layout/account-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { productCatalog } from "@/lib/products";

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
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];
  const productNavItems = productCatalog.map((product) => ({
    href: `/order/${product.slug}`,
    label: product.title,
  }));

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
      <div className="container-shell grid grid-cols-[330px_1fr] items-start gap-8 pt-2 pb-1 max-xl:grid-cols-[290px_1fr] max-lg:flex max-lg:min-h-[108px] max-lg:items-center max-lg:justify-between max-lg:gap-4 max-lg:py-2 max-md:min-h-[92px]">
        <Link href="/" className="relative -ml-8 -mb-10 block h-[188px] w-[395px] shrink-0 max-xl:-ml-3 max-xl:h-[150px] max-xl:w-[315px] max-lg:ml-0 max-lg:mb-0 max-lg:h-[92px] max-lg:w-[196px] max-md:h-[76px] max-md:w-[162px]">
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
          <div className="flex items-center justify-center gap-8 max-xl:gap-6">
            <Link
              href="/"
              className="nav-pill-button nav-pill-button-filled flex h-11 min-w-[112px] items-center justify-center gap-2 whitespace-nowrap px-5 text-center font-display text-[12px] font-black uppercase leading-none tracking-[0.02em] transition hover:-translate-y-0.5 max-xl:h-10 max-xl:min-w-[98px] max-xl:px-4 max-xl:text-[10px]"
            >
              <span>Home</span>
              <PawOutlineIcon className="h-4 w-4 text-white" />
            </Link>

            <div className="group relative">
              <Link
              href="/order/head-cake"
                className="nav-pill-button nav-pill-button-filled flex h-11 min-w-[132px] items-center justify-center gap-2 whitespace-nowrap px-5 text-center font-display text-[12px] font-black uppercase leading-none tracking-[0.02em] transition hover:-translate-y-0.5 max-xl:h-10 max-xl:min-w-[112px] max-xl:px-4 max-xl:text-[10px]"
              >
                <span>Shop cakes</span>
                <PawOutlineIcon className="h-4 w-4 text-white" />
              </Link>
              <div className="absolute left-1/2 top-full z-40 h-4 w-56 -translate-x-1/2" />
              <div className="invisible absolute left-1/2 top-[calc(100%+4px)] z-50 w-60 -translate-x-1/2 rounded-[24px] border-2 border-white bg-[#fff8eb] p-4 opacity-0 shadow-[0_18px_34px_rgba(123,68,40,0.18)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="space-y-3">
                  {productNavItems.map((product) => (
                    <Link
                      key={product.href}
                      href={product.href}
                      className="nav-pill-button nav-pill-button-soft flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--color-berry)] bg-white px-4 text-center font-display text-xs font-black uppercase text-[var(--color-berry)] shadow-none transition hover:-translate-y-0.5 hover:bg-[#fff4fa]"
                    >
                      <span>{product.label}</span>
                      <PawOutlineIcon className="h-4 w-4 text-[var(--color-berry)]" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navItems.slice(1).map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="nav-pill-button nav-pill-button-filled flex h-11 min-w-[112px] items-center justify-center gap-2 whitespace-nowrap px-5 text-center font-display text-[12px] font-black uppercase leading-none tracking-[0.02em] transition hover:-translate-y-0.5 max-xl:h-10 max-xl:min-w-[98px] max-xl:px-4 max-xl:text-[10px]"
              >
                <span>{item.label}</span>
                <PawOutlineIcon className="h-4 w-4 text-white" />
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
                className="nav-pill-button nav-pill-button-filled flex h-11 min-w-[112px] items-center justify-center gap-2 px-5 font-display text-[12px] font-black uppercase leading-none tracking-[0.02em] transition hover:-translate-y-0.5 max-xl:h-10 max-xl:min-w-[98px] max-xl:text-[10px]"
              >
                <span>Login</span>
                <PawOutlineIcon className="h-4 w-4 text-white" />
              </Link>
            )}
          </div>
        </nav>

        <MobileMenu
          accountHref={accountHref}
          accountLabel={accountLabel}
          isSignedIn={Boolean(session?.user)}
          navItems={navItems}
          productNavItems={productNavItems}
        />
      </div>
    </header>
  );
}
