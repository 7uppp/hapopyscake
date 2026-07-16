import fs from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";

import { LazyGalleryGrid } from "@/components/home/lazy-gallery-grid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse customer photos and pet birthday cake inspiration.",
};

type GalleryItem = {
  id: string;
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
};

const galleryFolders = [
  { folder: "Happy paws", category: "Happy Paws" },
  { folder: "cakes", category: "Custom Cakes" },
] as const;

function getNumericSortValue(fileName: string) {
  const value = Number.parseInt(fileName.replace(/\D/g, ""), 10);
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

async function getLocalGalleryItems(): Promise<GalleryItem[]> {
  const itemGroups = await Promise.all(
    galleryFolders.map(async ({ folder, category }) => {
      const folderPath = path.join(process.cwd(), "public", folder);
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
            imageUrl: encodeURI(`/${folder}/${file}`),
            alt: `${category} gallery photo ${index + 1}`,
            width: dimensions.width,
            height: dimensions.height,
          };
        }),
      );
    }),
  );

  return itemGroups.flat();
}

export default async function GalleryPage() {
  const items = await getLocalGalleryItems();

  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Gallery
        </p>
        <h1 className="section-title mt-3 text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
          Happy Pets Gallery
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)]">
          Sweet moments from our furry customers and their custom birthday cakes.
        </p>
      </div>

      <LazyGalleryGrid items={items} />
    </div>
  );
}
