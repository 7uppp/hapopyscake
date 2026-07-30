"use client";

import {
  type FormEvent,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import type { Session } from "next-auth";
import Link from "next/link";

import { cartStorageKey, type CartItem } from "@/lib/cart";
import {
  buildOrderSummary,
  calculateOrderAmount,
  orderSelectionSchema,
  productCatalog,
} from "@/lib/products";
import { formatCurrency, formatBrisbaneDateTimeInput } from "@/lib/utils";

type CartCheckoutFormProps = {
  session: Session | null;
  firstOrderCookieEligible: boolean;
};

function parseCartItem(value: string | null): CartItem | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as CartItem;
    const selection = orderSelectionSchema.safeParse(parsed.selection);

    if (!selection.success || parsed.version !== 1 || !parsed.pickupDate) {
      return null;
    }

    return {
      version: 1,
      selection: selection.data,
      pickupDate: parsed.pickupDate,
      notes: parsed.notes ?? "",
      imageUploads: Array.isArray(parsed.imageUploads)
        ? parsed.imageUploads.filter(isCartImageUpload)
        : [],
      addedAt: parsed.addedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function isCartImageUpload(value: unknown): value is CartItem["imageUploads"][number] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const image = value as CartItem["imageUploads"][number];
  return (
    typeof image.path === "string" &&
    typeof image.originalName === "string" &&
    ["image/jpeg", "image/png", "image/webp"].includes(image.mimeType)
  );
}

function subscribeToCartStorage() {
  return () => {};
}

function getCartSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(cartStorageKey);
}

export function CartCheckoutForm({
  session,
  firstOrderCookieEligible,
}: CartCheckoutFormProps) {
  const cartSnapshot = useSyncExternalStore(
    subscribeToCartStorage,
    getCartSnapshot,
    () => null,
  );
  const cartItem = useMemo(() => parseCartItem(cartSnapshot), [cartSnapshot]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [customerName, setCustomerName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const summaryRows = useMemo(
    () => (cartItem ? buildOrderSummary(cartItem.selection) : []),
    [cartItem],
  );
  const product = cartItem
    ? productCatalog.find((item) => item.type === cartItem.selection.productType)
    : null;
  const amount = cartItem
    ? formatCurrency(calculateOrderAmount(cartItem.selection))
    : formatCurrency(0);

  async function checkout() {
    setError("");

    if (!cartItem) {
      setError("Your cart is empty. Please add a product first.");
      return;
    }

    if (
      cartItem.selection.productType !== "themed-cookie" &&
      cartItem.imageUploads.length === 0
    ) {
      setError("Please edit this order and upload at least 1 reference photo.");
      return;
    }

    const payload = {
      customerName,
      email,
      phone,
      pickupDate: cartItem.pickupDate,
      notes: cartItem.notes,
      marketingOptIn,
      selection: cartItem.selection,
      imageUploads: cartItem.imageUploads,
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "We couldn't start checkout.");
      return;
    }

    window.location.href = result.checkoutUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      await checkout();
    } finally {
      setIsPending(false);
    }
  }

  if (!cartItem) {
    return (
      <div className="glass-card mx-auto max-w-3xl rounded-[36px] border border-white/60 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Cart
        </p>
        <h1 className="section-title mt-3 text-4xl text-[var(--color-ink)]">
          Your cart is empty
        </h1>
        <p className="mt-4 text-[var(--color-cocoa)]">
          Choose a cake product first, then come back here to checkout.
        </p>
        <Link
          href="/order/head-cake"
          className="mt-6 inline-flex rounded-full bg-[var(--color-berry)] px-6 py-3 font-bold text-white"
        >
          Shop cakes
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div className="glass-card rounded-[36px] border border-white/60 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Cart
        </p>
        <h1 className="section-title mt-3 text-4xl text-[var(--color-ink)]">
          {product?.title ?? "Happy's Cake order"}
        </h1>
        <p className="price-text mt-3 text-4xl text-[var(--color-berry)]">
          {amount}
        </p>

        <div className="mt-6 rounded-[28px] bg-white/70 p-5 text-sm text-[var(--color-cocoa)]">
          <dl className="space-y-3">
            {summaryRows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="font-bold text-[var(--color-ink)]">{row.label}</dt>
                <dd className="text-right">{row.value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-[var(--color-ink)]">Pickup</dt>
              <dd className="text-right">
                {formatBrisbaneDateTimeInput(cartItem.pickupDate)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-[var(--color-ink)]">Reference photo</dt>
              <dd className="text-right">
                {cartItem.imageUploads.length > 0
                  ? `${cartItem.imageUploads.length} uploaded`
                  : "None"}
              </dd>
            </div>
          </dl>
        </div>

        <Link
          href={`/order/${product?.slug ?? "head-cake"}`}
          className="fredoka-text mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-berry)] px-6 py-3 text-center text-sm font-black uppercase tracking-[0.04em] text-white shadow-lg shadow-pink-300/45 transition hover:-translate-y-0.5 md:w-auto"
          style={{ color: "white" }}
        >
          Edit product details
        </Link>
      </div>

      <div className="glass-card rounded-[36px] border border-white/60 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Checkout
        </p>
        <h2 className="section-title mt-3 text-3xl text-[var(--color-ink)]">
          Your contact details
        </h2>

        {!session?.user || firstOrderCookieEligible ? (
          <div className="mt-5 rounded-[24px] border border-[var(--color-blush)] bg-white/80 px-5 py-4 text-sm leading-6 text-[var(--color-cocoa)]">
            {session?.user ? (
              <p>
                <strong className="text-[var(--color-berry)]">
                  First-order bonus:
                </strong>{" "}
                1 free cookie is included with this cake order.
              </p>
            ) : (
              <p>
                Log in or create an account before checkout to claim 1 free cookie
                with your first paid cake order.
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
              Your name
            </label>
            <input
              name="customerName"
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
              className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
              Phone
            </label>
            <input
              name="phone"
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
            />
          </div>
        </div>

        <label className="mt-6 flex gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[var(--color-cocoa)]">
          <input
            type="checkbox"
            name="marketingOptIn"
            checked={marketingOptIn}
            onChange={(event) => setMarketingOptIn(event.target.checked)}
            className="mt-1"
          />
          <span>Send me birthday reminders and seasonal offers by email.</span>
        </label>

        {error ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-[var(--color-berry)] px-6 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? "Preparing Stripe..." : "Checkout"}
        </button>
      </div>
    </form>
  );
}
