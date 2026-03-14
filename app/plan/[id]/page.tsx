import type { Metadata } from "next";
import { getPlan } from "@/lib/db";
import PlanPageClient from "./PlanPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  let title = "Lesson Plan | ArtSpark";
  let description = "Turn art inspiration into classroom-ready lesson plans";
  let ogTitle = title;

  try {
    const saved = await getPlan(id);
    if (saved) {
      const plan = JSON.parse(saved.plan_json);
      title = `${plan.title} | ArtSpark`;
      ogTitle = plan.title;
      description =
        plan.overview?.slice(0, 160) || description;
    }
  } catch {
    // Use defaults
  }

  const ogImageUrl = `/api/og/${id}`;

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PlanPage({ params }: Props) {
  const { id } = await params;
  return <PlanPageClient id={id} />;
}
