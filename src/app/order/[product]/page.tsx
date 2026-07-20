import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { OrderForm } from "@/components/forms/order-form";
import { getProductGalleryPreview } from "@/lib/data";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { productCatalog } from "@/lib/products";

type ProductOrderPageProps = {
  params: Promise<{
    product: string;
  }>;
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
    return {
      title: "Order",
    };
  }

  return {
    title: `Order ${product.title}`,
    description: `Reserve your ${product.title} and continue to secure checkout.`,
  };
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

  return (
    <div className="container-shell py-10 md:py-16">
      <OrderForm
        session={session}
        firstOrderCookieEligible={firstOrderCookieEligible}
        initialProductType={product.type}
        productPreviewImages={productPreviewImages}
      />
    </div>
  );
}
