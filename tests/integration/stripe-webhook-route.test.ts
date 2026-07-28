/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const constructEventMock = vi.fn();
const sendOrderConfirmationEmailMock = vi.fn();
const sendOrderNotificationEmailMock = vi.fn();
const createOrderImageSignedUrlMock = vi.fn();
const prismaMock = {
  order: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

const paidSessionEvent = {
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_live_123",
      metadata: { orderId: "order_123" },
      payment_status: "paid",
      amount_total: 4900,
      currency: "aud",
      payment_intent: "pi_123",
    },
  },
};

const pendingOrder = {
  id: "order_123",
  stripeSessionId: "cs_live_123",
  status: "PENDING_PAYMENT",
  amountCents: 4900,
  currency: "AUD",
  customerName: "Test Customer",
  email: "customer@example.com",
  phone: "0472707510",
  pickupDate: new Date("2099-01-08T00:30:00.000Z"),
  notes: "No allergies",
  marketingOptIn: true,
  configJson: {
    productType: "head-cupcake",
    flavor: "chickenPumpkin",
    colour: "Blue",
    petName: "Mochi",
    turningAge: "1",
    pickupDateBrisbane: "2099-01-08T10:30",
    firstOrderCookieIncluded: true,
  },
  images: [
    {
      path: "11111111-1111-4111-8111-111111111111/pet.png",
      mimeType: "image/png",
      originalName: "pet.png",
    },
  ],
};

async function setupRoute() {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://test");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_123");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_123");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_live_123");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://happyscake.com");
  vi.stubEnv("SUPABASE_URL", "https://supabase.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.test");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");

  vi.doMock("@/lib/stripe", () => ({
    getStripe: () => ({
      webhooks: {
        constructEvent: constructEventMock,
      },
    }),
  }));
  vi.doMock("@/lib/prisma", () => ({ prisma: prismaMock }));
  vi.doMock("@/lib/email", () => ({
    sendOrderConfirmationEmail: sendOrderConfirmationEmailMock,
    sendOrderNotificationEmail: sendOrderNotificationEmailMock,
  }));
  vi.doMock("@/lib/supabase", () => ({
    createOrderImageSignedUrl: createOrderImageSignedUrlMock,
  }));

  return import("@/app/api/stripe/webhook/route");
}

async function postWebhook(headers: HeadersInit = { "stripe-signature": "sig_123" }) {
  const { POST } = await setupRoute();

  return POST(
    new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers,
      body: JSON.stringify({ id: "evt_123" }),
    }),
  );
}

describe("stripe webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    constructEventMock.mockReturnValue(paidSessionEvent);
    prismaMock.order.findUnique.mockResolvedValue(pendingOrder);
    prismaMock.order.update.mockResolvedValue(pendingOrder);
    createOrderImageSignedUrlMock.mockResolvedValue("https://signed.example/pet.png");
    sendOrderConfirmationEmailMock.mockResolvedValue({});
    sendOrderNotificationEmailMock.mockResolvedValue({});
  });

  it("requires Stripe webhook signatures", async () => {
    const response = await postWebhook({});

    expect(response.status).toBe(400);
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it("rejects invalid Stripe webhook signatures", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    const response = await postWebhook();
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("No signatures");
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it("does not mark orders paid when Stripe data does not match", async () => {
    constructEventMock.mockReturnValue({
      ...paidSessionEvent,
      data: {
        object: {
          ...paidSessionEvent.data.object,
          amount_total: 9999,
        },
      },
    });

    const response = await postWebhook();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(prismaMock.order.update).not.toHaveBeenCalled();
    expect(sendOrderNotificationEmailMock).not.toHaveBeenCalled();
  });

  it("marks verified checkout sessions as paid and sends emails", async () => {
    const response = await postWebhook();

    expect(response.status).toBe(200);
    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order_123" },
        data: {
          status: "PAID",
          stripePaymentIntentId: "pi_123",
        },
      }),
    );
    expect(createOrderImageSignedUrlMock).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111/pet.png",
    );
    expect(sendOrderConfirmationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          firstOrderCookieIncluded: true,
          phone: "0472707510",
          pickupDate: "8 Jan 2099, 10:30 am Brisbane time",
        }),
      }),
    );
    expect(sendOrderNotificationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order_123",
        imageUrls: ["https://signed.example/pet.png"],
      }),
    );
  });

  it("is idempotent for already paid orders", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      ...pendingOrder,
      status: "PAID",
    });

    const response = await postWebhook();

    expect(response.status).toBe(200);
    expect(prismaMock.order.update).not.toHaveBeenCalled();
    expect(sendOrderConfirmationEmailMock).not.toHaveBeenCalled();
  });
});
