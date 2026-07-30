"use client";

import { useMemo, useState, useTransition } from "react";

import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { cartStorageKey, type CartImageUpload, type CartItem } from "@/lib/cart";
import {
  addOnCatalog,
  calculateOrderAmount,
  colourOptions,
  cupcakeCreamColourOptions,
  cookieMainColourOptions,
  flavorCatalog,
  getOrderHeadline,
  headCakeColourOptions,
  orderSelectionSchema,
  type ProductType,
} from "@/lib/products";
import {
  formatBrisbaneDateTimeInput,
  formatCurrency,
  getMinimumBrisbanePickupDateTime,
  isAtLeastMinimumBrisbanePickupDateTime,
  isWithinBrisbanePickupHours,
} from "@/lib/utils";

type OrderFormProps = {
  session: Session | null;
  firstOrderCookieEligible: boolean;
  initialProductType?: ProductType;
  productPreviewImages?: ProductPreviewImage[];
};

type ProductPreviewImage = {
  id: string;
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
};

function CarouselArrowIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      {direction === "previous" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 6 6 6-6 6" />
      )}
    </svg>
  );
}

const pickupTimeOptions = Array.from({ length: 41 }, (_, index) => {
  const totalMinutes = 10 * 60 + index * 15;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const hour12 = hour > 12 ? hour - 12 : hour;
  const period = hour >= 12 ? "PM" : "AM";
  const label = `${hour12}:${String(minute).padStart(2, "0")} ${period}`;

  return { value, label };
});

const defaultSelectionByProduct: Record<ProductType, Record<string, unknown>> = {
  "head-cupcake": {
    productType: "head-cupcake",
    flavor: "chickenPumpkin",
    colour: "Blue",
    petName: "",
    turningAge: "",
  },
  "head-cake": {
    productType: "head-cake",
    headCount: "single",
    layout: "stacked",
    baseSize: "4",
    flavor: "chickenPumpkin",
    colour: "Blue&Yellow",
    petName: "",
    turningAge: "",
  },
  "full-body-cake": {
    productType: "full-body-cake",
    size: "small",
    flavor: "chickenPumpkin",
    addOns: [] as string[],
    petName: "",
    turningAge: "",
  },
  "themed-cookie": {
    productType: "themed-cookie",
    cookieType: "birthday-set",
    flavor: "chicken-cheese",
    quantity: 5,
    gender: "",
    mainColor: "Blue",
    petName: "",
    turningAge: "",
  },
};

function isCartImageUpload(value: unknown): value is CartImageUpload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const image = value as CartImageUpload;
  return (
    typeof image.path === "string" &&
    typeof image.originalName === "string" &&
    ["image/jpeg", "image/png", "image/webp"].includes(image.mimeType)
  );
}

function parseStoredCartItem(value: string | null): CartItem | null {
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

function getStoredCartItemForProduct(productType: ProductType) {
  if (typeof window === "undefined") {
    return null;
  }

  const cartItem = parseStoredCartItem(
    window.localStorage.getItem(cartStorageKey),
  );

  return cartItem?.selection.productType === productType ? cartItem : null;
}

export function OrderForm({
  session,
  firstOrderCookieEligible,
  initialProductType = "head-cake",
  productPreviewImages = [],
}: OrderFormProps) {
  const [initialCartItem] = useState(() =>
    getStoredCartItemForProduct(initialProductType),
  );
  const [selection, setSelection] = useState<Record<string, unknown>>(
    initialCartItem?.selection ?? defaultSelectionByProduct[initialProductType],
  );
  const [files, setFiles] = useState<File[]>([]);
  const [existingImageUploads] = useState<CartImageUpload[]>(
    initialCartItem?.imageUploads ?? [],
  );
  const [notes, setNotes] = useState(initialCartItem?.notes ?? "");
  const [error, setError] = useState("");
  const [pickupDate, setPickupDate] = useState(
    initialCartItem?.pickupDate.slice(0, 10) ?? "",
  );
  const [pickupTime, setPickupTime] = useState(
    initialCartItem?.pickupDate.slice(11, 16) ?? "",
  );
  const [pickupError, setPickupError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<ProductPreviewImage | null>(null);
  const [isPending, startTransition] = useTransition();
  const productType = initialProductType;
  const maxReferencePhotos = 5;
  const minimumPickupDateTime = useMemo(() => getMinimumBrisbanePickupDateTime(), []);
  const minimumPickupDateTimeLabel = useMemo(
    () => formatBrisbaneDateTimeInput(minimumPickupDateTime),
    [minimumPickupDateTime],
  );
  const minimumPickupDate = minimumPickupDateTime.slice(0, 10);
  const minimumPickupTime = minimumPickupDateTime.slice(11);
  const selectedPickupDateTime =
    pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : "";
  const displayedPreviewImages =
    productType === "themed-cookie"
      ? productPreviewImages.filter((image) => {
          const isNameCookieImage = /\/T(?:39|41)\.jpg$/i.test(
            decodeURI(image.imageUrl),
          );

          return selection.cookieType === "name-cookie"
            ? isNameCookieImage
            : !isNameCookieImage;
        })
      : productPreviewImages;
  const activeDisplayedImage =
    displayedPreviewImages[activeImageIndex] ?? displayedPreviewImages[0];
  const productColourOptions =
    productType === "head-cupcake"
      ? cupcakeCreamColourOptions
      : productType === "head-cake"
        ? headCakeColourOptions
        : colourOptions;

  const pricePreview = useMemo(() => {
    try {
      return formatCurrency(calculateOrderAmount(selection as never));
    } catch {
      return "—";
    }
  }, [selection]);

  const headline = (() => {
    try {
      return getOrderHeadline(selection as never).split(" · ")[0];
    } catch {
      return "Custom pet order";
    }
  })();
  const hasMultiplePreviewImages = displayedPreviewImages.length > 1;
  const savedReferencePhotoCount = existingImageUploads.length + files.length;
  const availableNewPhotoSlots = Math.max(
    0,
    maxReferencePhotos - existingImageUploads.length,
  );

  function showPreviousImage() {
    if (!hasMultiplePreviewImages) {
      return;
    }

    setActiveImageIndex((index) =>
      index === 0 ? displayedPreviewImages.length - 1 : index - 1,
    );
  }

  function showNextImage() {
    if (!hasMultiplePreviewImages) {
      return;
    }

    setActiveImageIndex((index) =>
      index === displayedPreviewImages.length - 1 ? 0 : index + 1,
    );
  }

  function onFieldChange(key: string, value: unknown) {
    setSelection((current) => ({ ...current, [key]: value }));
  }

  function onColourModeChange(value: string) {
    onFieldChange("colour", value === "Custom" ? "" : value);
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

  async function addToCart() {
    setError("");
    setPickupError("");

    const parsedSelection = orderSelectionSchema.safeParse(selection);

    if (!parsedSelection.success) {
      setError("Please complete the product details before adding to cart.");
      return;
    }

    const selectedPickupDate = selectedPickupDateTime;

    if (!selectedPickupDate) {
      setPickupError("Please choose a pickup date and time.");
      return;
    }

    if (
      !isAtLeastMinimumBrisbanePickupDateTime(
        selectedPickupDate,
        minimumPickupDateTime,
      )
    ) {
      setPickupError(
        `Please choose a pickup time from ${minimumPickupDateTimeLabel} or later.`,
      );
      return;
    }

    if (!isWithinBrisbanePickupHours(selectedPickupDate)) {
      setPickupError(
        "Pickup is available daily between 10:00 AM and 8:00 PM Brisbane time.",
      );
      return;
    }

    if (productType !== "themed-cookie" && savedReferencePhotoCount === 0) {
      setError("Please upload at least 1 reference photo before adding to cart.");
      return;
    }

    const draftId = crypto.randomUUID();
    const imageUploads: CartImageUpload[] = existingImageUploads.slice(
      0,
      maxReferencePhotos,
    );
    const remainingPhotoSlots = maxReferencePhotos - imageUploads.length;

    for (const file of files.slice(0, remainingPhotoSlots)) {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("draftId", draftId);

      const uploadResponse = await fetch("/api/uploads/order-reference", {
        method: "POST",
        body: uploadData,
      });
      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !isCartImageUpload(uploadResult.file)) {
        setError(uploadResult.error ?? "Image upload failed.");
        return;
      }

      imageUploads.push(uploadResult.file);
    }

    const cartItem: CartItem = {
      version: 1,
      selection: parsedSelection.data,
      pickupDate: selectedPickupDate,
      notes,
      imageUploads,
      addedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItem));
    window.location.href = "/cart";
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/"
        className="mb-5 inline-flex text-sm font-bold text-[var(--color-cocoa)] transition hover:text-[var(--color-berry)]"
      >
        &lt; Back to Home
      </Link>

      <form
        noValidate
        action={() => startTransition(() => void addToCart())}
        className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"
      >
        <div className="space-y-4 lg:sticky lg:top-6">
          {activeDisplayedImage ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPreviewImage(activeDisplayedImage)}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] border-[6px] border-white bg-white shadow-[0_18px_40px_rgba(122,74,50,0.14)]"
                  aria-label={`View larger ${activeDisplayedImage.alt}`}
                >
                  <Image
                    src={activeDisplayedImage.imageUrl}
                    alt={activeDisplayedImage.alt}
                    fill
                    priority={activeImageIndex === 0}
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </button>

                {hasMultiplePreviewImages ? (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--color-cocoa)] shadow-lg transition hover:-translate-y-[52%] hover:bg-white"
                      aria-label="Show previous product image"
                    >
                      <CarouselArrowIcon direction="previous" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--color-cocoa)] shadow-lg transition hover:-translate-y-[52%] hover:bg-white"
                      aria-label="Show next product image"
                    >
                      <CarouselArrowIcon direction="next" />
                    </button>
                  </>
                ) : null}
              </div>

              {hasMultiplePreviewImages ? (
                <>
                  <div className="flex justify-center gap-2 lg:hidden">
                    {displayedPreviewImages.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        aria-label={`Show product image ${index + 1}`}
                        className={`size-2.5 rounded-full transition ${
                          index === activeImageIndex
                            ? "bg-[var(--color-berry)]"
                            : "bg-[var(--color-cocoa)]/25"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="hidden grid-cols-5 gap-3 lg:grid">
                    {displayedPreviewImages.slice(0, 5).map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-[18px] border-4 bg-white transition ${
                          index === activeImageIndex
                            ? "border-[var(--color-berry)]"
                            : "border-white opacity-80 hover:opacity-100"
                        }`}
                        aria-label={`Show product image ${index + 1}`}
                      >
                        <Image
                          src={image.imageUrl}
                          alt={image.alt}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="aspect-[4/3] rounded-[32px] bg-white/70" />
          )}

          <section className="rounded-[24px] border border-white/70 bg-white/85 px-5 py-3 shadow-[0_16px_36px_rgba(122,74,50,0.1)]">
            <div className="flex items-end justify-between gap-4">
              <h1 className="section-title min-w-0 text-xl leading-none text-[var(--color-ink)] md:text-2xl">
                {headline}
              </h1>
              <p className="price-text shrink-0 text-xl leading-none text-[var(--color-berry)] md:text-2xl">
                {pricePreview}
              </p>
            </div>
          </section>

          {productType === "head-cupcake" ||
          productType === "head-cake" ||
          productType === "full-body-cake" ||
          productType === "themed-cookie" ? (
            <div className="space-y-4 rounded-[28px] border border-white/70 bg-white/80 p-5 text-[var(--color-cocoa)] shadow-[0_16px_36px_rgba(122,74,50,0.1)] lg:pb-12">
              <section className="space-y-3">
                <h2 className="font-display text-2xl text-[var(--color-ink)]">
                  Ingredients
                </h2>
                {productType === "themed-cookie" ? (
                  <div className="space-y-3 text-sm leading-6">
                    <p>
                      <strong>Chicken &amp; Cheese:</strong> cooked chicken
                      breast, homemade goat cheese, goat milk powder, organic
                      coconut flour, fruit and vegetable powder.
                    </p>
                    <p>
                      <strong>Oat &amp; Peanut Butter:</strong> organic coconut
                      flour, organic buckwheat flour, wheat free oat flour,
                      peanut butter, free range eggs, homemade goat cheese,
                      organic virgin coconut oil, goat milk powder, fruit and
                      vegetable powder.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm leading-6">
                    <p>
                      <strong>Cake Base:</strong> Every cake base contains only the
                      ingredients in the flavour you choose.
                    </p>
                    <p>
                      For example, the Chicken &amp; Pumpkin flavour contains only
                      cooked chicken breast and cooked pumpkin—nothing else.
                    </p>
                    <p>
                      <strong>Cream:</strong> Homemade goat cheese, Chinese yam,
                      fruit and vegetable powder.
                    </p>
                    <p>
                      <strong>Decoration Cookies:</strong> Goat milk powder, fruit
                      and vegetable powder.
                    </p>
                  </div>
                )}
              </section>

              <details className="group rounded-[22px] border border-[var(--color-blush)] bg-[#fff8fb]">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 font-display text-xl text-[var(--color-ink)]">
                  <span className="relative size-7 shrink-0 rounded-full bg-[var(--color-berry)] text-lg leading-none text-white">
                    <span className="accordion-toggle-symbol group-open:hidden">+</span>
                    <span className="accordion-toggle-symbol hidden group-open:block">−</span>
                  </span>
                  Feeding
                </summary>
                <div className="space-y-3 px-4 pb-4 text-sm leading-6 text-[var(--color-cocoa)]">
                  {productType === "themed-cookie" ? (
                    <p>
                      Feed as a treat, add as a topper for meals or use for
                      training. Always monitor your dog while eating and ensure
                      access to fresh water. Treats should not exceed more than
                      10% of your dog&apos;s diet.
                    </p>
                  ) : (
                    <>
                      <p>
                        We want every celebration to be safe and enjoyable for your
                        furry friend! 🐾
                      </p>
                      <p>
                        Remove the cake from the refrigerator 30 minutes before
                        serving to allow it to reach room temperature.
                      </p>
                      <p>
                        Before serving, remove any non-edible decorations (such as
                        candles, paper toppers, or other decorative items) to prevent
                        accidental ingestion.
                      </p>
                      <p>
                        Our cakes are high in meat content, so please introduce them
                        gradually and avoid feeding large portions at once, as this
                        may cause digestive upset or soft stools. If this is your fur
                        baby’s first time trying our cake, we recommend mixing a small
                        portion with their regular food for the first serving.
                      </p>
                    </>
                  )}
                </div>
              </details>

              <details className="group rounded-[22px] border border-[var(--color-blush)] bg-[#fff8fb]">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 font-display text-xl text-[var(--color-ink)]">
                  <span className="relative size-7 shrink-0 rounded-full bg-[var(--color-berry)] text-lg leading-none text-white">
                    <span className="accordion-toggle-symbol group-open:hidden">+</span>
                    <span className="accordion-toggle-symbol hidden group-open:block">−</span>
                  </span>
                  Storage
                </summary>
                <div className="space-y-3 px-4 pb-4 text-sm leading-6 text-[var(--color-cocoa)]">
                  {productType === "themed-cookie" ? (
                    <p>
                      Store in a cool, dry place in an airtight container or their
                      original packaging. These cookies should have an approximate
                      shelf life of 1 months. Once opened, consume within 7 days
                      for optimal freshness. Products can also be frozen to
                      extend shelf life.
                    </p>
                  ) : (
                    <>
                      <p>Please refrigerate the cake as soon as it arrives.</p>
                      <p>
                        Store any leftovers in container in the refrigerator for up
                        to 2 days, or freeze for up to 3 weeks. Thaw in the
                        refrigerator before serving.
                      </p>
                    </>
                  )}
                </div>
              </details>
            </div>
          ) : null}
        </div>

        <div className="glass-card overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(122,74,50,0.12)]">
          <div className="space-y-3 p-4 md:p-5">
            {!session?.user || firstOrderCookieEligible ? (
              <div className="rounded-[20px] border border-[var(--color-blush)] bg-[#fff8fb] px-4 py-3 text-xs leading-5 text-[var(--color-cocoa)] md:text-sm">
                {session?.user ? (
                  <p>
                    <strong className="text-[var(--color-berry)]">
                      First-order bonus:
                    </strong>{" "}
                    Your account is eligible for 1 free cookie with this cake order.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p>Create an account or log in to claim 1 free cookie.</p>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        href="/register"
                        className="rounded-full bg-[var(--color-berry)] px-4 py-2 text-xs font-black uppercase tracking-[0.04em] text-white transition hover:-translate-y-0.5"
                      >
                        Register
                      </Link>
                      <Link
                        href="/login"
                        className="rounded-full border border-[var(--color-blush)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.04em] text-[var(--color-berry)] transition hover:-translate-y-0.5"
                      >
                        Log in
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <section className="space-y-3 rounded-[24px] bg-[#fffaf1] p-4">
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-display text-xl text-[var(--color-ink)] md:text-2xl">
                  Product options
                </h2>
              </div>

              {(productType === "head-cupcake" ||
                productType === "head-cake" ||
                productType === "full-body-cake") && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                    Flavor
                  </label>
                  <select
                    value={String(selection.flavor ?? "chickenPumpkin")}
                    onChange={(event) => onFieldChange("flavor", event.target.value)}
                    className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
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
                    <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
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
                      className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                    >
                      <option value="single">Single head</option>
                      <option value="double">Double head</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                      Base size
                    </label>
                    <select
                      value={String(selection.baseSize ?? "4")}
                      onChange={(event) => onFieldChange("baseSize", event.target.value)}
                      className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
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
                      <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                        Layout
                      </label>
                      <select
                        value={String(selection.layout ?? "stacked")}
                        onChange={(event) => onFieldChange("layout", event.target.value)}
                        className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
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
                    <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                      Size
                    </label>
                    <select
                      value={String(selection.size ?? "small")}
                      onChange={(event) => onFieldChange("size", event.target.value)}
                      className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
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
                            className={`rounded-2xl border px-4 py-2.5 text-left transition ${
                              selected
                                ? "border-[var(--color-berry)] bg-white shadow-sm"
                                : "border-[var(--color-blush)] bg-white/80"
                            }`}
                          >
                            <div className="font-bold text-[var(--color-ink)]">
                              {item.label}
                            </div>
                            <div className="price-text text-sm text-[var(--color-cocoa)]">
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
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      {
                        value: "birthday-set",
                        title: "Birthday Cookies Set",
                        price: "$49",
                        description:
                          "Goat milk iced birthday themed cookies. Come in a pack of 8. Each set comes with a random selection of cookie designs.",
                      },
                      {
                        value: "name-cookie",
                        title: "Name Cookies",
                        price: "$5/ea",
                        description: "Min order 5. Goat milk iced cookies with name.",
                      },
                    ].map((option) => {
                      const selected = selection.cookieType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            onFieldChange("cookieType", option.value);
                            setActiveImageIndex(0);
                          }}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            selected
                              ? "border-[var(--color-berry)] bg-white shadow-sm"
                              : "border-[var(--color-blush)] bg-white/80"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-display text-xl text-[var(--color-ink)]">
                              {option.title}
                            </span>
                            <span className="price-text text-xl text-[var(--color-berry)]">
                              {option.price}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-[var(--color-cocoa)]">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {selection.cookieType === "name-cookie" ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={5}
                        value={Number(selection.quantity ?? 5)}
                        onChange={(event) =>
                          onFieldChange("quantity", Number(event.target.value))
                        }
                        className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                      />
                      <p className="mt-1.5 text-xs text-[var(--color-cocoa)]/75">
                        Minimum order 5.
                      </p>
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                      Flavor
                    </label>
                    <select
                      value={String(selection.flavor ?? "chicken-cheese")}
                      onChange={(event) => onFieldChange("flavor", event.target.value)}
                      className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                    >
                      <option value="chicken-cheese">Chicken &amp; Cheese</option>
                      <option value="oat-peanut-butter">Oat &amp; Peanut Butter</option>
                    </select>
                  </div>
                </>
              ) : null}

              {productType === "head-cupcake" ||
              productType === "head-cake" ||
              productType === "full-body-cake" ||
              productType === "themed-cookie" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {productType !== "themed-cookie" &&
                  productType !== "full-body-cake" ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                        {productType === "head-cupcake" ? "Cream Color" : "Colour"}
                      </label>
                      <select
                        value={
                          productColourOptions.includes(selection.colour as never)
                            ? String(selection.colour)
                            : "Custom"
                        }
                        onChange={(event) => onColourModeChange(event.target.value)}
                          className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                      >
                        {productColourOptions.map((colour) => (
                          <option key={colour} value={colour}>
                            {colour}
                          </option>
                        ))}
                      </select>
                      {!productColourOptions.includes(selection.colour as never) ? (
                        <input
                          type="text"
                          value={String(selection.colour ?? "")}
                          onChange={(event) => onFieldChange("colour", event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-xs sm:placeholder:text-sm"
                          placeholder="Custom colours"
                        />
                      ) : null}
                    </div>
                  ) : null}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                      Pet name
                    </label>
                    <input
                      type="text"
                      value={String(selection.petName ?? "")}
                      onChange={(event) => onFieldChange("petName", event.target.value)}
                      className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                    />
                  </div>
                  {productType === "themed-cookie" ? (
                    <>
                      <div>
                        <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                          Gender
                        </label>
                        <input
                          type="text"
                          value={String(selection.gender ?? "")}
                          onChange={(event) => onFieldChange("gender", event.target.value)}
                          className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                          Main Color
                        </label>
                        <select
                          value={
                            cookieMainColourOptions.includes(selection.mainColor as never)
                              ? String(selection.mainColor)
                              : "Custom"
                          }
                          onChange={(event) =>
                            onFieldChange(
                              "mainColor",
                              event.target.value === "Custom" ? "" : event.target.value,
                            )
                          }
                          className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                        >
                          {cookieMainColourOptions.map((colour) => (
                            <option key={colour} value={colour}>
                              {colour}
                            </option>
                          ))}
                        </select>
                        {!cookieMainColourOptions.includes(
                          selection.mainColor as never,
                        ) ? (
                          <input
                            type="text"
                            value={String(selection.mainColor ?? "")}
                            onChange={(event) =>
                              onFieldChange("mainColor", event.target.value)
                            }
                            className="mt-3 w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                            placeholder="Custom colour"
                          />
                        ) : null}
                      </div>
                    </>
                  ) : null}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                      {productType === "themed-cookie" ? "Age" : "Age turning"}
                    </label>
                    <input
                      type="text"
                      value={String(selection.turningAge ?? "")}
                      onChange={(event) => onFieldChange("turningAge", event.target.value)}
                      className="w-full rounded-2xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                    />
                  </div>
                </div>
              ) : null}
            </section>

            <section className="space-y-3 rounded-[24px] bg-white/70 p-4">
              <h2 className="font-display text-xl text-[var(--color-ink)] md:text-2xl">
                Pickup & reference
              </h2>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                  Pickup date & time
                </label>
                <input
                  name="pickupDate"
                  type="hidden"
                  value={selectedPickupDateTime}
                  readOnly
                />
                <div className="grid gap-3 sm:grid-cols-[1fr_0.75fr]">
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(event) => {
                      const nextPickupDate = event.target.value;
                      setPickupDate(nextPickupDate);
                      if (
                        nextPickupDate === minimumPickupDate &&
                        pickupTime &&
                        pickupTime < minimumPickupTime
                      ) {
                        setPickupTime("");
                      }
                      setPickupError("");
                    }}
                    min={minimumPickupDate}
                    aria-invalid={Boolean(pickupError)}
                    aria-describedby="pickup-date-help pickup-date-error"
                    className={`w-full rounded-2xl border bg-white px-4 py-2.5 shadow-sm ${
                      pickupError
                        ? "border-rose-300 ring-2 ring-rose-100"
                        : "border-[var(--color-blush)]"
                    }`}
                  />
                  <select
                    value={pickupTime}
                    onChange={(event) => {
                      setPickupTime(event.target.value);
                      setPickupError("");
                    }}
                    aria-label="Pickup time"
                    aria-invalid={Boolean(pickupError)}
                    aria-describedby="pickup-date-help pickup-date-error"
                    className={`w-full rounded-2xl border bg-white px-4 py-2.5 shadow-sm ${
                      pickupError
                        ? "border-rose-300 ring-2 ring-rose-100"
                        : "border-[var(--color-blush)]"
                    }`}
                  >
                    <option value="">Choose time</option>
                    {pickupTimeOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={
                          pickupDate === minimumPickupDate &&
                          option.value < minimumPickupTime
                        }
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p
                  id="pickup-date-help"
                  className="mt-1.5 text-xs leading-5 text-[var(--color-cocoa)]/75"
                >
                  Earliest pickup: {minimumPickupDateTimeLabel}. Pickup hours:
                  10:00 AM–8:00 PM Brisbane time.
                </p>
                {pickupError ? (
                  <p
                    id="pickup-date-error"
                    className="mt-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700"
                  >
                    {pickupError}
                  </p>
                ) : null}
              </div>

              {productType !== "themed-cookie" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                    Upload pet photo
                  </label>
                  <p className="mb-2 rounded-2xl border border-[var(--color-blush)] bg-[#fff8fb] px-4 py-3 text-xs leading-5 text-[var(--color-cocoa)] md:text-sm">
                    {productType === "full-body-cake" ? (
                      <>
                        Please upload the following clear photos of your fur baby:
                        <br />
                        - The pose and expression
                        <br />
                        - A full-body front view
                        <br />
                        - A close-up of the face
                        <br />
                        - A left-side view
                        <br />- A right-side view
                      </>
                    ) : (
                      <>
                        Please upload a clear, front-facing photo of your fur baby
                        taken at eye level. The photo should show the expression
                        you’d like us to recreate — for example, tongue out, mouth
                        closed, smiling, etc.
                      </>
                    )}
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                      setFiles(
                        Array.from(event.target.files ?? []).slice(
                          0,
                          availableNewPhotoSlots,
                        ),
                      )
                    }
                    className="block w-full rounded-2xl border border-dashed border-[var(--color-blush)] bg-white px-4 py-2.5 text-sm text-[var(--color-cocoa)]"
                  />
                  <p className="mt-1.5 text-xs leading-5 text-[var(--color-cocoa)]">
                    Upload 1–5 reference photos. Each photo must be under 2MB.
                  </p>
                  {existingImageUploads.length > 0 ? (
                    <p className="mt-1 text-xs font-bold text-[var(--color-berry)]">
                      {existingImageUploads.length} uploaded reference photo
                      {existingImageUploads.length === 1 ? "" : "s"} saved.
                    </p>
                  ) : null}
                  {files.length > 0 ? (
                    <p className="mt-1 text-xs font-bold text-[var(--color-berry)]">
                      {files.length} new photo{files.length === 1 ? "" : "s"}{" "}
                      selected.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {productType === "full-body-cake" ? (
                <p className="rounded-2xl border border-[var(--color-blush)] bg-[#fff8fb] px-4 py-3 text-xs leading-5 text-[var(--color-cocoa)] md:text-sm">
                  Please let us know your preferred pose and expression (for
                  example, sitting, lying down, etc.) and upload at least one
                  clear photo of your fur baby in that pose and expression. If no
                  pose is specified, a sitting pose will be used by default.
                </p>
              ) : null}

              <div>
                <label className="mb-1.5 block text-sm font-bold text-[var(--color-cocoa)]">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full rounded-3xl border border-[var(--color-blush)] bg-white px-4 py-2.5 shadow-sm"
                  placeholder="Allergies, inspiration notes, exact pickup window..."
                />
              </div>
            </section>

            {error ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="fredoka-text w-full rounded-full bg-[var(--color-berry)] px-6 py-3.5 text-base font-black uppercase tracking-[0.04em] text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isPending ? (
                "Adding to cart..."
              ) : (
                <>
                  <span className="md:hidden">Add to cart · {pricePreview}</span>
                  <span className="hidden md:inline">Add to cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {previewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1a12]/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Product example preview"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border-4 border-white bg-[#fff8eb] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-black uppercase text-[var(--color-cocoa)] shadow-lg transition hover:-translate-y-0.5"
              aria-label="Close product example preview"
            >
              Close
            </button>
            <div className="relative aspect-[4/3] max-h-[82vh] bg-[#fff8eb]">
              <Image
                src={previewImage.imageUrl}
                alt={previewImage.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
