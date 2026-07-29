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
import { NewsletterSignupForm } from "@/components/forms/newsletter-signup-form";
import { GalleryCarousel } from "@/components/home/gallery-carousel";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { getCustomerGalleryItems } from "@/lib/data";
import {
  absoluteUrl,
  defaultOgImage,
  serializeJsonLd,
  siteUrl,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

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
  href: string;
}> = [
  {
    title: "3D head cupcake",
    price: "From $49",
    bg: "bg-[#d9f7e9]",
    imageUrl: "/3d-head-cupCake.jpg",
    imageAlt: "3D head cupcake product card",
    href: "/order/head-cupcake",
  },
  {
    title: "3D head cake",
    price: "From $84",
    bg: "bg-[#ffd3b6]",
    imageUrl: "/cakes/3D%20head/T49.jpg",
    imageAlt: "3D head cake product card",
    href: "/order/head-cake",
  },
  {
    title: "3D full body cake",
    price: "From $69",
    badge: "Best seller",
    bg: "bg-[#ffe875]",
    imageUrl: "/3d-full-body.jpg?v=20260717-1",
    imageAlt: "3D full body cake product card",
    href: "/order/full-body-cake",
  },
  {
    title: "Cookies",
    price: "From $49",
    bg: "bg-[#ffd1e4]",
    imageUrl: "/cookies.jpg",
    imageAlt: "Cookies product card",
    href: "/order/themed-cookie",
  },
] as const;

const trustItems = [
  { label: "Made with love", icon: Heart },
  { label: "Pet-Safe Always", icon: PawPrint },
  { label: "Happiness Guaranteed", icon: Smile },
] as const;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: siteConfig.name,
  url: siteUrl,
  image: absoluteUrl(defaultOgImage),
  description: siteConfig.description,
  email: siteConfig.contactEmail,
  telephone: siteConfig.phoneInternational,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "18 Park Close",
    addressLocality: "Hillcrest",
    addressRegion: "QLD",
    postalCode: "4118",
    addressCountry: "AU",
  },
  areaServed: [
    {
      "@type": "City",
      name: "Brisbane",
    },
    {
      "@type": "AdministrativeArea",
      name: "Queensland",
    },
  ],
  sameAs: siteConfig.socials.map((social) => social.href),
};

export default async function HomePage() {
  const session = await auth();
  const galleryPreview = await getCustomerGalleryItems();

  return (
    <div className="bg-[var(--color-cream)] pb-2 md:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(localBusinessJsonLd),
        }}
      />
      <MarketingPopup enabled={!session?.user} />

      <HeroCarousel
        imageUrl="/Banner/home-banner.png"
        imageAlt="Happy's Cake custom pet birthday cake banner"
      />

      <section className="container-shell pt-8">
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {featureCards.map((item) => (
              <article
                key={item.title}
                className="cute-card min-h-[92px] rounded-[18px] px-1.5 py-3 md:min-h-[112px] md:rounded-[24px] md:px-6 md:py-5"
              >
                <div className="flex flex-col items-center gap-1.5 text-center md:flex-row md:gap-5 md:text-left">
                  <div className="relative flex size-[44px] shrink-0 items-center justify-center sm:size-[58px] md:size-[104px]">
                    <Image
                      src={item.iconUrl}
                      alt={item.iconAlt}
                      width={100}
                      height={100}
                      className="size-[42px] object-contain sm:size-[56px] md:size-[100px]"
                    />
                  </div>
                  <div>
                    <h2 className="text-[0.56rem] font-black uppercase leading-tight text-[var(--color-cocoa)] sm:text-[0.68rem] md:text-base">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-[0.55rem] leading-3 text-[var(--color-cocoa)] sm:text-[0.65rem] sm:leading-4 md:text-sm md:leading-5">
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

        <div className="mb-7 flex items-center justify-center">
          <h2 className="section-title text-center text-[2.05rem] font-black leading-tight text-[var(--color-cocoa)] sm:text-[2.5rem] md:text-[3.4rem]">
            Our Paw-some Cake Collection
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {productCards.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="cute-card group relative block overflow-hidden rounded-[22px] p-2 transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[var(--color-berry)]/30 md:rounded-[28px] md:p-3"
              aria-label={`Order ${item.title}`}
            >
              {item.badge ? (
                <div className="absolute left-0 top-0 z-20 rounded-br-[18px] bg-[var(--color-berry)] px-3 py-2 text-center text-[0.55rem] font-black uppercase leading-none text-white shadow-sm md:rounded-br-[22px] md:px-4 md:py-3 md:text-xs md:leading-tight">
                  <span className="md:hidden">Best seller</span>
                  <span className="hidden md:inline">Best<br />seller</span>
                </div>
              ) : null}

              <div className={`relative aspect-[1.02] overflow-hidden rounded-[18px] md:rounded-[22px] ${item.bg}`}>
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 280px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="px-1 pb-3 pt-3 text-center md:px-3 md:pb-4 md:pt-4">
                <h3 className="section-title text-base font-black text-[var(--color-cocoa)] sm:text-lg md:text-2xl">
                  {item.title}
                </h3>
                <p className="price-text mt-2 text-lg text-[var(--color-berry)] md:mt-3 md:text-2xl">
                  {item.price}
                </p>
              </div>
            </Link>
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

      <section className="container-shell hidden pt-9 md:block">
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

            <NewsletterSignupForm />

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
