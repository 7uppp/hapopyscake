import type { Metadata } from "next";

import { MarketingForm } from "@/components/forms/marketing-form";
import { requireAdminSession } from "@/lib/auth-helpers";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createOrderImageSignedUrl } from "@/lib/supabase";
import { formatDateLabel } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Marketing",
};

export default async function AdminMarketingPage() {
  await requireAdminSession();

  let subscriberCount = 0;
  let orderSnapshots: Array<{
    id: string;
    email: string;
    createdAt: Date;
    imageUrls: string[];
  }> = [];

  if (env.hasDatabase) {
    subscriberCount = await prisma.marketingConsent.count({
      where: { subscribed: true },
    });

    const recentOrders = await prisma.order.findMany({
      where: {
        status: "PAID",
        images: { some: {} },
      },
      include: {
        images: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    orderSnapshots = await Promise.all(
      recentOrders.map(async (order) => ({
        id: order.id,
        email: order.email,
        createdAt: order.createdAt,
        imageUrls: await Promise.all(
          order.images.map((image) => createOrderImageSignedUrl(image.path)),
        ),
      })),
    );
  }

  return (
    <div className="container-shell py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
            Admin
          </p>
          <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
            Marketing and recent order references
          </h1>
        </div>
        <div className="glass-card rounded-[28px] border border-white/60 px-5 py-4">
          <p className="text-sm text-[var(--color-cocoa)]">Subscribed contacts</p>
          <p className="font-display text-4xl text-[var(--color-berry)]">
            {subscriberCount}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <MarketingForm />

        <div className="glass-card rounded-[32px] border border-white/60 p-8">
          <h2 className="section-title text-3xl text-[var(--color-ink)]">
            Recent paid order photos
          </h2>
          <div className="mt-6 space-y-5">
            {orderSnapshots.length > 0 ? (
              orderSnapshots.map((order) => (
                <article key={order.id} className="rounded-[24px] bg-white/75 p-4">
                  <p className="font-bold text-[var(--color-ink)]">{order.email}</p>
                  <p className="text-sm text-[var(--color-cocoa)]">
                    {formatDateLabel(order.createdAt)}
                  </p>
                  <div className="mt-3 space-y-2">
                    {order.imageUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl border border-[var(--color-blush)] px-4 py-2 text-sm font-semibold text-[var(--color-berry)]"
                      >
                        View signed image link
                      </a>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-[24px] bg-white/75 p-4 text-sm text-[var(--color-cocoa)]">
                Paid orders with reference images will appear here once storage and
                Stripe are connected.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
