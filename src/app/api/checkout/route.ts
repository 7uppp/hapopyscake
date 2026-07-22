import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { env } from "@/lib/env";
import {
  calculateOrderAmount,
  orderPayloadSchema,
  orderSelectionSchema,
  type OrderPayload,
} from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { formatBrisbaneDateTimeLocal, parseBrisbaneDateTime } from "@/lib/utils";

export const runtime = "nodejs";

const pendingPaymentWindowMs = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  if (!env.hasDatabase || !env.hasStripe) {
    return NextResponse.json(
      { error: "Stripe or database configuration is missing." },
      { status: 503 },
    );
  }

  const body = await request.json();

  if (body && typeof body === "object" && typeof body.orderId === "string") {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in to pay this order." },
        { status: 401 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "This order is not waiting for payment." },
        { status: 400 },
      );
    }

    if (Date.now() - order.createdAt.getTime() > pendingPaymentWindowMs) {
      return NextResponse.json(
        { error: "This payment link has expired. Please place the order again." },
        { status: 410 },
      );
    }

    const selection = orderSelectionSchema.safeParse(order.configJson);

    if (!selection.success) {
      return NextResponse.json(
        { error: "This order can no longer be paid. Please place the order again." },
        { status: 400 },
      );
    }

    const config = order.configJson as { pickupDateBrisbane?: string };
    const pickupDate = config.pickupDateBrisbane
      ? config.pickupDateBrisbane
      : order.pickupDate
        ? formatBrisbaneDateTimeLocal(order.pickupDate)
        : "";
    const payload: OrderPayload = {
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      pickupDate,
      notes: order.notes ?? "",
      marketingOptIn: order.marketingOptIn,
      selection: selection.data,
      imageUploads: [],
    };
    const checkoutSession = await createCheckoutSession({
      orderId: order.id,
      payload,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        amountCents: checkoutSession.amount_total ?? order.amountCents,
        stripeSessionId: checkoutSession.id,
      },
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  }

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
  const pickupDate = parseBrisbaneDateTime(parsed.data.pickupDate);

  if (!pickupDate) {
    return NextResponse.json({ error: "Please choose a valid pickup time." }, { status: 400 });
  }

  const firstOrderCookieIncluded = userId
    ? (await prisma.order.count({
        where: {
          userId,
          status: "PAID",
        },
      })) === 0
    : false;

  const order = await prisma.order.create({
    data: {
      userId,
      customerName: parsed.data.customerName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      pickupDate,
      notes: parsed.data.notes,
      marketingOptIn: parsed.data.marketingOptIn,
      productType: parsed.data.selection.productType,
      configJson: {
        ...parsed.data.selection,
        pickupDateBrisbane: parsed.data.pickupDate,
        firstOrderCookieIncluded,
      },
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

  await prisma.$executeRaw`
    UPDATE "Order"
    SET "pickupDate" = ${parsed.data.pickupDate}::timestamp
    WHERE "id" = ${order.id}
  `;

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
