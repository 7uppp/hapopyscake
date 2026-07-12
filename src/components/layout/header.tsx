import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { siteConfig } from "@/lib/site";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[var(--color-butter)] px-4 py-2 text-center text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--color-ink)]">
        Brisbane pickup · custom pet birthday cakes · order ahead for weekends
      </div>
      <div className="border-b border-white/70 bg-white/82 backdrop-blur-xl">
        <div className="container-shell flex items-center justify-between gap-8 py-2">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex h-44 w-44 items-center justify-center overflow-hidden bg-transparent md:h-52 md:w-52">
              <Image
                src="/logo.png"
                alt={`${siteConfig.name} logo`}
                fill
                sizes="208px"
                className="object-contain"
                priority
              />
            </span>
            <div className="hidden lg:block">
              <div className="font-display text-[1.55rem] text-[var(--color-berry)]">
                {siteConfig.name}
              </div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-cocoa)]">
                Custom pet treats
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--color-cocoa)] md:flex">
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[var(--color-berry)]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link
                  href={session.user.role === "ADMIN" ? "/admin/marketing" : "/account"}
                  className="rounded-full border-2 border-[var(--color-blush)] bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--color-berry)] transition hover:-translate-y-0.5"
                >
                  {session.user.role === "ADMIN" ? "Dashboard" : "Account"}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border-2 border-[var(--color-blush)] px-4 py-2 text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--color-berry)] transition hover:bg-white"
                >
                  Login
                </Link>
                <Link
                  href="/order"
                  className="rounded-full bg-[var(--color-berry)] px-5 py-2 text-sm font-extrabold uppercase tracking-[0.08em] text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5"
                >
                  Order now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
