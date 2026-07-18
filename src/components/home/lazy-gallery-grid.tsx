"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

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

export function LazyGalleryGrid({ items }: LazyGalleryGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialItemCount);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hasMore = visibleCount < items.length;

  function loadMoreItems() {
    setVisibleCount((current) => Math.min(current + loadMoreCount, items.length));
  }

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!hasMore || !loadMoreElement) {
      return;
    }

    function shouldLoadMore() {
      const marker = loadMoreRef.current;

      if (!marker) {
        return false;
      }

      return marker.getBoundingClientRect().top <= window.innerHeight + 320;
    }

    function handleScroll() {
      if (shouldLoadMore()) {
        loadMoreItems();
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        loadMoreItems();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(loadMoreElement);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.requestAnimationFrame(handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, items.length, visibleCount]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedItem]);

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItem(item)}
            className="gallery-card-reveal relative aspect-[4/3] overflow-hidden rounded-[30px] border-[4px] border-white shadow-[0_14px_30px_rgba(123,68,40,0.12)]"
            style={{ animationDelay: `${(index % loadMoreCount) * 45}ms` }}
            aria-label={`View larger ${item.alt}`}
          >
            <Image
              src={item.imageUrl}
              alt={item.alt}
              fill
              sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {hasMore ? (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <button
            type="button"
            onClick={loadMoreItems}
            className="rounded-full bg-white/80 px-5 py-3 text-sm font-bold text-[var(--color-cocoa)] shadow-[0_8px_18px_rgba(123,68,40,0.1)] transition hover:-translate-y-0.5"
          >
            Load more sweet moments
          </button>
        </div>
      ) : null}

      {selectedItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(46,36,29,0.82)] px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
          onClick={() => setSelectedItem(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="absolute right-4 top-4 z-10 flex size-12 items-center justify-center rounded-full bg-white text-[var(--color-cocoa)] shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition hover:scale-105"
            aria-label="Close image preview"
          >
            <X size={24} />
          </button>

          <div
            className="relative h-[86vh] w-full max-w-6xl overflow-hidden rounded-[28px] border-[5px] border-white bg-white shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedItem.imageUrl}
              alt={selectedItem.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
