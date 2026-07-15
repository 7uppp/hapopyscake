import Link from "next/link";

import { SocialQrModal } from "@/components/layout/social-qr-modal";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t-4 border-[var(--color-butter)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,246,251,0.96))] py-10 backdrop-blur-xl">
      <div className="container-shell grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-display text-2xl text-[var(--color-berry)]">
            {siteConfig.name}
          </p>
          <p className="max-w-md text-sm leading-7 text-[var(--color-cocoa)]">
            Cute custom cakes for pet birthdays, cake smash moments, and extra
            sweet celebration photos.
          </p>
        </div>

        <div>
          <p className="mb-3 font-display text-lg text-[var(--color-ink)]">
            Quick links
          </p>
          <div className="space-y-2 text-sm text-[var(--color-cocoa)]">
            {siteConfig.legalLinks.map((item) => (
              <div key={item.href}>
                <Link href={item.href} className="transition hover:text-[var(--color-berry)]">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 font-display text-lg text-[var(--color-ink)]">
            Follow us on
          </p>
          <SocialQrModal />
        </div>
      </div>
    </footer>
  );
}
