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
import { NewsCarousel } from "@/components/news/NewsCarousel";
import { newsItems } from "@/data/news";

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
  const { data: products } = await sanityFetch({
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
  });

  // Fetch categories for filter sidebar
  const { data: categories } = await sanityFetch({
    query: ALL_CATEGORIES_QUERY,
  });

  // Fetch featured products for carousel
  const { data: featuredProducts } = await sanityFetch({
    query: FEATURED_PRODUCTS_QUERY,
  });

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
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="py-2 sm:py-4">
              <h2 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
                <span className="block">We Provide You</span>
                <span className="mt-2 block text-blue-600 dark:text-blue-400">
                  Custom Biochemical
                </span>
                <span className="mt-2 block">Solutions</span>
              </h2>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-2xl">
                Assay development, protein labeling and antibody conjugation,
                expression, and purification.
              </p>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-2xl">
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <article className="flex flex-col items-center rounded-3xl bg-zinc-50 p-4 text-center shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900/50 dark:ring-zinc-800">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md">
                    <Truck className="h-5 w-5" />
                  </div>
                  <h3 className="whitespace-nowrap text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                    Fast shipping
                  </h3>
                  <p className="mt-2 h-12 overflow-hidden text-base leading-6 text-zinc-600 dark:text-zinc-300">
                    Enjoy seamless shopping with our worldwide shipping service.
                  </p>
                </article>

                <article className="flex flex-col items-center rounded-3xl bg-zinc-50 p-4 text-center shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900/50 dark:ring-zinc-800">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="whitespace-nowrap text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                    Secure Payment
                  </h3>
                  <p className="mt-2 h-12 overflow-hidden text-base leading-6 text-zinc-600 dark:text-zinc-300">
                    Experience worry-free transactions with our secure payment
                    options.
                  </p>
                </article>

                <article className="flex flex-col items-center rounded-3xl bg-zinc-50 p-4 text-center shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900/50 dark:ring-zinc-800">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md">
                    <HandHeart className="h-5 w-5" />
                  </div>
                  <h3 className="whitespace-nowrap text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                    Love to help you
                  </h3>
                  <p className="mt-2 h-12 overflow-hidden text-base leading-6 text-zinc-600 dark:text-zinc-300">
                    Our dedicated team is here to assist you every step of the
                    way.
                  </p>
                </article>
              </div>
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

      <NewsCarousel items={newsItems} />
    </div>
  );
}
