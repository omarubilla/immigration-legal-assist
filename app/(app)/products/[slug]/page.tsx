import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCT_BY_SLUG_QUERY } from "@/lib/sanity/queries/products";
import { ProductGallery } from "@/components/app/ProductGallery";
import { ProductInfo } from "@/components/app/ProductInfo";
import {
  buildAbsoluteUrl,
  getRobotsValue,
  isProteasomeSeoExperiment,
  SITE_NAME,
} from "@/lib/site";
import { hasSanityEnv } from "@/sanity/env";
import type { PRODUCT_BY_SLUG_QUERYResult } from "@/sanity.types";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

type Product = NonNullable<PRODUCT_BY_SLUG_QUERYResult>;

const getProduct = cache(async (slug: string): Promise<Product | null> => {
  if (!hasSanityEnv) {
    return null;
  }

  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });

  return product;
});

function getProductDescription(product: Product) {
  if (product.description?.trim()) {
    return product.description.trim();
  }

  const specParts = [
    product.quantity && `Quantity: ${product.quantity}`,
    product.purity && `Purity: ${product.purity}`,
    product.molecularWeight && `Molecular Weight: ${product.molecularWeight}`,
    product.storage && `Storage: ${product.storage}`,
  ].filter(Boolean);

  if (specParts.length > 0) {
    return `${product.name ?? "Product"} from ${SITE_NAME}. ${specParts.join(". ")}.`;
  }

  return `${product.name ?? "Product"} from ${SITE_NAME} for research and development use.`;
}

function getProductImageUrls(product: Product) {
  return (
    product.images
      ?.flatMap((image) => (image.asset?.url ? [image.asset.url] : [])) ?? []
  );
}

function getProductUrl(slug: string) {
  return buildAbsoluteUrl(`/products/${slug}`);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: `Product Not Found | ${SITE_NAME}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const productName = product.name ?? "Product";
  const description = getProductDescription(product);
  const imageUrls = getProductImageUrls(product);
  const shouldIndex =
    !isProteasomeSeoExperiment() || product.category?.slug === "proteasome";

  return {
    title: `${productName} | ${SITE_NAME}`,
    description,
    robots: getRobotsValue(shouldIndex),
    alternates: {
      canonical: `/products/${product.slug ?? slug}`,
    },
    openGraph: {
      type: "website",
      url: getProductUrl(product.slug ?? slug),
      title: `${productName} | ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
      images: imageUrls.map((url) => ({
        url,
        alt: productName,
      })),
    },
    twitter: {
      card: imageUrls.length > 0 ? "summary_large_image" : "summary",
      title: `${productName} | ${SITE_NAME}`,
      description,
      images: imageUrls,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const productName = product.name ?? "Product";
  const description = getProductDescription(product);
  const productUrl = getProductUrl(product.slug ?? slug);
  const imageUrls = getProductImageUrls(product);
  const shouldIndex =
    !isProteasomeSeoExperiment() || product.category?.slug === "proteasome";
  const additionalProperty = [
    product.quantity && {
      "@type": "PropertyValue",
      name: "Quantity",
      value: product.quantity,
    },
    product.purity && {
      "@type": "PropertyValue",
      name: "Purity",
      value: product.purity,
    },
    product.molecularWeight && {
      "@type": "PropertyValue",
      name: "Molecular Weight",
      value: product.molecularWeight,
    },
    product.storage && {
      "@type": "PropertyValue",
      name: "Storage",
      value: product.storage,
    },
    product.storageBuffer && {
      "@type": "PropertyValue",
      name: "Storage Buffer",
      value: product.storageBuffer,
    },
  ].filter(Boolean);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description,
    sku: product._id,
    image: imageUrls,
    category: product.category?.title,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price ?? 0,
      availability:
        (product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: productUrl,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    additionalProperty,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {shouldIndex && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  );
}
