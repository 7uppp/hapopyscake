import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { OrderForm } from "@/components/forms/order-form";
import { getProductGalleryPreview } from "@/lib/data";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { productCatalog } from "@/lib/products";
import {
  absoluteUrl,
  buildSeoMetadata,
  serializeJsonLd,
  siteUrl,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type ProductOrderPageProps = {
  params: Promise<{
    product: string;
  }>;
};

const productSeo: Record<
  (typeof productCatalog)[number]["slug"],
  {
    description: string;
    image: string;
    price: string;
  }
> = {
  "head-cupcake": {
    description:
      "Reserve a custom 3D head cupcake for dogs or cats, handmade in Brisbane with human-grade pet-safe ingredients.",
    image: "/3d-head-cupCake.jpg",
    price: "49.00",
  },
  "head-cake": {
    description:
      "Reserve a custom 3D head cake sculpted to resemble your pet, with your chosen flavour, colours, and pickup time.",
    image: "/cakes/3D%20head/T49.jpg",
    price: "84.00",
  },
  "full-body-cake": {
    description:
      "Reserve a custom 3D full body pet cake with pose details, reference photos, and pet-safe ingredients.",
    image: "/3d-full-body.jpg",
    price: "69.00",
  },
  "themed-cookie": {
    description:
      "Order birthday cookie sets or personalised name cookies for dogs and cats, handmade with goat milk icing.",
    image: "/cookies.jpg",
    price: "49.00",
  },
};

function getProductBySlug(slug: string) {
  return productCatalog.find((product) => product.slug === slug);
}

async function getFirstOrderCookieEligibility(userId: string | undefined) {
  if (!userId || !env.hasDatabase) {
    return false;
  }

  const paidOrderCount = await prisma.order.count({
    where: {
      userId,
      status: "PAID",
    },
  });

  return paidOrderCount === 0;
}

export function generateStaticParams() {
  return productCatalog.map((product) => ({
    product: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductOrderPageProps): Promise<Metadata> {
  const { product: productSlug } = await params;
  const product = getProductBySlug(productSlug);

  if (!product) {
    return buildSeoMetadata({
      title: "Order",
      description: "Reserve a custom Happy's Cake pet birthday treat.",
      path: "/order/head-cake",
    });
  }

  const seo = productSeo[product.slug];

  return buildSeoMetadata({
    title: `${product.title} Brisbane`,
    description: seo.description,
    path: `/order/${product.slug}`,
    image: seo.image,
  });
}

export default async function ProductOrderPage({ params }: ProductOrderPageProps) {
  const { product: productSlug } = await params;
  const product = getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  const session = await auth();
  const firstOrderCookieEligible = await getFirstOrderCookieEligibility(
    session?.user?.id,
  );
  const productPreviewImages = await getProductGalleryPreview(product.type, 6);
  const seo = productSeo[product.slug];
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: seo.description,
    image: absoluteUrl(seo.image),
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      url: new URL(`/order/${product.slug}`, siteUrl).toString(),
      priceCurrency: "AUD",
      price: seo.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    areaServed: {
      "@type": "City",
      name: "Brisbane",
    },
  };

  return (
    <div className="container-shell py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <OrderForm
        session={session}
        firstOrderCookieEligible={firstOrderCookieEligible}
        initialProductType={product.type}
        productPreviewImages={productPreviewImages}
      />
    </div>
  );
}
