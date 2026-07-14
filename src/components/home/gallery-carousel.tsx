import Image from "next/image";
import Link from "next/link";

type GalleryCarouselItem = {
  id: string;
  imageUrl: string;
  alt: string;
};

type GalleryCarouselProps = {
  items: GalleryCarouselItem[];
  captions: readonly string[];
};

export function GalleryCarousel({ items, captions }: GalleryCarouselProps) {
  const carouselItems = [...items, ...items];

  return (
    <div className="gallery-carousel-mask">
      <div className="gallery-carousel-track">
        {carouselItems.map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            href="/gallery"
            className="gallery-carousel-card group"
            aria-label="View gallery photos"
          >
            <div className="relative aspect-[1.08] overflow-hidden rounded-[22px]">
              <Image
                src={item.imageUrl}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 230px, (min-width: 768px) 33vw, 76vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute bottom-3 left-3 max-w-[78%] rounded-[18px] bg-white/94 px-4 py-3 text-xs font-bold leading-4 text-[var(--color-cocoa)] shadow-[0_6px_14px_rgba(123,68,40,0.1)]">
              {captions[index % captions.length] ?? "Party-ready treats!"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
