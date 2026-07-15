"use client";

import { useMemo, useState, useTransition } from "react";

import type { Session } from "next-auth";

import {
  addOnCatalog,
  colourOptions,
  flavorCatalog,
  getOrderHeadline,
  productCatalog,
  type ProductType,
  calculateOrderAmount,
} from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

type OrderFormProps = {
  session: Session | null;
};

const defaultSelectionByProduct: Record<ProductType, Record<string, unknown>> = {
  "head-cupcake": {
    productType: "head-cupcake",
    flavor: "chickenPumpkin",
    colour: "Blush Pink",
    petName: "",
    turningAge: "",
  },
  "head-cake": {
    productType: "head-cake",
    headCount: "single",
    layout: "stacked",
    baseSize: "4",
    flavor: "chickenPumpkin",
    colour: "Blush Pink",
    petName: "",
    turningAge: "",
  },
  "full-body-cake": {
    productType: "full-body-cake",
    size: "small",
    flavor: "chickenPumpkin",
    addOns: [] as string[],
  },
  "themed-cookie": {
    productType: "themed-cookie",
    flavor: "chicken-cheese",
    theme: "Birthday Party",
    colourPalette: "Blush Pink",
    petName: "",
    turningAge: "",
  },
};

function formatDateTimeLocal(value: Date) {
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;

  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getMinimumPickupDateTime() {
  const minimumDate = new Date();
  minimumDate.setDate(minimumDate.getDate() + 7);
  minimumDate.setSeconds(0, 0);

  return formatDateTimeLocal(minimumDate);
}

export function OrderForm({ session }: OrderFormProps) {
  const [productType, setProductType] = useState<ProductType>("head-cake");
  const [selection, setSelection] = useState<Record<string, unknown>>(
    defaultSelectionByProduct["head-cake"],
  );
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const pricePreview = useMemo(() => {
    try {
      return formatCurrency(calculateOrderAmount(selection as never));
    } catch {
      return "—";
    }
  }, [selection]);
  const minimumPickupDateTime = useMemo(() => getMinimumPickupDateTime(), []);

  function updateSelection(nextProductType: ProductType) {
    setProductType(nextProductType);
    setSelection(defaultSelectionByProduct[nextProductType]);
    setFiles([]);
  }

  function onFieldChange(key: string, value: unknown) {
    setSelection((current) => ({ ...current, [key]: value }));
  }

  function toggleAddOn(addOnKey: string) {
    const current = ((selection.addOns as string[] | undefined) ?? []).slice();

    if (current.includes(addOnKey)) {
      onFieldChange(
        "addOns",
        current.filter((item) => item !== addOnKey),
      );
      return;
    }

    onFieldChange("addOns", [...current, addOnKey]);
  }

  async function submit(formData: FormData) {
    setError("");
    const draftId = crypto.randomUUID();
    const imageUploads: Array<{
      path: string;
      originalName: string;
      mimeType: string;
    }> = [];

    for (const file of files) {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("draftId", draftId);

      const uploadResponse = await fetch("/api/uploads/order-reference", {
        method: "POST",
        body: uploadData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        setError(uploadResult.error ?? "Image upload failed.");
        return;
      }

      imageUploads.push(uploadResult.file);
    }

    const payload = {
      customerName: String(formData.get("customerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      pickupDate: String(formData.get("pickupDate") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      marketingOptIn: formData.get("marketingOptIn") === "on",
      selection,
      imageUploads,
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

  const headline = (() => {
    try {
      return getOrderHeadline(selection as never);
    } catch {
      return "Custom pet order";
    }
  })();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <form
        action={(formData) => startTransition(() => void submit(formData))}
        className="glass-card rounded-[36px] border border-white/60 p-8"
      >
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
            Step 1
          </p>
          <h2 className="section-title mt-2 text-3xl text-[var(--color-ink)]">
            Build your order
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--color-cocoa)]">
            Pick a product, tailor the details, and we&apos;ll hand everything over to
            secure Stripe checkout.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {productCatalog.map((product) => (
            <button
              key={product.type}
              type="button"
              onClick={() => updateSelection(product.type)}
              className={`rounded-[28px] border p-5 text-left transition ${
                productType === product.type
                  ? "border-[var(--color-berry)] bg-white shadow-lg shadow-pink-200/60"
                  : "border-white/60 bg-white/70 hover:-translate-y-0.5"
              }`}
            >
              <p className="font-display text-xl text-[var(--color-ink)]">
                {product.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-cocoa)]">
                {product.description}
              </p>
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
              Your name
            </label>
            <input
              name="customerName"
              type="text"
              defaultValue={session?.user?.name ?? ""}
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
              defaultValue={session?.user?.email ?? ""}
              required
              className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
              Phone
            </label>
            <input
              name="phone"
              type="text"
              required
              className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
              Pickup date & time
            </label>
            <input
              name="pickupDate"
              type="datetime-local"
              min={minimumPickupDateTime}
              required
              className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
            />
            <p className="mt-2 text-xs leading-5 text-[var(--color-cocoa)]/75">
              Please choose a pickup time at least 7 days from today.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-5 rounded-[28px] bg-white/70 p-6">
          <h3 className="font-display text-2xl text-[var(--color-ink)]">
            Product details
          </h3>

          {(productType === "head-cupcake" ||
            productType === "head-cake" ||
            productType === "full-body-cake") && (
            <div>
              <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                Flavor
              </label>
              <select
                value={String(selection.flavor ?? "chickenPumpkin")}
                onChange={(event) => onFieldChange("flavor", event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
              >
                {Object.entries(flavorCatalog).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {productType === "head-cake" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                  Head style
                </label>
                <select
                  value={String(selection.headCount ?? "single")}
                  onChange={(event) => {
                    const headCount = event.target.value;
                    onFieldChange("headCount", headCount);
                    if (headCount === "double") {
                      onFieldChange("baseSize", "5");
                    }
                  }}
                  className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                >
                  <option value="single">Single head</option>
                  <option value="double">Double head</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                  Base size
                </label>
                <select
                  value={String(selection.baseSize ?? "4")}
                  onChange={(event) => onFieldChange("baseSize", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                >
                  {(selection.headCount === "double" ? ["5", "6"] : ["4", "5", "6"]).map((size) => (
                    <option key={size} value={size}>
                      {size}&quot; base
                    </option>
                  ))}
                </select>
              </div>
              {selection.headCount === "double" ? (
                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                    Layout
                  </label>
                  <select
                    value={String(selection.layout ?? "stacked")}
                    onChange={(event) => onFieldChange("layout", event.target.value)}
                    className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                  >
                    <option value="stacked">Stacked</option>
                    <option value="side-by-side">Side-by-side</option>
                  </select>
                </div>
              ) : null}
            </div>
          ) : null}

          {productType === "full-body-cake" ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                  Size
                </label>
                <select
                  value={String(selection.size ?? "small")}
                  onChange={(event) => onFieldChange("size", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-[var(--color-cocoa)]">
                  Add-ons
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(addOnCatalog).map(([key, item]) => {
                    const selected = ((selection.addOns as string[] | undefined) ?? []).includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAddOn(key)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          selected
                            ? "border-[var(--color-berry)] bg-white"
                            : "border-[var(--color-blush)] bg-white/80"
                        }`}
                      >
                        <div className="font-bold text-[var(--color-ink)]">
                          {item.label}
                        </div>
                        <div className="text-sm text-[var(--color-cocoa)]">
                          +{formatCurrency(item.price)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}

          {productType === "themed-cookie" ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                  Flavor
                </label>
                <select
                  value={String(selection.flavor ?? "chicken-cheese")}
                  onChange={(event) => onFieldChange("flavor", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                >
                  <option value="chicken-cheese">Chicken cheese</option>
                  <option value="oat-peanut-butter">Oat peanut butter</option>
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                    Theme
                  </label>
                  <input
                    type="text"
                    value={String(selection.theme ?? "")}
                    onChange={(event) => onFieldChange("theme", event.target.value)}
                    className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                    Colour palette
                  </label>
                  <input
                    type="text"
                    value={String(selection.colourPalette ?? "")}
                    onChange={(event) => onFieldChange("colourPalette", event.target.value)}
                    className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                  />
                </div>
              </div>
            </>
          ) : null}

          {productType !== "full-body-cake" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {productType !== "themed-cookie" ? (
                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                    Colour
                  </label>
                  <select
                    value={String(selection.colour ?? "Blush Pink")}
                    onChange={(event) => onFieldChange("colour", event.target.value)}
                    className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                  >
                    {colourOptions.map((colour) => (
                      <option key={colour} value={colour}>
                        {colour}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                  Pet name
                </label>
                <input
                  type="text"
                  value={String(selection.petName ?? "")}
                  onChange={(event) => onFieldChange("petName", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                  Age turning
                </label>
                <input
                  type="text"
                  value={String(selection.turningAge ?? "")}
                  onChange={(event) => onFieldChange("turningAge", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-3"
                />
              </div>
            </div>
          ) : null}

          {productType !== "themed-cookie" ? (
            <div>
              <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
                Upload pet photos
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(event) =>
                  setFiles(Array.from(event.target.files ?? []).slice(0, 3))
                }
                className="block w-full rounded-2xl border border-dashed border-[var(--color-blush)] bg-white px-4 py-3 text-sm text-[var(--color-cocoa)]"
              />
              <p className="mt-2 text-sm text-[var(--color-cocoa)]">
                Up to 3 photos for colour matching and face details.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-bold text-[var(--color-cocoa)]">
            Extra notes
          </label>
          <textarea
            name="notes"
            rows={4}
            className="w-full rounded-3xl border border-[var(--color-blush)] bg-white px-4 py-3"
            placeholder="Allergies, inspiration notes, exact pickup window..."
          />
        </div>

        <label className="mt-6 flex gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[var(--color-cocoa)]">
          <input type="checkbox" name="marketingOptIn" className="mt-1" />
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
          className="mt-6 rounded-full bg-[var(--color-berry)] px-6 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? "Preparing checkout..." : "Continue to Stripe"}
        </button>
      </form>

      <aside className="space-y-5">
        <div className="glass-card rounded-[36px] border border-white/60 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
            Live summary
          </p>
          <h3 className="section-title mt-3 text-3xl text-[var(--color-ink)]">
            {headline}
          </h3>
          <p className="mt-3 text-[var(--color-cocoa)]">
            Price preview updates as you adjust sizes, flavours, and add-ons.
          </p>
          <div className="mt-6 rounded-[28px] bg-white/70 p-5 text-sm text-[var(--color-cocoa)]">
            <p className="font-bold text-[var(--color-ink)]">Estimated total</p>
            <p className="mt-2 font-display text-4xl text-[var(--color-berry)]">
              {pricePreview}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-[36px] border border-white/60 p-8">
          <h3 className="section-title text-2xl text-[var(--color-ink)]">
            What happens next
          </h3>
          <ol className="mt-4 space-y-4 text-sm leading-7 text-[var(--color-cocoa)]">
            <li>1. We recalculate your final order amount on the server.</li>
            <li>2. Stripe collects payment securely in AUD.</li>
            <li>3. You receive a confirmation email with pickup details.</li>
            <li>4. Our team receives your order notes and reference images.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}
