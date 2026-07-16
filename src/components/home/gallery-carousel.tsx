import Image from "next/image";
import Link from "next/link";

type GalleryCarouselItem = {
  id: string;
  imageUrl: string;
  alt: string;
};

type GalleryCarouselProps = {
  items: GalleryCarouselItem[];
};

export function GalleryCarousel({ items }: GalleryCarouselProps) {
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
          </Link>
        ))}
      </div>
    </div>
  );
}
