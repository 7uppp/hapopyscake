import type { MetadataRoute } from "next";

const routes = [
  "",
  "/order",
  "/gallery",
  "/contact",
  "/login",
  "/register",
  "/faq",
  "/privacy-policy",
  "/terms",
  "/refund-policy",
  "/pickup-information",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
