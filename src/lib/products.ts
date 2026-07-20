import { z } from "zod";

import {
  formatCurrency,
  getMinimumBrisbanePickupDateTime,
  parseBrisbaneDateTime,
} from "@/lib/utils";

export const colourOptions = [
  "Blush Pink",
  "Cream",
  "Mint",
  "Sky Blue",
  "Lilac",
  "Butter Yellow",
  "Terracotta",
  "Custom",
] as const;

export const cupcakeCreamColourOptions = [
  "Blue",
  "Yellow",
  "Pink",
  "Purple",
  "Custom",
] as const;

export const headCakeColourOptions = [
  "Blue&Yellow",
  "Blue&White",
  "Blue&Pink",
  "Yellow&White",
  "Pink&Yellow",
  "Pink&Purple",
  "Custom",
] as const;

export const cookieMainColourOptions = [
  "Blue",
  "Yellow",
  "Black",
  "Pink",
  "Purple",
  "Other",
] as const;

export const flavorCatalog = {
  chickenPumpkin: { label: "Chicken breast & pumpkin" },
  turkeyCarrot: { label: "Turkey Breast & Carrot" },
  duckCarrot: { label: "Duck Breast & Carrot" },
  beefCarrot: { label: "Beef & Carrot" },
  kangarooPumpkin: { label: "Kangaroo & Pumpkin" },
} as const;

export type FlavorKey = keyof typeof flavorCatalog;
export type ProductType =
  | "head-cupcake"
  | "head-cake"
  | "full-body-cake"
  | "themed-cookie";

const cupcakePrices: Record<FlavorKey, number> = {
  chickenPumpkin: 49,
  turkeyCarrot: 53,
  duckCarrot: 57,
  beefCarrot: 55,
  kangarooPumpkin: 55,
};

const singleHeadCakePrices: Record<FlavorKey, Record<"4" | "5" | "6", number>> = {
  chickenPumpkin: { "4": 84, "5": 106, "6": 128 },
  turkeyCarrot: { "4": 90, "5": 114, "6": 138 },
  duckCarrot: { "4": 96, "5": 122, "6": 148 },
  beefCarrot: { "4": 92, "5": 116, "6": 140 },
  kangarooPumpkin: { "4": 92, "5": 116, "6": 140 },
};

const doubleHeadCakePrices: Record<FlavorKey, Record<"5" | "6", number>> = {
  chickenPumpkin: { "5": 126, "6": 158 },
  turkeyCarrot: { "5": 136, "6": 170 },
  duckCarrot: { "5": 146, "6": 182 },
  beefCarrot: { "5": 138, "6": 172 },
  kangarooPumpkin: { "5": 138, "6": 172 },
};

const fullBodyCakePrices: Record<
  "small" | "medium" | "large",
  Record<FlavorKey, number>
> = {
  small: {
    chickenPumpkin: 69,
    turkeyCarrot: 74,
    duckCarrot: 77,
    beefCarrot: 75,
    kangarooPumpkin: 75,
  },
  medium: {
    chickenPumpkin: 89,
    turkeyCarrot: 96,
    duckCarrot: 101,
    beefCarrot: 97,
    kangarooPumpkin: 97,
  },
  large: {
    chickenPumpkin: 109,
    turkeyCarrot: 118,
    duckCarrot: 125,
    beefCarrot: 119,
    kangarooPumpkin: 119,
  },
};

export const addOnCatalog = {
  miniCake: { label: "Mini cake", price: 4 },
  toy: { label: "Toy", price: 3 },
  clothes: { label: "Clothes", price: 6 },
  background: { label: "Background", price: 5 },
} as const;

export type AddOnKey = keyof typeof addOnCatalog;

export const productCatalog = [
  {
    type: "head-cupcake" as const,
    slug: "head-cupcake",
    title: "3D Head Cupcake",
    description:
      "A cute cupcake topper sculpted to look like your pet, finished in your chosen colours.",
  },
  {
    type: "head-cake" as const,
    slug: "head-cake",
    title: "3D Head Cake",
    description:
      "Single-head or double-head celebration cake with a custom colour palette and your pet's name.",
  },
  {
    type: "full-body-cake" as const,
    slug: "full-body-cake",
    title: "3D Full Body Cake",
    description:
      "A full sculpted body cake with optional styling add-ons for an extra playful finish.",
  },
  {
    type: "themed-cookie" as const,
    slug: "themed-cookie",
    title: "Cookies",
    description:
      "Goat milk iced birthday cookies and name cookies for sweet pet celebrations.",
  },
] as const;

export type ProductSlug = (typeof productCatalog)[number]["slug"];

const commonCustomerSchema = z.object({
  customerName: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().min(6, "Please enter a contact phone."),
  pickupDate: z
    .string()
    .min(1, "Please choose a pickup date and time.")
    .refine((value) => {
      const selectedDate = parseBrisbaneDateTime(value);
      const minimumDate = parseBrisbaneDateTime(getMinimumBrisbanePickupDateTime());

      return Boolean(selectedDate && minimumDate && selectedDate >= minimumDate);
    }, "Please choose a pickup time at least 7 days from today in Brisbane time."),
  notes: z.string().max(600).optional().default(""),
  marketingOptIn: z.boolean().default(false),
});

const imageReferenceSchema = z.object({
  path: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[^/]+$/i,
    ),
  originalName: z.string().min(1).max(255),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

const cupcakeSelectionSchema = z.object({
  productType: z.literal("head-cupcake"),
  flavor: z.enum(Object.keys(flavorCatalog) as [FlavorKey, ...FlavorKey[]]),
  colour: z.string().min(1),
  petName: z.string().min(1),
  turningAge: z.string().min(1),
});

const headCakeSelectionSchema = z
  .object({
    productType: z.literal("head-cake"),
    headCount: z.enum(["single", "double"]),
    layout: z.enum(["stacked", "side-by-side"]).optional(),
    baseSize: z.enum(["4", "5", "6"]),
    flavor: z.enum(Object.keys(flavorCatalog) as [FlavorKey, ...FlavorKey[]]),
    colour: z.string().min(1),
    petName: z.string().min(1),
    turningAge: z.string().min(1),
  })
  .superRefine((value, ctx) => {
    if (value.headCount === "single" && value.baseSize === "6") {
      return;
    }

    if (value.headCount === "single" && value.baseSize === "4") {
      return;
    }

    if (value.headCount === "single" && value.baseSize === "5") {
      return;
    }

    if (value.headCount === "double") {
      if (!value.layout) {
        ctx.addIssue({
          code: "custom",
          message: "Please choose stacked or side-by-side.",
          path: ["layout"],
        });
      }

      if (value.baseSize === "4") {
        ctx.addIssue({
          code: "custom",
          message: "Double-head cakes are only available in 5\" or 6\".",
          path: ["baseSize"],
        });
      }
    }
  });

const fullBodySelectionSchema = z.object({
  productType: z.literal("full-body-cake"),
  size: z.enum(["small", "medium", "large"]),
  flavor: z.enum(Object.keys(flavorCatalog) as [FlavorKey, ...FlavorKey[]]),
  addOns: z
    .array(z.enum(Object.keys(addOnCatalog) as [AddOnKey, ...AddOnKey[]]))
    .default([]),
});

const cookieSelectionSchema = z.object({
  productType: z.literal("themed-cookie"),
  cookieType: z.enum(["birthday-set", "name-cookie"]),
  flavor: z.enum(["chicken-cheese", "oat-peanut-butter"]),
  quantity: z.coerce.number().int().min(5).optional().default(5),
  gender: z.string().min(1),
  mainColor: z.enum(cookieMainColourOptions),
  petName: z.string().min(1),
  turningAge: z.string().min(1),
});

export const orderSelectionSchema = z.discriminatedUnion("productType", [
  cupcakeSelectionSchema,
  headCakeSelectionSchema,
  fullBodySelectionSchema,
  cookieSelectionSchema,
]);

export const orderPayloadSchema = commonCustomerSchema.extend({
  imageUploads: z.array(imageReferenceSchema).max(5).default([]),
  selection: orderSelectionSchema,
});

export type OrderPayload = z.infer<typeof orderPayloadSchema>;
export type OrderSelection = OrderPayload["selection"];

export function calculateOrderAmount(selection: OrderSelection) {
  switch (selection.productType) {
    case "head-cupcake":
      return cupcakePrices[selection.flavor];
    case "head-cake":
      if (selection.headCount === "double") {
        return doubleHeadCakePrices[selection.flavor][
          selection.baseSize as "5" | "6"
        ];
      }

      return singleHeadCakePrices[selection.flavor][selection.baseSize];
    case "full-body-cake":
      return (
        fullBodyCakePrices[selection.size][selection.flavor] +
        selection.addOns.reduce((total, key) => total + addOnCatalog[key].price, 0)
      );
    case "themed-cookie":
      if (selection.cookieType === "name-cookie") {
        return selection.quantity * 5;
      }

      return 49;
  }
}

export function buildOrderSummary(selection: OrderSelection) {
  switch (selection.productType) {
    case "head-cupcake":
      return [
        { label: "Product", value: "3D Head Cupcake" },
        { label: "Flavor", value: flavorCatalog[selection.flavor].label },
        { label: "Colour", value: selection.colour },
        { label: "Pet name", value: selection.petName },
        { label: "Turning age", value: selection.turningAge },
      ];
    case "head-cake":
      return [
        { label: "Product", value: "3D Head Cake" },
        {
          label: "Head style",
          value: selection.headCount === "single" ? "Single head" : "Double head",
        },
        {
          label: "Layout",
          value:
            selection.headCount === "double"
              ? selection.layout === "stacked"
                ? "Stacked"
                : "Side-by-side"
              : "Single head",
        },
        { label: "Base size", value: `${selection.baseSize}" base` },
        { label: "Flavor", value: flavorCatalog[selection.flavor].label },
        { label: "Colour", value: selection.colour },
        { label: "Pet name", value: selection.petName },
        { label: "Turning age", value: selection.turningAge },
      ];
    case "full-body-cake":
      return [
        { label: "Product", value: "3D Full Body Cake" },
        { label: "Size", value: selection.size },
        { label: "Flavor", value: flavorCatalog[selection.flavor].label },
        {
          label: "Add-ons",
          value:
            selection.addOns.length > 0
              ? selection.addOns.map((item) => addOnCatalog[item].label).join(", ")
              : "None",
        },
      ];
    case "themed-cookie":
      return [
        {
          label: "Product",
          value:
            selection.cookieType === "birthday-set"
              ? "Birthday Cookies Set"
              : "Name Cookies",
        },
        ...(selection.cookieType === "name-cookie"
          ? [{ label: "Quantity", value: String(selection.quantity) }]
          : []),
        {
          label: "Flavor",
          value:
            selection.flavor === "chicken-cheese"
              ? "Chicken & Cheese"
              : "Oat & Peanut Butter",
        },
        { label: "Pet name", value: selection.petName },
        { label: "Gender", value: selection.gender },
        { label: "Turning age", value: selection.turningAge },
        { label: "Main color", value: selection.mainColor },
      ];
  }
}

export function getOrderHeadline(selection: OrderSelection) {
  const amount = formatCurrency(calculateOrderAmount(selection));
  const product = productCatalog.find((item) => item.type === selection.productType);

  return `${product?.title ?? "Order"} · ${amount}`;
}
