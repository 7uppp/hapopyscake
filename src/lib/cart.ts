import type { OrderSelection } from "@/lib/products";

export const cartStorageKey = "happy-cake-cart";

export type CartImageUpload = {
  path: string;
  originalName: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

export type CartItem = {
  version: 1;
  selection: OrderSelection;
  pickupDate: string;
  notes: string;
  imageUploads: CartImageUpload[];
  addedAt: string;
};
