import Image from "next/image";
import type { Metadata } from "next";

import { getGalleryItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse customer photos and pet birthday cake inspiration.",
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="container-shell py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Gallery
        </p>
        <h1 className="section-title mt-3 text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
          Happy Pets Gallery
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)] lg:whitespace-nowrap">
          Sweet moments from our furry customers and their custom birthday cakes.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="glass-card overflow-hidden rounded-[32px] border border-white/60"
          >
            <Image
              src={item.imageUrl}
              alt={item.alt}
              width={900}
              height={960}
              className="h-80 w-full object-cover"
            />
            <div className="space-y-2 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-cocoa)]">
                {item.category}
              </p>
              <h2 className="font-display text-2xl text-[var(--color-ink)]">
                {item.title}
              </h2>
              <p className="text-sm leading-6 text-[var(--color-cocoa)]">
                {item.caption}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
