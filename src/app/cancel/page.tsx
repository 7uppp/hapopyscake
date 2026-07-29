import type { Metadata } from "next";

import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Checkout Cancelled",
  description: "Return to your Happy's Cake order after cancelling checkout.",
  path: "/cancel",
  noIndex: true,
});

export default function CancelPage() {
  return (
    <div className="container-shell py-16">
      <div className="glass-card mx-auto max-w-3xl rounded-[36px] border border-white/60 p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Checkout cancelled
        </p>
        <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
          No worries, your order draft is still editable
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)]">
          You can head back to the order page any time and try checkout again.
        </p>
      </div>
    </div>
  );
}
