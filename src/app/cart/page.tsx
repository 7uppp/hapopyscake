import type { Metadata } from "next";

import { auth } from "@/auth";
import { CartCheckoutForm } from "@/components/forms/cart-checkout-form";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Happy's Cake cart and continue to secure checkout.",
};

export default async function CartPage() {
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

  return (
    <div className="container-shell py-16">
      <CartCheckoutForm
        session={session}
        firstOrderCookieEligible={paidOrderCount === 0}
      />
    </div>
  );
}
