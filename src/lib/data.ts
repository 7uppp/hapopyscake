import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { fallbackGalleryItems } from "@/lib/site";
import { getGalleryPublicUrl } from "@/lib/supabase";

export async function getGalleryItems() {
  if (!env.hasDatabase) {
    return fallbackGalleryItems;
  }

  const items = await prisma.galleryItem.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  if (items.length === 0) {
    return fallbackGalleryItems;
  }

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    alt: item.alt,
    caption: item.caption ?? "",
    category: item.category,
    imageUrl: getGalleryPublicUrl(item.storagePath),
  }));
}
