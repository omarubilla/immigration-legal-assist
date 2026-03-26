import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import {
  FILTER_PRODUCTS_BY_NAME_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
  FILTER_PRODUCTS_BY_RELEVANCE_QUERY,
} from "@/lib/sanity/queries/products";
import {
  ALL_CATEGORIES_QUERY,
  CATEGORY_BY_SLUG_QUERY,
} from "@/lib/sanity/queries/categories";
import { ProductSection } from "@/components/app/ProductSection";
import { CategoryTiles } from "@/components/app/CategoryTiles";
import { hasSanityEnv } from "@/sanity/env";

export interface CategorySearchParams {
  q?: string;
  subcategory?: string;
  color?: string;
  material?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  inStock?: string;
}

export interface CategoryPageProps {
  searchParams: Promise<CategorySearchParams>;
}

export async function CategoryPageTemplate({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Promise<CategorySearchParams>;
}) {
  if (!hasSanityEnv) {
    notFound();
  }

  const queryParams = await searchParams;

  const searchQuery = queryParams.q ?? "";
  const subcategorySlug = queryParams.subcategory ?? "";
  const color = queryParams.color ?? "";
  const material = queryParams.material ?? "";
  const minPrice = Number(queryParams.minPrice) || 0;
  const maxPrice = Number(queryParams.maxPrice) || 0;
  const sort = queryParams.sort ?? "name";
  const inStock = queryParams.inStock === "true";

  const getQuery = () => {
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

  const [{ data: category }, { data: categories }, { data: products }] =
    await Promise.all([
      sanityFetch({
        query: CATEGORY_BY_SLUG_QUERY,
        params: { slug },
      }),
      sanityFetch({
        query: ALL_CATEGORIES_QUERY,
      }),
      sanityFetch({
        query: getQuery(),
        params: {
          searchQuery,
          categorySlug: slug,
          subcategorySlug,
          color,
          material,
          minPrice,
          maxPrice,
          inStock,
        },
      }),
    ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Product Category
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            {category.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            Browse products in this category with the same filtering tools as the
            main shop page.
          </p>
        </div>

        <div className="mt-6">
          <CategoryTiles categories={categories} activeCategory={slug} />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductSection
          categories={categories}
          products={products}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
