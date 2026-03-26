export const SITE_NAME = "South Bay Bio";

export const DEFAULT_SITE_DESCRIPTION =
  "Biotech reagents, proteasome assay kits, and custom biochemical solutions for research and drug discovery.";

const PRODUCTION_SITE_URL = "https://www.south-bay-bio.com";

export type SeoExperimentScope = "proteasome" | "full";

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    PRODUCTION_SITE_URL;

  return configuredUrl.replace(/\/$/, "");
}

export function getSeoExperimentScope(): SeoExperimentScope {
  if (process.env.SEO_EXPERIMENT_SCOPE === "proteasome") {
    return "proteasome";
  }

  return "full";
}

export function isProteasomeSeoExperiment() {
  return getSeoExperimentScope() === "proteasome";
}

export function getRobotsValue(shouldIndex: boolean) {
  return {
    index: shouldIndex,
    follow: shouldIndex,
  };
}

export function buildAbsoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}