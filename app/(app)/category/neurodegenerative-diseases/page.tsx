import type { Metadata } from "next";
import {
  CategoryPageTemplate,
  type CategoryPageProps,
} from "../_shared/CategoryPageTemplate";
import { getRobotsValue } from "@/lib/site";

export const metadata: Metadata = {
  robots: getRobotsValue(true),
};

export default async function NeurodegenerativeDiseasesPage({
  searchParams,
}: CategoryPageProps) {
  return CategoryPageTemplate({
    slug: "neurodegenerative-diseases",
    searchParams,
  });
}
