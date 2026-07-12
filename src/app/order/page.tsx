import type { Metadata } from "next";

import { auth } from "@/auth";
import { OrderForm } from "@/components/forms/order-form";

export const metadata: Metadata = {
  title: "Order",
  description: "Build your custom pet cake order and continue to secure checkout.",
};

export default async function OrderPage() {
  const session = await auth();

  return (
    <div className="container-shell py-16">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Order online
        </p>
        <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
          Choose your product, upload pet photos, and pay with Stripe
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)]">
          We support guest checkout, but logging in makes it easier to review past
          orders and stay on the birthday reminder list.
        </p>
      </div>
      <OrderForm session={session} />
    </div>
  );
}
