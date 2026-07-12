import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { env } from "@/lib/env";
import { calculateOrderAmount, orderPayloadSchema } from "@/lib/products";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!env.hasDatabase || !env.hasStripe) {
    return NextResponse.json(
      { error: "Stripe or database configuration is missing." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = orderPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please review the order form." }, { status: 400 });
  }

  const session = await auth();
  const userId =
    session?.user?.email?.toLowerCase() === parsed.data.email.toLowerCase()
      ? session.user.id
      : null;
  const amountCents = calculateOrderAmount(parsed.data.selection) * 100;

  const order = await prisma.order.create({
    data: {
      userId,
      customerName: parsed.data.customerName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      pickupDate: new Date(parsed.data.pickupDate),
      notes: parsed.data.notes,
      marketingOptIn: parsed.data.marketingOptIn,
      productType: parsed.data.selection.productType,
      configJson: parsed.data.selection,
      amountCents,
      currency: "AUD",
      status: "PENDING_PAYMENT",
      images: parsed.data.imageUploads.length
        ? {
            create: parsed.data.imageUploads.map((image) => ({
              bucket: env.orderBucket,
              path: image.path,
              mimeType: image.mimeType,
              originalName: image.originalName,
            })),
          }
        : undefined,
    },
  });

  const checkoutSession = await createCheckoutSession({
    orderId: order.id,
    payload: parsed.data,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      amountCents: checkoutSession.amount_total ?? amountCents,
      stripeSessionId: checkoutSession.id,
    },
  });

  const existingConsent = await prisma.marketingConsent.findFirst({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });

  if (existingConsent) {
    await prisma.marketingConsent.update({
      where: { id: existingConsent.id },
      data: {
        userId,
        subscribed: parsed.data.marketingOptIn,
        source: "order",
        consentedAt: parsed.data.marketingOptIn ? new Date() : null,
        unsubscribedAt: parsed.data.marketingOptIn ? null : new Date(),
      },
    });
  } else {
    await prisma.marketingConsent.create({
      data: {
        userId,
        email: parsed.data.email.toLowerCase(),
        subscribed: parsed.data.marketingOptIn,
        source: "order",
        consentedAt: parsed.data.marketingOptIn ? new Date() : null,
        unsubscribedAt: parsed.data.marketingOptIn ? null : new Date(),
      },
    });
  }

  return NextResponse.json({ checkoutUrl: checkoutSession.url });
}
