import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Pickup & Delivery",
  description:
    "Find Happy's Cake pickup and local delivery information for custom pet cake orders in Hillcrest, Brisbane.",
  path: "/pickup-information",
});

export default function PickupInformationPage() {
  return (
    <LegalPage
      title="Pickup & Delivery"
      body={
        <div className="space-y-7">
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-ink)]">
              Pickup Location
            </h2>
            <p className="mt-2">
              Hillcrest, QLD. Full address will be provided after your order is
              confirmed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-ink)]">
              Pickup by Appointment Only
            </h2>
            <p className="mt-2">
              Please contact us at least 1 day in advance by email or text message
              to arrange your preferred pickup time. This helps us ensure your
              order is freshly prepared, carefully packaged, and ready for
              collection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-ink)]">
              Local Delivery
            </h2>
            <p className="mt-2">
              Delivery is available within the Brisbane area only. If you would
              like your order delivered, please contact us by email or text
              message. Delivery fees are calculated based on the distance from
              our pickup location.
            </p>
          </section>
        </div>
      }
    />
  );
}
