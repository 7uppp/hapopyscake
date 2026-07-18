import type { Metadata } from "next";

import { LazyGalleryGrid } from "@/components/home/lazy-gallery-grid";
import { getGalleryItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse customer photos and pet birthday cake inspiration.",
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Gallery
        </p>
        <h1 className="section-title mt-3 text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
          Happy Paws Gallery
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)]">
          Sweet moments from our furry customers and their custom birthday cakes.
        </p>
      </div>

      <LazyGalleryGrid items={items} />
    </div>
  );
}
