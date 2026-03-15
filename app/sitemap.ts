import type { MetadataRoute } from "next";
import { getAllPlans } from "@/lib/db";

const BASE_URL = "https://artspark-alpha.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const plans = await getAllPlans();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/homeschool`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/gallery`, changeFrequency: "daily", priority: 0.8 },
  ];

  const planPages: MetadataRoute.Sitemap = plans.map((p) => ({
    url: `${BASE_URL}/plan/${p.id}`,
    lastModified: p.updated_at || p.created_at || new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...planPages];
}
