import type { Metadata } from "next";

import { auth } from "@/auth";
import { OrderForm } from "@/components/forms/order-form";
import { getProductGalleryPreview } from "@/lib/data";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { productCatalog } from "@/lib/products";

export const metadata: Metadata = {
  title: "Order",
  description: "Build your custom pet cake order and continue to secure checkout.",
};

export default async function OrderPage() {
  const session = await auth();
  const paidOrderCount =
    session?.user?.id && env.hasDatabase
      ? await prisma.order.count({
          where: {
            userId: session.user.id,
            status: "PAID",
          },
        })
      : null;
  const firstOrderCookieEligible = paidOrderCount === 0;
  const productPreviewEntries = await Promise.all(
    productCatalog.map(async (product) => [
      product.type,
      await getProductGalleryPreview(product.type, 6),
    ]),
  );
  const productPreviewImagesByType = Object.fromEntries(productPreviewEntries);

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
      <OrderForm
        session={session}
        firstOrderCookieEligible={firstOrderCookieEligible}
        productPreviewImagesByType={productPreviewImagesByType}
      />
    </div>
  );
}
