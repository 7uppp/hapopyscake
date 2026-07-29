import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Refund Policy",
  description:
    "Review Happy's Cake refund policy for custom-made pet cakes and cookies.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      body="All orders are custom-made and prepared specifically for each customer. We do not accept refunds once an order has been placed."
    />
  );
}
