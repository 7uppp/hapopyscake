import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { buildSeoMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildSeoMetadata({
  title: "Contact",
  description:
    "Contact Happy's Cake for custom pet birthday cake questions, Brisbane pickup details, and photo inspiration.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-shell py-16">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
              Contact us
            </p>
            <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
              Need a little help planning the cutest pet party?
            </h1>
          </div>
          <div className="glass-card rounded-[32px] border border-white/60 p-6 text-[var(--color-cocoa)]">
            <p className="font-display text-xl text-[var(--color-ink)]">Direct details</p>
            <div className="mt-4 space-y-3 text-sm leading-7">
              <p>Email: {siteConfig.contactEmail}</p>
              <p>Phone: {siteConfig.phone}</p>
              <p>Pickup area: {siteConfig.pickupSuburb}</p>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
