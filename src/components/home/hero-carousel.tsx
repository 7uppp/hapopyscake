import Image from "next/image";
import Link from "next/link";

type HeroBannerProps = {
  imageUrl: string;
  imageAlt: string;
};

export function HeroCarousel({ imageUrl, imageAlt }: HeroBannerProps) {
  return (
    <section className="container-shell pt-4 md:pt-14">
      <div className="relative aspect-[984/480] overflow-hidden rounded-[44px] bg-[#ffe680] shadow-[0_16px_30px_rgba(123,68,40,0.12)]">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          preload
          unoptimized
          sizes="min(1240px, calc(100vw - 2rem))"
          className="object-cover scale-[1.035]"
        />

        <Link
          href="/order/head-cake"
          aria-label="Shop cakes"
          className="absolute left-[5%] top-[62%] h-[10%] w-[18%] rounded-full"
        />
        <Link
          href="/order/head-cake"
          aria-label="Custom order"
          className="absolute left-[24%] top-[62%] h-[10%] w-[18%] rounded-full"
        />
      </div>
    </section>
  );
}
