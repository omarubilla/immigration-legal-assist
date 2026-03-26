import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { HandHeart, ShieldCheck, Truck } from "lucide-react";
import { sanityFetch } from "@/sanity/lib/live";
import {
  FEATURED_PRODUCTS_QUERY,
  FILTER_PRODUCTS_BY_NAME_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
  FILTER_PRODUCTS_BY_RELEVANCE_QUERY,
} from "@/lib/sanity/queries/products";
import { ALL_CATEGORIES_QUERY } from "@/lib/sanity/queries/categories";
import { ProductSection } from "@/components/app/ProductSection";
import { CategoryTiles } from "@/components/app/CategoryTiles";
import { FeaturedCarousel } from "@/components/app/FeaturedCarousel";
import { FeaturedCarouselSkeleton } from "@/components/app/FeaturedCarouselSkeleton";
import { NewsInlineCarousel } from "@/components/news/NewsInlineCarousel";
import { newsItems } from "@/data/news";
import { hasSanityEnv } from "@/sanity/env";
import type {
  ALL_CATEGORIES_QUERYResult,
  FEATURED_PRODUCTS_QUERYResult,
  FILTER_PRODUCTS_BY_NAME_QUERYResult,
} from "@/sanity.types";
import {
  DEFAULT_SITE_DESCRIPTION,
  getRobotsValue,
  isProteasomeSeoExperiment,
  SITE_NAME,
} from "@/lib/site";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: DEFAULT_SITE_DESCRIPTION,
  robots: getRobotsValue(!isProteasomeSeoExperiment()),
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subcategory?: string;
    color?: string;
    material?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStock?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const searchQuery = params.q ?? "";
  const categorySlug = params.category ?? "";
  const subcategorySlug = params.subcategory ?? "";
  const color = params.color ?? "";
  const material = params.material ?? "";
  const minPrice = Number(params.minPrice) || 0;
  const maxPrice = Number(params.maxPrice) || 0;
  const sort = params.sort ?? "name";
  const inStock = params.inStock === "true";
  let products: FILTER_PRODUCTS_BY_NAME_QUERYResult = [];
  let categories: ALL_CATEGORIES_QUERYResult = [];
  let featuredProducts: FEATURED_PRODUCTS_QUERYResult = [];

  // Select query based on sort parameter
  const getQuery = () => {
    // If searching and sort is relevance, use relevance query
    if (searchQuery && sort === "relevance") {
      return FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
    }

    switch (sort) {
      case "price_asc":
        return FILTER_PRODUCTS_BY_PRICE_ASC_QUERY;
      case "price_desc":
        return FILTER_PRODUCTS_BY_PRICE_DESC_QUERY;
      case "relevance":
        return FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
      default:
        return FILTER_PRODUCTS_BY_NAME_QUERY;
    }
  };

  // Fetch products with filters (server-side via GROQ)
  if (hasSanityEnv) {
    try {
      const [productsResult, categoriesResult, featuredProductsResult] = await Promise.all([
        sanityFetch({
          query: getQuery(),
          params: {
            searchQuery,
            categorySlug,
            subcategorySlug,
            color,
            material,
            minPrice,
            maxPrice,
            inStock,
          },
        }),
        sanityFetch({
          query: ALL_CATEGORIES_QUERY,
        }),
        sanityFetch({
          query: FEATURED_PRODUCTS_QUERY,
        }),
      ]);

      products = productsResult.data;
      categories = categoriesResult.data;
      featuredProducts = featuredProductsResult.data;
    } catch {
      products = [];
      categories = [];
      featuredProducts = [];
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <Suspense fallback={<FeaturedCarouselSkeleton />}>
          <FeaturedCarousel products={featuredProducts} />
        </Suspense>
      )}

      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 xl:grid-cols-3 xl:gap-8">
            <div className="py-2 sm:py-4">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-2xl lg:text-4xl">
                <span className="block">We Provide You</span>
                <span className="mt-2 block text-blue-600 dark:text-blue-400">
                  Custom Biochemical
                </span>
                <span className="mt-2 block">Solutions</span>
              </h2>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Assay development, protein labeling and antibody conjugation,
                expression, and purification.
              </p>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Providing you with unmatched quality, innovation, and a touch of
                genius.
              </p>

              <div className="mt-10">
                <Link
                  href="/services"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all hover:from-sky-500 hover:to-blue-700 hover:shadow-xl sm:px-9 sm:py-4 sm:text-2xl"
                >
                  Custom Order
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-8 py-2 sm:py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-4xl">
                    11
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-lg">
                    Distributors
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-4xl">
                    100+
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-lg">
                    Products
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-4xl">
                    250k+
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-lg">
                    Customers
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <article className="flex items-start gap-4 rounded-3xl bg-zinc-50 p-4 shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900/50 dark:ring-zinc-800">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                      Direct Shipping to Europe
                    </h3>
                    <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-300">
                      For oders over $1,000, 50% off overseas shipments.
                    </p>
                  </div>
                </article>

                <article className="flex items-start gap-4 rounded-3xl bg-zinc-50 p-4 shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900/50 dark:ring-zinc-800">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                      Secure Payment
                    </h3>
                    <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-300">
                      Experience worry-free transactions with our secure payment
                      options.
                    </p>
                  </div>
                </article>

                <article className="flex items-start gap-4 rounded-3xl bg-zinc-50 p-4 shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900/50 dark:ring-zinc-800">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md">
                    <HandHeart className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                      Love to help you
                    </h3>
                    <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-300">
                      Our dedicated team is here to assist you every step of
                      the way.
                    </p>
                  </div>
                </article>
              </div>
            </div>

            <div className="py-2 sm:py-4">
              <NewsInlineCarousel items={newsItems} />
            </div>
          </div>
        </div>
      </section>

      {/* Page Banner */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg:zinc-950">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {categorySlug 
              ? `Shop by Category: ${categories.find((c: { slug?: string | null; title?: string | null }) => c.slug === categorySlug)?.title?.toUpperCase() || categorySlug.toUpperCase()}`
              : "Shop All Products"
            }
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Premium bioproducts for your advanced research.
          </p>
        </div>

        {/* Category Tiles - Full width */}
        <div className="mt-6">
          <CategoryTiles
            categories={categories}
            activeCategory={categorySlug || undefined}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductSection
          categories={categories}
          products={products}
          searchQuery={searchQuery}
        />
      </div>

      <section className="border-t border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-5xl">
                Sign Up for <span className="text-blue-600">Updates</span>
                <br />
                &amp; Newsletter
              </h2>
            </div>

            <form className="w-full" action="#" method="post">
              <div className="flex w-full flex-col gap-3 rounded-full border border-zinc-300 bg-white p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:flex-row sm:items-center">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  placeholder="subscribe@south-bay-bio.com"
                  className="h-12 w-full rounded-full bg-zinc-100 px-5 text-base text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  className="h-12 shrink-0 rounded-full bg-blue-600 px-8 text-lg font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-[#03122D] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <div>
              <h3 className="text-lg font-semibold tracking-tight sm:text-xl">South Bay Bio</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-100/90">
                We offer a variety of custom biochemistry services with an
                emphasis on assay development and custom protein labeling.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-100/90">
                Our goal is to advance into lead identification and provide you
                with the tools and knowledge to succeed.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                Custom Biochemistry
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-100/90">
                <li>
                  Assay design &amp; development: TR-FRET, ELISA, Fluorescence
                  Polarization
                </li>
                <li>
                  Protein &amp; antibody labeling: Maleimide, NHS, Hydrazide
                  coupling &amp; more
                </li>
                <li>
                  Expression &amp; purification: E. coli, Yeast, Insect,
                  Mammalian
                </li>
                <li>
                  Protein characterization, enzyme kinetics, IC50 &amp; Ki
                  determination
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold tracking-tight sm:text-xl">Contact Us</h3>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-100/90">
                <p>
                  <span className="font-semibold">CALL:</span> (415) 935-3226
                </p>
                <p>
                  <span className="font-semibold">General Help:</span>{" "}
                  <a
                    href="mailto:support@south-bay-bio.com"
                    className="text-blue-300 transition-colors hover:text-blue-200"
                  >
                    support@south-bay-bio.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold">Orders and Shipping:</span>{" "}
                  <a
                    href="mailto:orders@south-bay-bio.com"
                    className="text-blue-300 transition-colors hover:text-blue-200"
                  >
                    orders@south-bay-bio.com
                  </a>
                </p>
                <p>
                  5941 Optical Court, Suite 229
                  <br />
                  San Jose, CA 95138
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-5">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-300 sm:text-sm">
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-white"
              >
                Privacy and Cookie Policy
              </Link>
              <a href="#" className="transition-colors hover:text-white">
                Orders and Returns
              </a>
              <Link href="/sitemap" className="transition-colors hover:text-white">
                Sitemap
              </Link>
              <Link href="/terms-of-sale" className="transition-colors hover:text-white">
                Terms of Sale
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-zinc-400 sm:text-sm">
              &copy; 2026 by South Bay Bio LLC
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
