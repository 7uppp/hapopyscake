import type { Metadata } from "next";

import { SignOutButton } from "@/components/ui/sign-out-button";
import { requireSession } from "@/lib/auth-helpers";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateLabel } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const session = await requireSession();

  let orders: Array<{
    id: string;
    createdAt: Date;
    status: string;
    amountCents: number;
    productType: string;
  }> = [];
  let marketingOptIn = false;

  if (env.hasDatabase) {
    orders = await prisma.order.findMany({
      where: {
        OR: [{ userId: session.user.id }, { email: session.user.email ?? "" }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        status: true,
        amountCents: true,
        productType: true,
      },
    });

    const consent = await prisma.marketingConsent.findFirst({
      where: { email: session.user.email ?? "" },
      orderBy: { updatedAt: "desc" },
    });

    marketingOptIn = consent?.subscribed ?? false;
  }

  return (
    <div className="container-shell py-16">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="glass-card rounded-[32px] border border-white/60 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
            Profile
          </p>
          <h1 className="section-title mt-3 text-4xl text-[var(--color-ink)]">
            Hi, {session.user.name ?? "there"}
          </h1>
          <dl className="mt-6 space-y-3 text-sm text-[var(--color-cocoa)]">
            <div>
              <dt className="font-bold text-[var(--color-ink)]">Email</dt>
              <dd>{session.user.email}</dd>
            </div>
            <div>
              <dt className="font-bold text-[var(--color-ink)]">Marketing status</dt>
              <dd>{marketingOptIn ? "Subscribed" : "Not subscribed"}</dd>
            </div>
            <div>
              <dt className="font-bold text-[var(--color-ink)]">Account role</dt>
              <dd>{session.user.role}</dd>
            </div>
          </dl>
          <div className="mt-8">
            <SignOutButton />
          </div>
        </div>

        <div className="glass-card rounded-[32px] border border-white/60 p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
                Order history
              </p>
              <h2 className="section-title mt-2 text-3xl text-[var(--color-ink)]">
                Your previous orders
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[24px] bg-white/75 px-5 py-4 text-sm text-[var(--color-cocoa)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-[var(--color-ink)]">{order.productType}</p>
                      <p>{formatDateLabel(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--color-berry)]">
                        {formatCurrency(order.amountCents / 100)}
                      </p>
                      <p>{order.status}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-[24px] bg-white/75 px-5 py-4 text-sm text-[var(--color-cocoa)]">
                No orders yet. Your paid orders will appear here after checkout.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
