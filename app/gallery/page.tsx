import type { Metadata } from "next";
import Link from "next/link";
import { getAllPlans } from "@/lib/db";

export const metadata: Metadata = {
  title: "Art Lesson Plans for Preschool | ArtSpark Gallery",
  description:
    "Browse free art lesson plans for kids ages 4-6. Step-by-step instructions, shopping lists, and classroom tips. New plans added weekly.",
  openGraph: {
    title: "Art Lesson Plans for Preschool | ArtSpark",
    description:
      "Browse free art lesson plans for kids ages 4-6. Step-by-step instructions, shopping lists, and classroom tips.",
    type: "website",
  },
};

const MESS_EMOJI: Record<string, string> = {
  low: "✨",
  medium: "🎨",
  high: "🌈",
};

export default async function GalleryPage() {
  const plans = await getAllPlans();

  return (
    <div className="space-y-6 pb-10">
      <div className="text-center">
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
        >
          Lesson Plan Gallery
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Free art lesson plans for kids ages 4–6. Tap any plan for full
          instructions + shopping list.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            No plans yet. Generate your first one from the{" "}
            <Link href="/" className="font-medium text-crayon-red underline">
              home page
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map((saved) => {
            let plan;
            try {
              plan = JSON.parse(saved.plan_json);
            } catch {
              return null;
            }
            const mess = saved.mess_level || plan.mess_level || "medium";
            const cost = plan.total_estimated_cost || "";
            const tags = (plan.tags || []).slice(0, 4);

            return (
              <Link
                key={saved.id}
                href={`/plan/${saved.id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-gray-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900 leading-tight truncate">
                      {plan.title || saved.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {plan.overview || saved.overview}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <span>
                    {MESS_EMOJI[mess] || "🎨"} {mess}
                  </span>
                  <span>60 min</span>
                  {cost && <span>{cost}</span>}
                </div>

                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* SEO footer */}
      <div className="text-center text-xs text-gray-400 space-y-1">
        <p>
          ArtSpark generates lesson plans using AI. Each plan includes
          step-by-step instructions, a materials shopping list with cost
          estimates, safety notes, and modifications for different ability
          levels.
        </p>
        <p>
          Perfect for preschool art teachers, kindergarten classrooms, daycare
          centers, and homeschool families with kids ages 4–6.
        </p>
      </div>
    </div>
  );
}
