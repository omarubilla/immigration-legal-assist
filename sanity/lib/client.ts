import { createClient } from "next-sanity";

import { apiVersion, dataset, hasSanityEnv, projectId } from "../env";

const fallbackProjectId = "missing-project-id";
const fallbackDataset = "missing-dataset";
const resolvedProjectId = hasSanityEnv ? projectId : fallbackProjectId;
const resolvedDataset = hasSanityEnv ? dataset : fallbackDataset;

// Read-only client (for fetching data)
export const client = createClient({
  projectId: resolvedProjectId,
  dataset: resolvedDataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  perspective: "published",
});

// Write client (for mutations - used in webhooks/server actions)
export const writeClient = createClient({
  projectId: resolvedProjectId,
  dataset: resolvedDataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
