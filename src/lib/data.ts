import fs from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { fallbackGalleryItems } from "@/lib/site";
import { getGalleryPublicUrl } from "@/lib/supabase";
import type { ProductType } from "@/lib/products";

export type GalleryItemData = {
  id: string;
  title: string;
  alt: string;
  caption: string;
  category: string;
  imageUrl: string;
  width: number;
  height: number;
};

const customerGalleryFolders = [{ folder: "Happy paws", category: "Happy Paws" }] as const;
const fixedCakeGalleryFolders = [
  { folder: "cakes/3D head", category: "3D Head Cakes" },
  { folder: "cakes/3D full body", category: "3D Full Body Cakes" },
  { folder: "cakes/3D head cupcake", category: "3D Head Cupcakes" },
  { folder: "cakes/cookies", category: "Cookies" },
] as const;
const productGalleryFolders: Record<
  ProductType,
  { folder: string; category: string }
> = {
  "head-cupcake": { folder: "cakes/3D head cupcake", category: "3D Head Cupcakes" },
  "head-cake": { folder: "cakes/3D head", category: "3D Head Cakes" },
  "full-body-cake": { folder: "cakes/3D full body", category: "3D Full Body Cakes" },
  "themed-cookie": { folder: "cakes/cookies", category: "Cookies" },
};

function getNumericSortValue(fileName: string) {
  const value = Number.parseInt(fileName.replace(/\D/g, ""), 10);
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

function getTitleSortValue(title: string) {
  const value = Number.parseInt(title.replace(/\D/g, ""), 10);
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

function readPngDimensions(buffer: Buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readJpegDimensions(buffer: Buffer) {
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

function readImageDimensions(buffer: Buffer, extension: string) {
  if (extension === ".png") {
    return readPngDimensions(buffer);
  }

  if (extension === ".jpg" || extension === ".jpeg") {
    return readJpegDimensions(buffer);
  }

  return null;
}

async function getLocalGalleryItems(
  folders: ReadonlyArray<{ folder: string; category: string }>,
): Promise<GalleryItemData[]> {
  const itemGroups = await Promise.all(
    folders.map(async ({ folder, category }) => {
      const folderPath = path.join(process.cwd(), "public", ...folder.split("/"));
      const files = (await fs.readdir(folderPath))
        .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
        .sort((first, second) => getNumericSortValue(first) - getNumericSortValue(second));

      return Promise.all(
        files.map(async (file, index) => {
          const extension = path.extname(file).toLowerCase();
          const buffer = await fs.readFile(path.join(folderPath, file));
          const dimensions = readImageDimensions(buffer, extension) ?? {
            width: 900,
            height: 1100,
          };

          return {
            id: `${folder}-${file}`,
            title: category,
            imageUrl: encodeURI(`/${folder}/${file}`),
            alt: `${category} gallery photo ${index + 1}`,
            caption: "",
            category,
            width: dimensions.width,
            height: dimensions.height,
          };
        }),
      );
    }),
  );

  return itemGroups.flat();
}

function getRemoteFallbackGalleryItems(): GalleryItemData[] {
  return fallbackGalleryItems.map((item) => ({
    ...item,
    width: 900,
    height: 1100,
  }));
}

async function getFallbackGalleryItems() {
  try {
    const localItems = await getLocalGalleryItems(customerGalleryFolders);

    if (localItems.length > 0) {
      return localItems;
    }
  } catch {
    return getRemoteFallbackGalleryItems();
  }

  return getRemoteFallbackGalleryItems();
}

export async function getGalleryItems() {
  const customerItems = await getCustomerGalleryItems();

  try {
    const fixedCakeItems = await getLocalGalleryItems(fixedCakeGalleryFolders);
    return [...customerItems, ...fixedCakeItems];
  } catch {
    return customerItems;
  }
}

export async function getProductGalleryPreview(productType: ProductType, limit = 6) {
  try {
    const items = await getLocalGalleryItems([productGalleryFolders[productType]]);
    return items.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getCustomerGalleryItems() {
  if (!env.hasDatabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return getFallbackGalleryItems();
  }

  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: [{ featured: "desc" }, { title: "asc" }],
    });

    if (items.length === 0) {
      return getFallbackGalleryItems();
    }

    return items
      .sort(
        (first, second) =>
          Number(second.featured) - Number(first.featured) ||
          getTitleSortValue(first.title) - getTitleSortValue(second.title) ||
          first.title.localeCompare(second.title),
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        alt: item.alt,
        caption: item.caption ?? "",
        category: item.category,
        imageUrl: getGalleryPublicUrl(item.storagePath),
        width: 900,
        height: 1100,
      }));
  } catch {
    return getFallbackGalleryItems();
  }
}
