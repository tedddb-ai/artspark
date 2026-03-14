import type { Metadata } from "next";
import { getPlan } from "@/lib/db";
import PlanPageClient from "./PlanPageClient";
import type { LessonPlanData } from "@/lib/claude";

interface Props {
  params: Promise<{ id: string }>;
}

async function loadPlan(id: string): Promise<LessonPlanData | null> {
  try {
    const saved = await getPlan(id);
    if (!saved) return null;
    return JSON.parse(saved.plan_json);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const plan = await loadPlan(id);

  const title = plan ? `${plan.title} | ArtSpark` : "Lesson Plan | ArtSpark";
  const ogTitle = plan?.title || "ArtSpark Lesson Plan";
  const description =
    plan?.overview?.slice(0, 160) ||
    "Turn art inspiration into classroom-ready lesson plans";

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

function buildJsonLd(plan: LessonPlanData, id: string) {
  const baseUrl = "https://artspark-alpha.vercel.app";

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: plan.title,
    description: plan.overview,
    totalTime: "PT60M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: plan.total_estimated_cost?.replace(/[^0-9.]/g, "") || "0",
    },
    supply: (plan.materials || []).map((m) => ({
      "@type": "HowToSupply",
      name: m.item,
      estimatedCost: m.estimated_cost,
    })),
    tool: [
      { "@type": "HowToTool", name: "Smocks or old t-shirts" },
      { "@type": "HowToTool", name: "Table coverings" },
    ],
    step: (plan.step_by_step_instructions || []).map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
    image: `${baseUrl}/api/og/${id}`,
    url: `${baseUrl}/plan/${id}`,
    author: {
      "@type": "Organization",
      name: "ArtSpark by Little Bay Arts & Crafts",
      url: baseUrl,
    },
    educationalLevel: "Preschool",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "teacher",
    },
    keywords: plan.tags?.join(", ") || "",
  };
}

export default async function PlanPage({ params }: Props) {
  const { id } = await params;
  const plan = await loadPlan(id);

  return (
    <>
      {plan && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLd(plan, id)),
          }}
        />
      )}
      <PlanPageClient id={id} />
    </>
  );
}
