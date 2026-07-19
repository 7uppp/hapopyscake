import { NextResponse } from "next/server";

import type { OrderSelection } from "@/lib/products";
import { env } from "@/lib/env";
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { createOrderImageSignedUrl } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { formatBrisbaneDateTime, formatBrisbaneDateTimeInput } from "@/lib/utils";

export const runtime = "nodejs";

function isAllowedOrderImageMimeType(
  mimeType: string,
): mimeType is "image/jpeg" | "image/png" | "image/webp" {
  return ["image/jpeg", "image/png", "image/webp"].includes(mimeType);
}

export async function POST(request: Request) {
  if (!env.hasStripe || !env.hasStripeWebhook || !env.hasDatabase) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook." },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { images: true },
    });

    if (!order || order.status === "PAID") {
      return NextResponse.json({ received: true });
    }

    if (
      session.id !== order.stripeSessionId ||
      session.payment_status !== "paid" ||
      session.amount_total !== order.amountCents ||
      session.currency?.toUpperCase() !== order.currency
    ) {
      return NextResponse.json({ received: true });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
      },
      include: { images: true },
    });

    const selection = updatedOrder.configJson as OrderSelection & {
      pickupDateBrisbane?: string;
      firstOrderCookieIncluded?: boolean;
    };
    const pickupDateLabel = selection.pickupDateBrisbane
      ? formatBrisbaneDateTimeInput(selection.pickupDateBrisbane)
      : updatedOrder.pickupDate
        ? formatBrisbaneDateTime(updatedOrder.pickupDate)
        : "";

    const payload = {
      customerName: updatedOrder.customerName,
      email: updatedOrder.email,
      phone: updatedOrder.phone,
      pickupDate: pickupDateLabel,
      notes: updatedOrder.notes ?? "",
      marketingOptIn: updatedOrder.marketingOptIn,
      selection,
      firstOrderCookieIncluded: Boolean(selection.firstOrderCookieIncluded),
      imageUploads: updatedOrder.images.flatMap((image) => {
        if (!isAllowedOrderImageMimeType(image.mimeType)) {
          return [];
        }

        return [
          {
            path: image.path,
            originalName: image.originalName,
            mimeType: image.mimeType,
          },
        ];
      }),
    };

    const imageUrls = await Promise.all(
      updatedOrder.images.map((image) => createOrderImageSignedUrl(image.path)),
    );

    await Promise.allSettled([
      sendOrderConfirmationEmail({ payload }),
      sendOrderNotificationEmail({
        payload,
        orderId: updatedOrder.id,
        imageUrls,
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
