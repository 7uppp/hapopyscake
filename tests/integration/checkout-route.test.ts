/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const createCheckoutSessionMock = vi.fn();
const prismaMock = {
  order: {
    count: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  marketingConsent: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $executeRaw: vi.fn(),
};

const cupcakeSelection = {
  productType: "head-cupcake",
  flavor: "chickenPumpkin",
  colour: "Blue",
  petName: "Mochi",
  turningAge: "1",
};

const validPayload = {
  customerName: "Test Customer",
  email: "customer@example.com",
  phone: "0472707510",
  pickupDate: "2099-01-08T10:30",
  notes: "No allergies",
  marketingOptIn: true,
  imageUploads: [],
  selection: cupcakeSelection,
};

async function setupRoute() {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://test");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_123");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

  vi.doMock("@/auth", () => ({ auth: authMock }));
  vi.doMock("@/lib/stripe", () => ({
    createCheckoutSession: createCheckoutSessionMock,
  }));
  vi.doMock("@/lib/prisma", () => ({ prisma: prismaMock }));

  return import("@/app/api/checkout/route");
}

async function postJson(body: unknown) {
  const { POST } = await setupRoute();

  return POST(new Request("http://localhost/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
  }));
}

describe("checkout route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createCheckoutSessionMock.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.test/session",
      amount_total: 4900,
    });
    prismaMock.order.count.mockResolvedValue(0);
    prismaMock.order.findUnique.mockResolvedValue(null);
    prismaMock.order.create.mockResolvedValue({
      id: "order_123",
      createdAt: new Date("2099-01-01T00:00:00.000Z"),
    });
    prismaMock.order.update.mockResolvedValue({});
    prismaMock.marketingConsent.findFirst.mockResolvedValue(null);
    prismaMock.marketingConsent.create.mockResolvedValue({});
    prismaMock.marketingConsent.update.mockResolvedValue({});
    prismaMock.$executeRaw.mockResolvedValue(undefined);
  });

  it("creates a pending guest checkout order with server-calculated amount", async () => {
    authMock.mockResolvedValue(null);

    const response = await postJson(validPayload);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ checkoutUrl: "https://checkout.stripe.test/session" });
    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: null,
          amountCents: 4900,
          currency: "AUD",
          status: "PENDING_PAYMENT",
          productType: "head-cupcake",
        }),
      }),
    );
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order_123",
        payload: expect.objectContaining({ email: "customer@example.com" }),
      }),
    );
  });

  it("marks a logged-in user's first paid cake order as free-cookie eligible", async () => {
    authMock.mockResolvedValue({
      user: { id: "user_123", email: "customer@example.com" },
    });
    prismaMock.order.count.mockResolvedValue(0);

    const response = await postJson(validPayload);

    expect(response.status).toBe(200);
    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user_123",
          configJson: expect.objectContaining({
            firstOrderCookieIncluded: true,
          }),
        }),
      }),
    );
  });

  it("requires login when retrying a pending payment", async () => {
    authMock.mockResolvedValue(null);

    const response = await postJson({ orderId: "order_123" });

    expect(response.status).toBe(401);
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("rejects retry payment for another user's pending order", async () => {
    authMock.mockResolvedValue({ user: { id: "user_123", email: "a@example.com" } });
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order_123",
      userId: "other_user",
      status: "PENDING_PAYMENT",
    });

    const response = await postJson({ orderId: "order_123" });

    expect(response.status).toBe(404);
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("rejects expired pending payment retries", async () => {
    authMock.mockResolvedValue({ user: { id: "user_123", email: "a@example.com" } });
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order_123",
      userId: "user_123",
      status: "PENDING_PAYMENT",
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    });

    const response = await postJson({ orderId: "order_123" });

    expect(response.status).toBe(410);
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("recreates checkout for an owned non-expired pending order", async () => {
    authMock.mockResolvedValue({ user: { id: "user_123", email: "a@example.com" } });
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order_123",
      userId: "user_123",
      customerName: "Test Customer",
      email: "customer@example.com",
      phone: "0472707510",
      pickupDate: new Date("2099-01-08T10:30:00.000Z"),
      notes: "",
      marketingOptIn: false,
      status: "PENDING_PAYMENT",
      amountCents: 4900,
      createdAt: new Date(),
      configJson: {
        ...cupcakeSelection,
        pickupDateBrisbane: "2099-01-08T10:30",
      },
    });

    const response = await postJson({ orderId: "order_123" });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.checkoutUrl).toBe("https://checkout.stripe.test/session");
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "order_123" },
      data: { amountCents: 4900, stripeSessionId: "cs_test_123" },
    });
  });
});
