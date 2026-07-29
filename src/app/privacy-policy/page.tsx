import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Privacy Policy",
  description:
    "Read how Happy's Cake handles order details, payment processing, marketing consent, and private reference photos.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      body="We collect the information needed to process orders, contact you about pickups, and manage marketing preferences you explicitly opt into. Payment details are handled by Stripe, and private order reference images are stored in restricted cloud storage."
    />
  );
}
