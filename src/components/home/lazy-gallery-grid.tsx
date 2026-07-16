"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type GalleryItem = {
  id: string;
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
};

type LazyGalleryGridProps = {
  items: GalleryItem[];
};

const initialItemCount = 8;
const loadMoreCount = 8;

const noteCards = [
  {
    afterIndex: 5,
    title: "Tiny cakes, huge tail wags",
    body: "Every celebration gets its own little sprinkle of magic.",
    emoji: "🐾",
  },
  {
    afterIndex: 14,
    title: "Made for the goodest guests",
    body: "Soft colours, happy faces, and birthday memories.",
    emoji: "🎂",
  },
  {
    afterIndex: 25,
    title: "Paw-ty moments we love",
    body: "Send us your sweet photos after the big day.",
    emoji: "💛",
  },
] as const;

function getCardClassName(index: number) {
  const pattern = index % 12;

  if (pattern === 0 || pattern === 7) {
    return "sm:col-span-2 sm:row-span-2";
  }

  if (pattern === 4 || pattern === 10) {
    return "xl:row-span-2";
  }

  return "";
}

function getNoteCard(index: number) {
  return noteCards.find((card) => card.afterIndex === index);
}

export function LazyGalleryGrid({ items }: LazyGalleryGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialItemCount);
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hasMore = visibleCount < items.length;

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    let isLoading = false;

    function handleScroll() {
      if (isLoading || window.scrollY < 180) {
        return;
      }

      const distanceFromBottom =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);

      if (distanceFromBottom > 140) {
        return;
      }

      isLoading = true;

      window.setTimeout(() => {
        setVisibleCount((current) =>
          Math.min(current + loadMoreCount, items.length),
        );
        isLoading = false;
      }, 180);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, items.length]);

  return (
    <>
      <div className="mt-10 grid auto-rows-[170px] grid-cols-1 gap-6 sm:grid-cols-2 sm:auto-rows-[150px] xl:grid-cols-4 xl:auto-rows-[165px]">
        {visibleItems.map((item, index) => {
          const noteCard = getNoteCard(index);

          return (
            <Fragment key={`gallery-entry-${item.id}`}>
              <article
                key={item.id}
                className={`gallery-card-reveal relative overflow-hidden rounded-[30px] border-[4px] border-white shadow-[0_14px_30px_rgba(123,68,40,0.12)] ${getCardClassName(index)}`}
                style={{ animationDelay: `${(index % loadMoreCount) * 45}ms` }}
              >
                <div className="relative h-full min-h-[220px] w-full overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              </article>

              {noteCard ? (
                <article
                  key={`note-${noteCard.afterIndex}`}
                  className="gallery-card-reveal relative flex min-h-[220px] overflow-hidden rounded-[30px] border-[4px] border-white bg-[#ffe6f0] p-6 shadow-[0_14px_30px_rgba(123,68,40,0.12)] xl:row-span-1"
                >
                  <div className="absolute -right-5 -top-5 text-7xl opacity-25">
                    {noteCard.emoji}
                  </div>
                  <div className="relative z-10 mt-auto">
                    <p className="font-display text-2xl leading-tight text-[var(--color-cocoa)]">
                      {noteCard.title}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-cocoa)]">
                      {noteCard.body}
                    </p>
                  </div>
                </article>
              ) : null}
            </Fragment>
          );
        })}
      </div>

      {hasMore ? (
        <div className="flex justify-center py-8">
          <span className="rounded-full bg-white/80 px-5 py-3 text-sm font-bold text-[var(--color-cocoa)] shadow-[0_8px_18px_rgba(123,68,40,0.1)]">
            Loading more sweet moments...
          </span>
        </div>
      ) : null}
    </>
  );
}
