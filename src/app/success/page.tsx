import type { Metadata } from "next";
import Link from "next/link";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { buildSeoMetadata } from "@/lib/seo";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = buildSeoMetadata({
  title: "Payment Status",
  description: "Review your Happy's Cake payment confirmation status.",
  path: "/success",
  noIndex: true,
});

type SuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  let paymentStatus: string | null = null;
  let orderStatus: string | null = null;
  let orderId: string | null = null;

  if (sessionId && env.hasDatabase) {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      select: { id: true, status: true },
    });

    orderId = order?.id ?? null;
    orderStatus = order?.status ?? null;
  }

  if (sessionId && env.hasStripe) {
    try {
      const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
      paymentStatus = checkoutSession.payment_status;
      orderId = orderId ?? checkoutSession.metadata?.orderId ?? null;
    } catch {
      paymentStatus = null;
    }
  }

  const isPaid = paymentStatus === "paid";
  const isOrderConfirmed = orderStatus === "PAID";

  return (
    <div className="container-shell py-16">
      <div className="glass-card mx-auto max-w-3xl rounded-[36px] border border-white/60 p-10 text-center">
        {isPaid && isOrderConfirmed ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
              Payment successful
            </p>
            <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
              Your order is officially in the oven
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)]">
              We have received your payment and sent your order details to the
              shop inbox.
            </p>
          </>
        ) : isPaid ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
              Payment received
            </p>
            <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
              We are confirming your order
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)]">
              Stripe shows your payment was received, but our order confirmation
              is still processing. If this message stays here, please contact us
              with your order reference.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
              Payment not confirmed
            </p>
            <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
              We could not confirm your payment yet
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)]">
              This page only confirms an order after Stripe reports a successful
              payment. Please try checkout again or contact us if you were charged.
            </p>
          </>
        )}

        {orderId ? (
          <p className="mt-5 rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-[var(--color-cocoa)]">
            Order reference: {orderId}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[var(--color-berry)] px-6 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5"
          >
            Back to home
          </Link>
          <Link
            href="/order/head-cake"
            className="rounded-full border border-[var(--color-blush)] bg-white/80 px-6 py-3 font-bold text-[var(--color-berry)] transition hover:bg-white"
          >
            Order another one
          </Link>
        </div>
      </div>
    </div>
  );
}
