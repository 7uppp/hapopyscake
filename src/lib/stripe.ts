import Stripe from "stripe";

import { env, assertServerEnv } from "@/lib/env";
import type { OrderPayload } from "@/lib/products";
import { buildOrderSummary, calculateOrderAmount } from "@/lib/products";

let stripeClient: Stripe | null = null;

export function getStripe() {
  assertServerEnv(env.hasStripe, "Stripe is not configured.");

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  return stripeClient;
}

export async function createCheckoutSession(options: {
  orderId: string;
  payload: OrderPayload;
}) {
  const stripe = getStripe();
  const amount = calculateOrderAmount(options.payload.selection);
  const summary = buildOrderSummary(options.payload.selection);
  const headline = summary[0]?.value ?? "Pet cake order";

  return stripe.checkout.sessions.create({
    mode: "payment",
    currency: "aud",
    success_url: `${env.siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.siteUrl}/cancel`,
    customer_email: options.payload.email,
    metadata: {
      orderId: options.orderId,
      productType: options.payload.selection.productType,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "aud",
          unit_amount: amount * 100,
          product_data: {
            name: headline,
            description: summary
              .slice(1)
              .map((item) => `${item.label}: ${item.value}`)
              .join(" · "),
          },
        },
      },
    ],
  });
}
