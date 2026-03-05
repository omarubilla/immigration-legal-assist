"use client";

import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { NewsCard } from "@/components/news/NewsCard";
import type { NewsItem } from "@/data/news";
import { cn } from "@/lib/utils";

interface NewsCarouselProps {
  title?: string;
  subtitle?: string;
  items: NewsItem[];
}

export function NewsCarousel({
  title = "Research Highlights",
  subtitle = "Latest updates from the South Bay Bio ecosystem, from regenerative peptide science to high-purity reagent workflows.",
  items,
}: NewsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="news-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              News
            </p>
            <h2
              id="news-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="relative mt-6">
          <Carousel
            setApi={setApi}
            opts={{
              loop: true,
              align: "start",
            }}
            plugins={[
              Autoplay({
                delay: 6000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="focus-within:outline-none"
            aria-label="News and research highlights carousel"
            tabIndex={0}
          >
            <CarouselContent className="-ml-4">
              {items.map((item) => (
                <CarouselItem
                  key={item.title}
                  className="pl-4 sm:basis-1/2 lg:basis-1/3"
                >
                  <NewsCard item={item} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-2 top-40 border-zinc-200 bg-white/90 text-zinc-700 shadow-sm backdrop-blur-sm hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:-left-4" />
            <CarouselNext className="right-2 top-40 border-zinc-200 bg-white/90 text-zinc-700 shadow-sm backdrop-blur-sm hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:-right-4" />
          </Carousel>

          {items.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2" aria-label="Select news slide">
              {items.map((item, index) => (
                <button
                  key={`news-dot-${item.title}`}
                  type="button"
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    current === index
                      ? "w-6 bg-teal-500"
                      : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600",
                  )}
                  aria-label={`Go to news slide ${index + 1}`}
                  aria-current={current === index ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
