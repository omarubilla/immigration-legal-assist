import type { Metadata } from "next";
import {
  CategoryPageTemplate,
  type CategoryPageProps,
} from "../_shared/CategoryPageTemplate";
import { getRobotsValue } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proteasome Category | South Bay Bio",
  description:
    "Browse South Bay Bio proteasome reagents, immunoproteasomes, and assay kits.",
  alternates: {
    canonical: "/category/proteasome",
  },
  robots: getRobotsValue(true),
};

export default async function ProteasomePage({
  searchParams,
}: CategoryPageProps) {
  return CategoryPageTemplate({
    slug: "proteasome",
    searchParams,
  });
}
