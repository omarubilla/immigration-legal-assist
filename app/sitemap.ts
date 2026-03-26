import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { hasSanityEnv } from "@/sanity/env";
import { buildAbsoluteUrl, isProteasomeSeoExperiment } from "@/lib/site";

type ProductSitemapEntry = {
  slug: string;
  updatedAt: string;
};

const FULL_STATIC_ROUTES = [
  { path: "/", changeFrequency: "daily" as const, priority: 1 },
  { path: "/services", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/proteasome", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "/terms-of-sale", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "/sitemap", changeFrequency: "monthly" as const, priority: 0.1 },
  {
    path: "/category/c-terminal-derivatives",
    changeFrequency: "weekly" as const,
    priority: 0.7,
  },
  { path: "/category/chains", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/category/e3-ligases", changeFrequency: "weekly" as const, priority: 0.7 },
  {
    path: "/category/neurodegenerative-diseases",
    changeFrequency: "weekly" as const,
    priority: 0.7,
  },
  { path: "/category/proteasome", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/category/tr-fret", changeFrequency: "weekly" as const, priority: 0.7 },
  {
    path: "/category/ub-conjugation",
    changeFrequency: "weekly" as const,
    priority: 0.7,
  },
  {
    path: "/category/ub-deconjugation",
    changeFrequency: "weekly" as const,
    priority: 0.7,
  },
];

const PROTEASOME_EXPERIMENT_ROUTES = [
  { path: "/proteasome", changeFrequency: "weekly" as const, priority: 0.9 },
  {
    path: "/category/proteasome",
    changeFrequency: "weekly" as const,
    priority: 0.9,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const proteasomeOnly = isProteasomeSeoExperiment();
  const products = hasSanityEnv
    ? await client.fetch<ProductSitemapEntry[]>(`
        *[_type == "product" && defined(slug.current) ${proteasomeOnly ? '&& category->slug.current == "proteasome"' : ""}] | order(_updatedAt desc) {
          "slug": slug.current,
          "updatedAt": _updatedAt
        }
      `)
    : [];

  const dedupedProducts = Array.from(
    products.reduce((entries, product) => {
      const existing = entries.get(product.slug);

      if (!existing || new Date(product.updatedAt) > new Date(existing.updatedAt)) {
        entries.set(product.slug, product);
      }

      return entries;
    }, new Map<string, ProductSitemapEntry>()).values()
  );

  const now = new Date();
  const staticRoutes = proteasomeOnly
    ? PROTEASOME_EXPERIMENT_ROUTES
    : FULL_STATIC_ROUTES;

  return [
    ...staticRoutes.map((route) => ({
      url: buildAbsoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...dedupedProducts.map((product) => ({
      url: buildAbsoluteUrl(`/products/${product.slug}`),
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}