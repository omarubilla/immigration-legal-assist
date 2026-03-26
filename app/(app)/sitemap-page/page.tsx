import type { Metadata } from "next";
import Link from "next/link";
import { getRobotsValue } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sitemap | South Bay Bio",
  description: "Complete sitemap links for south-bay-bio.com.",
  robots: getRobotsValue(false),
};

const ROOT_DOMAIN = "https://www.south-bay-bio.com";
const SITEMAP_INDEX_URL = `${ROOT_DOMAIN}/sitemap.xml`;

function extractLocTags(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1]?.trim())
    .filter((url): url is string => Boolean(url));
}

async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
  const response = await fetch(sitemapUrl, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  return extractLocTags(xml);
}

export default async function SitemapPage() {
  const childSitemaps = await fetchSitemapUrls(SITEMAP_INDEX_URL);
  const childUrls = await Promise.all(childSitemaps.map((url) => fetchSitemapUrls(url)));
  const allUrls = Array.from(new Set(childUrls.flat())).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Home
            </Link>{" "}
            / Sitemap
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-5xl">
            Sitemap
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Complete URL index for {" "}
            <a href={ROOT_DOMAIN} className="underline decoration-zinc-400 underline-offset-4">
              south-bay-bio.com
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <article className="prose max-w-none prose-zinc dark:prose-invert prose-p:leading-7 prose-li:leading-7">
          <h2>All URLs ({allUrls.length})</h2>
          {allUrls.length === 0 ? (
            <p>We could not load sitemap URLs right now. Please try again shortly.</p>
          ) : (
            <ul>
              {allUrls.map((url) => (
                <li key={url}>
                  <Link href={url}>{url}</Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
