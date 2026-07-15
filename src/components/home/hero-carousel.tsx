"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type HeroSlide = {
  id: string;
  imageUrl: string;
  imageAlt: string;
};

type HeroCarouselProps = {
  slides: readonly HeroSlide[];
};

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex] ?? slides[0];
  const isMainBanner = currentSlide?.id === "happy-cake-main";

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  function previousSlide() {
    setCurrentIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function nextSlide() {
    setCurrentIndex((current) => (current + 1) % slides.length);
  }

  return (
    <section className="container-shell pt-14">
      <div className="relative aspect-[984/480] overflow-hidden rounded-[44px] bg-[#ffe680] shadow-[0_16px_30px_rgba(123,68,40,0.12)]">
        <Image
          key={currentSlide?.id}
          src={currentSlide?.imageUrl ?? "/Banner/home-banner.png"}
          alt={currentSlide?.imageAlt ?? "Happy's Cake birthday cake banner"}
          fill
          preload
          unoptimized
          sizes="min(1240px, calc(100vw - 2rem))"
          className={`object-cover ${isMainBanner ? "scale-[1.035]" : ""}`}
        />

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous banner"
              className="absolute left-[2.1%] top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-cocoa)] shadow-[0_8px_18px_rgba(123,68,40,0.18)] transition hover:scale-105"
            >
              <ChevronLeft size={25} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next banner"
              className="absolute right-[2.1%] top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-cocoa)] shadow-[0_8px_18px_rgba(123,68,40,0.18)] transition hover:scale-105"
            >
              <ChevronRight size={25} />
            </button>
          </>
        ) : null}

        <Link
          href="/order"
          aria-label="Shop cakes"
          className="absolute left-[5%] top-[62%] h-[10%] w-[18%] rounded-full"
        />
        <Link
          href="/order"
          aria-label="Custom order"
          className="absolute left-[24%] top-[62%] h-[10%] w-[18%] rounded-full"
        />

        <div className="absolute bottom-[2.8%] left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-white/75 px-3 py-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show banner ${index + 1}`}
              className={`h-3 rounded-full transition ${
                currentIndex === index ? "w-8 bg-[var(--color-berry)]" : "w-3 bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
