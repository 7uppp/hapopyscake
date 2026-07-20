import Image from "next/image";
import Link from "next/link";

import { SocialQrModal } from "@/components/layout/social-qr-modal";
import { siteConfig } from "@/lib/site";

const quickLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  ...siteConfig.legalLinks,
];

export function Footer() {
  return (
    <footer className="mt-8 border-t-4 border-[var(--color-butter)] bg-[var(--color-cream)] py-4 backdrop-blur-xl md:mt-20 md:bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,246,251,0.96))] md:py-10">
      <div className="container-shell">
        <div className="relative overflow-hidden rounded-[28px] bg-[#ffdce9] px-5 py-6 shadow-[0_14px_30px_rgba(123,68,40,0.08)] md:grid md:gap-8 md:rounded-none md:bg-transparent md:p-0 md:shadow-none md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="absolute inset-x-0 bottom-[-24px] flex md:hidden">
            {Array.from({ length: 18 }).map((_, index) => (
              <div key={index} className="-mx-1 size-12 rounded-full bg-[#ffc7dc]" />
            ))}
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 md:hidden">
                <Image
                  src="/mascot.png"
                  alt="Happy's Cake pet bakery mascot"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <p className="font-display text-2xl text-[var(--color-berry)]">
                {siteConfig.name}
              </p>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--color-cocoa)]">
              Cute custom cakes for pet birthdays, cake smash moments, and extra
              sweet celebration photos.
            </p>
          </div>

          <div className="relative z-10 mt-7 md:mt-0">
            <p className="mb-3 font-display text-lg text-[var(--color-ink)]">
              Quick links
            </p>
            <div className="space-y-2 text-sm text-[var(--color-cocoa)]">
              {quickLinks.map((item) => (
                <div key={item.href}>
                  <Link href={item.href} className="transition hover:text-[var(--color-berry)]">
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-7 pb-5 md:mt-0 md:pb-0">
            <p className="mb-3 font-display text-lg text-[var(--color-ink)]">
              Follow us on
            </p>
            <SocialQrModal />
          </div>
        </div>
      </div>
    </footer>
  );
}
