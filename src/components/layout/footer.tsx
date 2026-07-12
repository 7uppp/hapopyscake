import Link from "next/link";
import { Camera, Heart, Music4 } from "lucide-react";

import { siteConfig } from "@/lib/site";

const iconMap = {
  Instagram: Camera,
  Facebook: Heart,
  TikTok: Music4,
} as const;

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
            Follow along
          </p>
          <div className="flex gap-3">
            {siteConfig.socials.map((social) => {
              const Icon = iconMap[social.platform as keyof typeof iconMap] ?? Camera;

              return (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.platform}
                  className="flex size-11 items-center justify-center rounded-2xl bg-[var(--color-blush)] text-[var(--color-berry)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--color-butter)]"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
