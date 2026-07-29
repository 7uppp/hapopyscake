import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://happyscake.com"
).replace(/\/$/, "");

export const defaultOgImage = "/Banner/home-banner.png";

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return new URL(path, siteUrl).toString();
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

type SeoMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
};

export function buildSeoMetadata({
  title,
  description,
  path,
  image = defaultOgImage,
  noIndex = false,
}: SeoMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      siteName: siteConfig.name,
      url: path,
      locale: "en_AU",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  };
}
