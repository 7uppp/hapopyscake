import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Heart,
  PawPrint,
  Smile,
} from "lucide-react";

import { auth } from "@/auth";
import { MarketingPopup } from "@/components/forms/marketing-popup";
import { GalleryCarousel } from "@/components/home/gallery-carousel";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { getCustomerGalleryItems } from "@/lib/data";

const heroSlides = [
  {
    id: "happy-cake-main",
    imageUrl: "/Banner/home-banner.png",
    imageAlt: "Happy's Cake custom pet birthday cake banner",
  },
  {
    id: "happy-cake-banner-1",
    imageUrl: "/Banner/1.jpg",
    imageAlt: "Happy's Cake pet cake banner 1",
  },
  {
    id: "happy-cake-banner-2",
    imageUrl: "/Banner/2.jpg",
    imageAlt: "Happy's Cake pet cake banner 2",
  },
  {
    id: "happy-cake-banner-3",
    imageUrl: "/Banner/3.jpg",
    imageAlt: "Happy's Cake pet cake banner 3",
  },
  {
    id: "happy-cake-banner-4",
    imageUrl: "/Banner/4.jpg",
    imageAlt: "Happy's Cake pet cake banner 4",
  },
  {
    id: "happy-cake-banner-5",
    imageUrl: "/Banner/5.jpg",
    imageAlt: "Happy's Cake pet cake banner 5",
  },
  {
    id: "happy-cake-banner-6",
    imageUrl: "/Banner/6.jpg",
    imageAlt: "Happy's Cake pet cake banner 6",
  },
] as const;

const featureCards = [
  {
    title: "Custom designed",
    description: "For your furbabies",
    iconUrl: "/custom-color.png",
    iconAlt: "Custom designed icon",
  },
  {
    title: "Meat & veggie base",
    description: "100% meat & veggie recipes",
    iconUrl: "/base-color.png",
    iconAlt: "Meat and veggie base icon",
  },
  {
    title: "Human-grade",
    description: "Gluten-free, no preservatives, no artificial colors",
    iconUrl: "/guard-color.png",
    iconAlt: "Human-grade ingredients icon",
  },
  {
    title: "Order ahead",
    description: "Order at least 7 days in advance",
    iconUrl: "/time-color.png",
    iconAlt: "Order ahead icon",
  },
] as const;

const productCards: ReadonlyArray<{
  title: string;
  price: string;
  badge?: string;
  bg: string;
  imageUrl: string;
  imageAlt: string;
}> = [
  {
    title: "3D head cupcake",
    price: "From $49",
    bg: "bg-[#d9f7e9]",
    imageUrl: "/3d-head-cupCake.jpg",
    imageAlt: "3D head cupcake product card",
  },
  {
    title: "3D head cake",
    price: "From $84",
    bg: "bg-[#ffd3b6]",
    imageUrl: "/3d-head.jpg?v=20260717-1",
    imageAlt: "3D head cake product card",
  },
  {
    title: "3D full body cake",
    price: "From $69",
    badge: "Best seller",
    bg: "bg-[#ffe875]",
    imageUrl: "/3d-full-body.jpg?v=20260717-1",
    imageAlt: "3D full body cake product card",
  },
  {
    title: "themed Cookie",
    price: "From $49",
    bg: "bg-[#ffd1e4]",
    imageUrl: "/cookies.jpg",
    imageAlt: "themed Cookie product card",
  },
] as const;

const trustItems = [
  { label: "Made with love", icon: Heart },
  { label: "Pet-Safe Always", icon: PawPrint },
  { label: "Happiness Guaranteed", icon: Smile },
] as const;

export default async function HomePage() {
  const session = await auth();
  const galleryPreview = await getCustomerGalleryItems();

  return (
    <div className="bg-[var(--color-cream)] pb-10">
      <MarketingPopup enabled={!session?.user} />

      <HeroCarousel slides={heroSlides} />

      <section className="container-shell pt-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((item) => (
              <article
                key={item.title}
                className="cute-card min-h-[112px] rounded-[24px] px-6 py-5"
              >
                <div className="flex items-center gap-5">
                  <div className="relative flex size-[104px] shrink-0 items-center justify-center">
                    <Image
                      src={item.iconUrl}
                      alt={item.iconAlt}
                      width={100}
                      height={100}
                      className="size-[100px] object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-black uppercase leading-tight text-[var(--color-cocoa)]">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-[var(--color-cocoa)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
          ))}
        </div>
      </section>

      <section className="container-shell relative pt-12">
        <div className="absolute left-5 top-9 text-5xl text-[var(--color-berry)]">♥</div>
        <div className="absolute left-16 top-2 text-4xl text-[var(--color-berry)]">♥</div>
        <div className="absolute right-0 top-14 text-2xl text-[#ffcc3f]">✦</div>

        <div className="mb-7 flex items-center justify-center md:justify-between">
          <h2 className="section-title text-center text-[2.8rem] font-black text-[var(--color-cocoa)] md:text-[3.4rem]">
            Our Paw-some Cake Collection
          </h2>
          <Link
            href="/order"
            className="nav-candy-button nav-candy-button-active hidden h-14 items-center gap-2 px-8 text-sm font-black uppercase tracking-[0.04em] md:flex"
          >
            View all <PawPrint size={17} />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {productCards.map((item) => (
            <article
              key={item.title}
              className="cute-card relative overflow-hidden rounded-[28px] p-3"
            >
              {item.badge ? (
                <div className="absolute left-3 top-3 z-20 rounded-50 bg-[var(--color-berry)] px-4 py-3 text-center text-xs font-black uppercase leading-tight text-white">
                  Best<br />seller
                </div>
              ) : null}

              <div className={`relative aspect-[1.02] overflow-hidden rounded-[22px] ${item.bg}`}>
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 280px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="px-3 pb-4 pt-4 text-center">
                <h3 className="section-title text-2xl font-black text-[var(--color-cocoa)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-2xl font-black text-[var(--color-berry)]">
                  {item.price}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell pt-8">
        <div className="rounded-[28px] bg-[#fff5e7] px-6 py-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="section-title text-[2rem] font-black text-[var(--color-cocoa)] md:text-[2.4rem]">
              Happy Paws, Happier Parents <span className="text-[var(--color-berry)]">♥</span>
            </h2>
            <Link
              href="/gallery"
              className="hidden h-12 items-center gap-2 rounded-full bg-[var(--color-mint)] px-7 text-sm font-black uppercase tracking-[0.04em] text-[var(--color-cocoa)] shadow-[0_8px_16px_rgba(103,166,148,0.16)] md:flex"
            >
              See more photos <Camera size={17} />
            </Link>
          </div>

          <GalleryCarousel items={galleryPreview} />
        </div>
      </section>

      <section className="container-shell pt-9">
        <div className="relative overflow-hidden rounded-[28px] bg-[#ffdce9] px-8 py-7">
          <div className="absolute inset-x-0 bottom-[-22px] flex">
            {Array.from({ length: 18 }).map((_, index) => (
              <div key={index} className="-mx-1 size-12 rounded-full bg-[#ffc7dc]" />
            ))}
          </div>

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.05fr_1.35fr_1fr] lg:items-center">
            <div className="flex items-center gap-3">
              <div className="relative h-28 w-32 shrink-0 overflow-visible md:h-32 md:w-36">
                <Image
                  src="/mascot.png"
                  alt="Happy's Cake baking puppy mascot"
                  fill
                  sizes="(max-width: 768px) 144px, 160px"
                  className="object-contain"
                />
              </div>
              <div className="min-w-[190px]">
                <h2 className="section-title text-[1.35rem] font-black leading-[1.08] text-[var(--color-cocoa)] md:text-[1.52rem]">
                  <span className="whitespace-nowrap">Let’s Bake Some</span>
                  <br />
                  Happiness!
                </h2>
                <p className="mt-2 max-w-[260px] text-sm leading-5 text-[var(--color-cocoa)]">
                  Join our pack for new treats, cute gallery updates, and birthday reminders.
                </p>
              </div>
            </div>

            <form className="space-y-2">
              <div className="flex rounded-full bg-white p-1.5 shadow-[0_8px_16px_rgba(123,68,40,0.08)]">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="min-h-12 flex-1 rounded-full bg-transparent px-6 text-sm text-[var(--color-cocoa)] outline-none placeholder:text-[var(--color-cocoa)]/55"
                />
                <button
                  type="button"
                  className="rounded-full bg-[var(--color-berry)] px-9 text-sm font-black uppercase tracking-[0.04em] text-white"
                >
                  Join the pack
                </button>
              </div>
              <p className="text-center text-sm text-[var(--color-cocoa)]">
                No spam, only treats &amp; tail wags! <span className="text-[var(--color-berry)]">♥</span>
              </p>
            </form>

            <div className="grid grid-cols-3 gap-4">
              {trustItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white text-[var(--color-berry)] shadow-[0_8px_16px_rgba(123,68,40,0.08)]">
                      <Icon size={30} />
                    </div>
                    <p className="mt-2 text-sm font-medium leading-4 text-[var(--color-cocoa)]">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
