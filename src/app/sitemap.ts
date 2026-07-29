import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/order/head-cupcake", changeFrequency: "weekly", priority: 0.9 },
  { path: "/order/head-cake", changeFrequency: "weekly", priority: 0.9 },
  { path: "/order/full-body-cake", changeFrequency: "weekly", priority: 0.9 },
  { path: "/order/themed-cookie", changeFrequency: "weekly", priority: 0.85 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/pickup-information", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
