import type { Metadata } from "next";

import { buildSeoMetadata, serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildSeoMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers about Happy's Cake pet cake ingredients, storage, pickup, delivery, serving sizes, and custom 3D cake orders.",
  path: "/faq",
});

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: siteConfig.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="container-shell py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          FAQ
        </p>
        <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
          Frequently Asked Questions
        </h1>
      </div>
      <div className="mt-10 space-y-4">
        {siteConfig.faq.map((item) => (
          <article
            key={item.question}
            className="glass-card rounded-[28px] border border-white/60 p-6"
          >
            <h2 className="font-display text-2xl text-[var(--color-ink)]">
              {item.question}
            </h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-[var(--color-cocoa)]">
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
