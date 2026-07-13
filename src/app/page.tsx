import Image from "next/image";
import Link from "next/link";
import {
  Cake,
  Camera,
  ChefHat,
  Gift,
  Heart,
  PawPrint,
  ShieldCheck,
  ShoppingCart,
  Smile,
  Truck,
} from "lucide-react";

import { auth } from "@/auth";
import { MarketingPopup } from "@/components/forms/marketing-popup";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { getGalleryItems } from "@/lib/data";

const heroSlides = [
  {
    id: "happy-cake-main",
    imageUrl: "/home-banner-clean-1.png",
    imageAlt: "Happy's Cake custom pet birthday cake banner",
  },
  {
    id: "happy-cake-pink",
    imageUrl: "/home-banner-clean-2.png",
    imageAlt: "Happy's Cake pink custom pet cake carousel banner",
  },
  {
    id: "happy-cake-mint",
    imageUrl: "/home-banner-clean-3.png",
    imageAlt: "Happy's Cake mint custom pet cake carousel banner",
  },
] as const;

const featureCards = [
  {
    title: "Birthday cakes",
    description: "Make their day extra special",
    icon: PawPrint,
    tone: "bg-[#fff3e2]",
  },
  {
    title: "Grain-free options",
    description: "Gentle & healthy goodness",
    icon: Heart,
    tone: "bg-[#ffe0c5]",
  },
  {
    title: "Custom cakes",
    description: "Designed just for your pet",
    icon: ChefHat,
    tone: "bg-white",
  },
  {
    title: "Add-on treats",
    description: "Cookies, cupcakes & more!",
    icon: Gift,
    tone: "bg-[#ffd6e5]",
  },
  {
    title: "Fast & safe delivery",
    description: "Right to your door",
    icon: Truck,
    tone: "bg-[#d8f2e9]",
  },
] as const;

const productCards: ReadonlyArray<{
  title: string;
  flavor: string;
  price: string;
  badge?: string;
  bg: string;
  imageUrl: string;
  imageAlt: string;
}> = [
  {
    title: "Puppy Party Cake",
    flavor: "Chicken, Carrot & Oat",
    price: "$39.99",
    badge: "Best seller",
    bg: "bg-[#d9f7e9]",
    imageUrl:
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Puppy party cake product card",
  },
  {
    title: "Tail Waggin’ Cake",
    flavor: "Peanut Butter & Banana",
    price: "$36.99",
    bg: "bg-[#ffd3b6]",
    imageUrl:
      "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Tail Waggin cake product card",
  },
  {
    title: "Berry Good Cake",
    flavor: "Blueberry & Yogurt",
    price: "$38.99",
    bg: "bg-[#ffe875]",
    imageUrl:
      "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Berry Good cake product card",
  },
  {
    title: "Gotcha Day Cake",
    flavor: "Pumpkin & Cinnamon",
    price: "$34.99",
    bg: "bg-[#ffd1e4]",
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Gotcha Day cake product card",
  },
] as const;

const galleryCaptions = [
  "So fresh & delicious! ♥",
  "He loved every bite! 😍",
  "Our go-to for every paw-ty! 🐾",
  "The cutest cake ever! ♥",
  "100% approved! 😍",
] as const;

const trustItems = [
  { label: "Made with love", icon: Heart },
  { label: "Pet-Safe Always", icon: PawPrint },
  { label: "Happiness Guaranteed", icon: Smile },
] as const;

export default async function HomePage() {
  const session = await auth();
  const galleryItems = await getGalleryItems();
  const galleryPreview = [...galleryItems, ...galleryItems].slice(0, 5);

  return (
    <div className="bg-[#fffaf1] pb-10">
      <MarketingPopup enabled={!session?.user} />

      <HeroCarousel slides={heroSlides} />

      <section className="container-shell pt-8">
        <div className="grid gap-4 lg:grid-cols-5">
          {featureCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="cute-card min-h-[112px] rounded-[24px] px-6 py-5"
              >
                <div className="flex items-center gap-5">
                  <div className={`flex size-[70px] shrink-0 items-center justify-center rounded-[22px] ${item.tone} text-[var(--color-cocoa)]`}>
                    <Icon size={38} strokeWidth={1.8} />
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
            );
          })}
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
            className="hidden h-14 items-center gap-2 rounded-full bg-[var(--color-berry)] px-8 text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_10px_20px_rgba(255,92,152,0.25)] md:flex"
          >
            View all cakes <PawPrint size={17} />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {productCards.map((item) => (
            <article
              key={item.title}
              className="cute-card relative overflow-hidden rounded-[28px] p-3"
            >
              {item.badge ? (
                <div className="absolute left-3 top-3 z-20 rounded-full bg-[var(--color-berry)] px-4 py-3 text-center text-xs font-black uppercase leading-tight text-white">
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
                <p className="mt-1 text-sm text-[var(--color-cocoa)]">{item.flavor}</p>
                <p className="mt-3 text-2xl font-black text-[var(--color-berry)]">
                  {item.price}
                </p>
                <Link
                  href="/order"
                  className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--color-berry)] px-8 text-sm font-black uppercase text-white shadow-[0_8px_16px_rgba(255,92,152,0.24)]"
                >
                  <ShoppingCart size={17} />
                  Add to cart
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell pt-8">
        <div className="rounded-[28px] bg-[#fff5e7] px-6 py-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="section-title text-[2rem] font-black text-[var(--color-cocoa)] md:text-[2.4rem]">
              Happy Pets, Happier Parents <span className="text-[var(--color-berry)]">♥</span>
            </h2>
            <Link
              href="/gallery"
              className="hidden h-12 items-center gap-2 rounded-full bg-[var(--color-mint)] px-7 text-sm font-black uppercase tracking-[0.04em] text-[var(--color-cocoa)] shadow-[0_8px_16px_rgba(103,166,148,0.16)] md:flex"
            >
              See more photos <Camera size={17} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {galleryPreview.map((item, index) => (
              <article
                key={`${item.id}-${index}`}
                className="relative overflow-hidden rounded-[22px] border-4 border-white bg-white shadow-[0_8px_18px_rgba(123,68,40,0.1)]"
              >
                <div className="relative aspect-[1.08]">
                  <Image
                    src={item.imageUrl}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 220px, (min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-3 left-3 rounded-[18px] bg-white/94 px-4 py-3 text-xs font-medium leading-4 text-[var(--color-cocoa)] shadow-[0_6px_14px_rgba(123,68,40,0.1)]">
                  {galleryCaptions[index] ?? "Party-ready treats!"}
                </div>
              </article>
            ))}
          </div>
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
            <div className="flex items-center gap-5">
              <div className="relative h-28 w-28 shrink-0">
                <Image
                  src="/logov1-cropped.png"
                  alt="Happy's Cake logo"
                  fill
                  sizes="112px"
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="section-title text-[2rem] font-black leading-tight text-[var(--color-cocoa)]">
                  Let’s Bake Some Happiness!
                </h2>
                <p className="mt-2 text-base leading-6 text-[var(--color-cocoa)]">
                  Join our pack &amp; get <span className="font-black text-[var(--color-berry)]">10% OFF</span> your first order!
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
