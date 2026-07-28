import { describe, expect, it, vi } from "vitest";

import {
  buildOrderSummary,
  calculateOrderAmount,
  cookieMainColourOptions,
  orderPayloadSchema,
  orderSelectionSchema,
  type OrderPayload,
  type OrderSelection,
} from "@/lib/products";

const futurePickup = "2099-01-08T10:30";

function basePayload(selection: OrderSelection): OrderPayload {
  return {
    customerName: "Test Customer",
    email: "customer@example.com",
    phone: "0472707510",
    pickupDate: futurePickup,
    notes: "",
    marketingOptIn: false,
    imageUploads: [],
    selection,
  };
}

describe("product pricing", () => {
  it("calculates each main product price from server-side rules", () => {
    expect(
      calculateOrderAmount({
        productType: "head-cupcake",
        flavor: "duckCarrot",
        colour: "Blue",
        petName: "Mochi",
        turningAge: "3",
      }),
    ).toBe(57);

    expect(
      calculateOrderAmount({
        productType: "head-cake",
        headCount: "double",
        layout: "stacked",
        baseSize: "6",
        flavor: "chickenPumpkin",
        colour: "Blue&Yellow",
        petName: "Mochi",
        turningAge: "3",
      }),
    ).toBe(158);

    expect(
      calculateOrderAmount({
        productType: "full-body-cake",
        size: "medium",
        flavor: "beefCarrot",
        addOns: ["miniCake", "toy", "background"],
      }),
    ).toBe(109);

    expect(
      calculateOrderAmount({
        productType: "themed-cookie",
        cookieType: "birthday-set",
        flavor: "chicken-cheese",
        quantity: 5,
        gender: "Boy",
        mainColor: "Blue",
        petName: "Mochi",
        turningAge: "3",
      }),
    ).toBe(49);
  });

  it("calculates name cookies by quantity with minimum quantity validation", () => {
    const selection = {
      productType: "themed-cookie",
      cookieType: "name-cookie",
      flavor: "oat-peanut-butter",
      quantity: 8,
      gender: "Girl",
      mainColor: "Custom pastel blue",
      petName: "Luna",
      turningAge: "2",
    } satisfies OrderSelection;

    expect(calculateOrderAmount(selection)).toBe(40);
    expect(orderSelectionSchema.safeParse({ ...selection, quantity: 4 }).success).toBe(
      false,
    );
  });

  it("accepts custom cookie colors and rejects empty custom colors", () => {
    expect(cookieMainColourOptions).toContain("Custom");
    expect(cookieMainColourOptions).not.toContain("Other");

    const validSelection = {
      productType: "themed-cookie",
      cookieType: "birthday-set",
      flavor: "chicken-cheese",
      gender: "Boy",
      mainColor: "Teal and cream",
      petName: "Ollie",
      turningAge: "1",
    } as const;

    const valid = orderSelectionSchema.safeParse(validSelection);
    const invalid = orderSelectionSchema.safeParse({
      ...validSelection,
      mainColor: "",
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("keeps first-order free cookie out of payable amount", () => {
    const selection = {
      productType: "head-cupcake",
      flavor: "chickenPumpkin",
      colour: "Blue",
      petName: "Mochi",
      turningAge: "1",
    } satisfies OrderSelection;

    expect(
      orderPayloadSchema.safeParse({
        ...basePayload(selection),
        selection: {
          ...selection,
          firstOrderCookieIncluded: true,
        },
      }).success,
    ).toBe(true);
    expect(calculateOrderAmount(selection)).toBe(49);
  });

  it("summarizes order details for emails and Stripe product descriptions", () => {
    const summary = buildOrderSummary({
      productType: "themed-cookie",
      cookieType: "name-cookie",
      flavor: "chicken-cheese",
      quantity: 5,
      gender: "Boy",
      mainColor: "Purple",
      petName: "Charlie",
      turningAge: "4",
    });

    expect(summary).toContainEqual({ label: "Product", value: "Name Cookies" });
    expect(summary).toContainEqual({ label: "Quantity", value: "5" });
    expect(summary).toContainEqual({ label: "Main color", value: "Purple" });
  });
});

describe("order payload schema", () => {
  it("requires 1-5 uploaded reference images when image metadata is present", () => {
    const selection = {
      productType: "head-cupcake",
      flavor: "chickenPumpkin",
      colour: "Blue",
      petName: "Mochi",
      turningAge: "1",
    } satisfies OrderSelection;

    const image = {
      path: "123e4567-e89b-42d3-a456-426614174000/reference.jpg",
      originalName: "reference.jpg",
      mimeType: "image/jpeg",
    };

    expect(
      orderPayloadSchema.safeParse({
        ...basePayload(selection),
        imageUploads: Array.from({ length: 5 }, () => image),
      }).success,
    ).toBe(true);

    expect(
      orderPayloadSchema.safeParse({
        ...basePayload(selection),
        imageUploads: Array.from({ length: 6 }, () => image),
      }).success,
    ).toBe(false);
  });

  it("rejects pickup dates before the Brisbane 7-day minimum", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T00:00:00.000Z"));

    const selection = {
      productType: "head-cupcake",
      flavor: "chickenPumpkin",
      colour: "Blue",
      petName: "Mochi",
      turningAge: "1",
    } satisfies OrderSelection;

    expect(
      orderPayloadSchema.safeParse({
        ...basePayload(selection),
        pickupDate: "2026-08-02T09:00",
      }).success,
    ).toBe(false);

    expect(
      orderPayloadSchema.safeParse({
        ...basePayload(selection),
        pickupDate: "2026-08-04T09:00",
      }).success,
    ).toBe(true);

    vi.useRealTimers();
  });
});
