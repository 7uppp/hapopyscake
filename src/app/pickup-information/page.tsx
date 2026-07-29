import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Pickup Information",
  description:
    "Find Happy's Cake pickup information for custom pet cake orders in Hillcrest, Brisbane.",
  path: "/pickup-information",
});

export default function PickupInformationPage() {
  return (
    <LegalPage
      title="Pickup Information"
      body="The MVP launch is pickup-only in Brisbane. Please arrive within your selected window, keep cakes level during transport, and refrigerate them promptly if they are not being served immediately."
    />
  );
}
