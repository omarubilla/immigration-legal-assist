import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { NewsItem } from "@/data/news";

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  return (
    <Card className="group h-full overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-sm ring-1 ring-zinc-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10 dark:hover:shadow-zinc-950/40">
      <Link href={item.link} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-linear-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900">
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      <CardContent className="flex grow flex-col gap-3 p-5">
        <Badge
          variant="secondary"
          className="w-fit bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300"
        >
          {item.tag}
        </Badge>
        <Link href={item.link} className="block">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
            {item.title}
          </h3>
        </Link>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {item.description}
        </p>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0">
        <Link
          href={item.link}
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-zinc-100 dark:hover:text-blue-300 dark:focus-visible:ring-offset-zinc-900"
        >
          Read more
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
