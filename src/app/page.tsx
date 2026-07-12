import Image from "next/image";
import Link from "next/link";
import {
  CakeSlice,
  Camera,
  HeartHandshake,
  PawPrint,
  Palette,
  Sparkles,
  Upload,
} from "lucide-react";

import { auth } from "@/auth";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { MarketingPopup } from "@/components/forms/marketing-popup";
import { getGalleryItems } from "@/lib/data";
import { productCatalog } from "@/lib/products";
import { siteConfig } from "@/lib/site";

const iconMap = [CakeSlice, PawPrint, Camera, HeartHandshake];
const howItWorks = [
  {
    title: "Upload your pet photos",
    description: "Send clear front and side photos so the cake details feel extra personal.",
    icon: Upload,
    accent: "bg-[var(--color-blush)]",
  },
  {
    title: "Choose flavour and colours",
    description: "Pick the protein, palette, name, age, and any extra styling touches.",
    icon: Palette,
    accent: "bg-[var(--color-mint)]",
  },
  {
    title: "We make party magic",
    description: "Checkout securely, then we prepare the cake for your celebration date.",
    icon: Sparkles,
    accent: "bg-[var(--color-butter)]",
  },
] as const;

const heroSlides = [
  {
    id: "slide-cupcake",
    eyebrow: "Custom pet birthday treats",
    title: "Cute cakes that look like your fur baby and totally steal the party photos.",
    description:
      "Bright colours, pet-safe recipes, and handcrafted details made for birthdays, cake smashes, and sweet celebration moments.",
    imageUrl:
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Happy dog close to the camera for a playful homepage banner",
    badge: "From $49 AUD",
    chips: ["Photo-friendly", "Pastel cute", "Made to order"],
  },
  {
    id: "slide-head-cake",
    eyebrow: "3D head cakes",
    title: "Single-head and double-head cakes with playful colours and birthday personality.",
    description:
      "Choose your pet's flavour, upload reference photos, and we shape the design around their markings, colours, and celebration vibe.",
    imageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "A smiling dog used as a cheerful custom cake brand banner",
    badge: "Best seller",
    chips: ["Name plaque", "Age topper", "Custom palette"],
  },
  {
    id: "slide-cookie",
    eyebrow: "Party-ready cookie sets",
    title: "Themed cookies and bright add-ons that make the table feel extra festive.",
    description:
      "Perfect for matching party colours, gifting, and building a full celebration spread around your pet's big day.",
    imageUrl:
      "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Playful puppy sitting on a couch for a cute pet bakery hero slide",
    badge: "Theme it your way",
    chips: ["Cookie set", "Add-ons", "Cute styling"],
  },
] as const;
const productHighlights = [
  { price: "From $49", accent: "bg-[var(--color-blush)]" },
  { price: "From $84", accent: "bg-[var(--color-butter)]" },
  { price: "From $69", accent: "bg-[var(--color-mint)]" },
  { price: "$49 set", accent: "bg-[var(--color-peach)]" },
] as const;

export default async function HomePage() {
  const session = await auth();
  const galleryItems = await getGalleryItems();

  return (
    <div className="pb-16">
      <MarketingPopup enabled={!session?.user} />

      <HeroCarousel slides={[...heroSlides]} />

      <section className="container-shell py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {howItWorks.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[34px] border-2 border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(255,95,149,0.1)]"
              >
                <div className={`flex size-14 items-center justify-center rounded-[22px] ${item.accent} text-[var(--color-ink)]`}>
                  <Icon size={24} />
                </div>
                <h2 className="section-title mt-5 text-2xl text-[var(--color-ink)]">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-cocoa)]">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container-shell grid gap-10 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--color-berry)] shadow-sm">
            <span className="size-2 rounded-full bg-[var(--color-berry)]" />
            Cute, custom, and party ready
          </div>
          <div className="space-y-5">
            <h1 className="section-title max-w-3xl text-5xl leading-[1.05] text-[var(--color-ink)] md:text-7xl">
              A brighter, sweeter home for your pet birthday orders.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--color-cocoa)]">
              We now lean into a more playful bakery feel: stronger candy colours,
              bolder buttons, more visual energy, and a homepage that feels more
              like a pet celebration brand.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/order"
              className="rounded-full bg-[var(--color-berry)] px-6 py-3 font-extrabold uppercase tracking-[0.12em] text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5"
            >
              Start an order
            </Link>
            <Link
              href="/gallery"
              className="rounded-full bg-[var(--color-butter)] px-6 py-3 font-extrabold uppercase tracking-[0.12em] text-[var(--color-ink)] transition hover:-translate-y-0.5"
            >
              See the gallery
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {siteConfig.heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[28px] border-2 border-white/80 bg-white/88 p-5 shadow-[0_16px_40px_rgba(255,95,149,0.08)]"
              >
                <p className="font-display text-3xl text-[var(--color-berry)]">
                  {item.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-cocoa)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sprinkle-grid rounded-[40px] border-2 border-white/80 bg-white/92 p-6 shadow-[0_22px_60px_rgba(255,95,149,0.12)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--color-cocoa)]">
                Signature treats
              </p>
              <h2 className="section-title mt-2 text-3xl text-[var(--color-ink)]">
                Four cute product lines
              </h2>
            </div>
            <span className="rounded-full bg-[var(--color-butter)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-ink)]">
              AUD pricing
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {productCatalog.map((product, index) => {
              const Icon = iconMap[index];
              const highlight = productHighlights[index];

              return (
                <div
                  key={product.type}
                  className="rounded-[28px] border border-white/90 bg-white/92 p-5 shadow-sm"
                >
                  <div className={`flex size-12 items-center justify-center rounded-2xl ${highlight.accent} text-[var(--color-ink)]`}>
                    <Icon size={22} />
                  </div>
                  <div className="mt-4 inline-flex rounded-full bg-[var(--color-cream)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-berry)]">
                    {highlight.price}
                  </div>
                  <h2 className="mt-4 font-display text-2xl text-[var(--color-ink)]">
                    {product.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-cocoa)]">
                    {product.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-shell mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
              Buyer gallery
            </p>
            <h2 className="section-title mt-2 text-4xl text-[var(--color-ink)]">
              Real party photos from happy customers
            </h2>
          </div>
          <Link
            href="/gallery"
            className="rounded-full bg-[var(--color-berry)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white"
          >
            View all
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {galleryItems.slice(0, 4).map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[32px] border-2 border-white/80 bg-white/92 shadow-[0_18px_55px_rgba(255,95,149,0.1)]"
            >
              <Image
                src={item.imageUrl}
                alt={item.alt}
                width={900}
                height={720}
                className="h-72 w-full object-cover"
              />
              <div className="space-y-2 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-cocoa)]">
                  {item.category}
                </p>
                <h3 className="font-display text-2xl text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-[var(--color-cocoa)]">
                  {item.caption}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
