"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  badge: string;
  chips: readonly string[];
};

type HeroCarouselProps = {
  slides: readonly HeroSlide[];
};

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];

  function goToSlide(index: number) {
    setCurrentIndex(index);
  }

  function goNext() {
    setCurrentIndex((current) => (current + 1) % slides.length);
  }

  function goPrevious() {
    setCurrentIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  return (
    <section className="container-shell pt-8">
      <div className="relative overflow-hidden rounded-[42px] border-4 border-white/80 bg-white shadow-[0_28px_90px_rgba(255,105,150,0.24)]">
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-center gap-2 bg-[var(--color-butter)] px-4 py-3 text-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--color-ink)]">
          <span className="text-base">🎉</span>
          Order 2–4 days ahead for custom birthday treats
        </div>

        <div className="relative h-[520px] md:h-[620px]">
          <Image
            key={currentSlide.id}
            src={currentSlide.imageUrl}
            alt={currentSlide.imageAlt}
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,251,0.94)_0%,rgba(255,248,251,0.88)_32%,rgba(255,248,251,0.38)_60%,rgba(255,248,251,0.08)_100%)]" />

          <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-8 pt-24 md:px-10 md:pb-10 lg:px-14">
            <div className="max-w-2xl rounded-[34px] bg-white/74 p-6 shadow-[0_20px_70px_rgba(255,105,150,0.16)] backdrop-blur-sm md:p-8">
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--color-cocoa)]">
                {currentSlide.eyebrow}
              </p>
              <h1 className="section-title mt-4 text-4xl leading-[0.98] text-[var(--color-ink)] md:text-6xl">
                {currentSlide.title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-[var(--color-cocoa)] md:text-lg">
                {currentSlide.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {currentSlide.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-[var(--color-mint)] px-4 py-2 text-sm font-bold text-[var(--color-ink)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href="/order"
                  className="rounded-full bg-[var(--color-berry)] px-7 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5"
                >
                  Order now
                </Link>
                <Link
                  href="/gallery"
                  className="rounded-full bg-white px-7 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--color-berry)] shadow-sm transition hover:-translate-y-0.5"
                >
                  See gallery
                </Link>
                <span className="rounded-full bg-[var(--color-butter)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--color-ink)]">
                  {currentSlide.badge}
                </span>
              </div>
            </div>
          </div>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrevious}
                className="absolute left-5 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-berry)] shadow-lg transition hover:scale-105"
                aria-label="Previous slide"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-5 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-berry)] shadow-lg transition hover:scale-105"
                aria-label="Next slide"
              >
                <ChevronRight size={22} />
              </button>
            </>
          ) : null}

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-white/78 px-4 py-2 backdrop-blur-sm">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition ${
                  index === currentIndex
                    ? "w-9 bg-[var(--color-berry)]"
                    : "w-3 bg-[var(--color-peach)]"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
