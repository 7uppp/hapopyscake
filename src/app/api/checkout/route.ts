import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { env } from "@/lib/env";
import { normalizeEmail } from "@/lib/identity";
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
  const email = normalizeEmail(parsed.data.email);
  const payload = { ...parsed.data, email };
  const userId =
    session?.user?.email && normalizeEmail(session.user.email) === email
      ? session.user.id
      : null;
  const amountCents = calculateOrderAmount(payload.selection) * 100;
  const pickupDate = parseBrisbaneDateTime(payload.pickupDate);

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
      customerName: payload.customerName,
      email,
      phone: payload.phone,
      pickupDate,
      notes: payload.notes,
      marketingOptIn: payload.marketingOptIn,
      productType: payload.selection.productType,
      configJson: {
        ...payload.selection,
        pickupDateBrisbane: payload.pickupDate,
        firstOrderCookieIncluded,
      },
      amountCents,
      currency: "AUD",
      status: "PENDING_PAYMENT",
      images: payload.imageUploads.length
        ? {
            create: payload.imageUploads.map((image) => ({
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
    SET "pickupDate" = ${payload.pickupDate}::timestamp
    WHERE "id" = ${order.id}
  `;

  const checkoutSession = await createCheckoutSession({
    orderId: order.id,
    payload,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      amountCents: checkoutSession.amount_total ?? amountCents,
      stripeSessionId: checkoutSession.id,
    },
  });

  const existingConsent = await prisma.marketingConsent.findFirst({
    where: { email },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });

  if (existingConsent) {
    await prisma.marketingConsent.update({
      where: { id: existingConsent.id },
      data: {
        userId,
        subscribed: payload.marketingOptIn,
        source: "order",
        consentedAt: payload.marketingOptIn ? new Date() : null,
        unsubscribedAt: payload.marketingOptIn ? null : new Date(),
      },
    });
  } else {
    await prisma.marketingConsent.create({
      data: {
        userId,
        email,
        subscribed: payload.marketingOptIn,
        source: "order",
        consentedAt: payload.marketingOptIn ? new Date() : null,
        unsubscribedAt: payload.marketingOptIn ? null : new Date(),
      },
    });
  }

  return NextResponse.json({ checkoutUrl: checkoutSession.url });
}
