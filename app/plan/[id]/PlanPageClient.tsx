"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LessonPlan from "@/components/LessonPlan";
import PrintView from "@/components/PrintView";
import CarouselPreview from "@/components/CarouselPreview";
import type { LessonPlanData } from "@/lib/claude";
import { generateInstagramCaption, generateCarouselSlides } from "@/lib/social";
import { safeJsonParse } from "@/lib/safe-json";

export default function PlanPageClient({ id }: { id: string }) {
  const [plan, setPlan] = useState<LessonPlanData | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/plans?id=${id}`);
      if (!res.ok) {
        setError("Plan not found");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const result = safeJsonParse<LessonPlanData>(data.plan_json);
      if (!result.ok) {
        setError("Could not load plan data");
        setLoading(false);
        return;
      }
      setPlan(result.data);
      setSourceUrl(data.source_url || undefined);
      if (data.source_image_base64) {
        setImagePreview(
          data.source_image_base64.startsWith("data:")
            ? data.source_image_base64
            : `data:image/jpeg;base64,${data.source_image_base64}`
        );
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function handlePrint() {
    fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: id, event: "print" }),
    }).catch(() => {});
    setShowPrint(true);
    setTimeout(() => window.print(), 200);
    setTimeout(() => setShowPrint(false), 1000);
  }

  async function handleCopyCaption() {
    if (!plan) return;
    const planUrl = `${window.location.origin}/plan/${id}`;
    const caption = generateInstagramCaption(plan, planUrl);
    try {
      await navigator.clipboard.writeText(caption);
      alert("Caption copied! Paste it in Instagram.");
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = caption;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Caption copied! Paste it in Instagram.");
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  if (error || !plan) {
    return (
      <div className="py-12 text-center text-red-500">
        {error || "Plan not found"}
      </div>
    );
  }

  if (showPrint) {
    return <PrintView plan={plan} sourceUrl={sourceUrl} planId={id} />;
  }

  const planUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/plan/${id}`
      : `/plan/${id}`;

  return (
    <div className="space-y-4">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Back to Library
      </Link>

      <LessonPlan
        plan={plan}
        sourceUrl={sourceUrl}
        imagePreview={imagePreview}
        onPrint={handlePrint}
        onCopyCaption={handleCopyCaption}
        onShowCarousel={() => setShowCarousel(!showCarousel)}
        planId={id}
      />

      {showCarousel && (
        <CarouselPreview slides={generateCarouselSlides(plan, planUrl)} planId={id} />
      )}
    </div>
  );
}
