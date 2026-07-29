import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Terms",
  description:
    "Review Happy's Cake custom order terms before placing a pet cake or cookie order.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      body="All custom bakes are made to order. Please review your flavor, size, and pickup details carefully before payment. By placing an order, you confirm that the submitted details and reference photos are accurate to the best of your knowledge."
    />
  );
}
